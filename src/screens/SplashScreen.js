import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { loadGLTF } from '../components/gltfLoader';
import { storage } from '../utils/storage';
import { rf } from '../utils/responsive';
import { useAuth } from '../context/AuthContext';
import { getUserData } from '../firebase/firestore';

const { width: W, height: H } = Dimensions.get('window');

const HOLOGRAM = require('../../assets/models/brain_hologram.glb');
const SND_ASSEMBLE = require('../../assets/sounds/assemble.wav');
const SND_ZOOM     = require('../../assets/sounds/zoomout.wav');

// Timeline (seconds from the moment the model is ready)
const T_ASSEMBLE_END = 2.2;   // particles fly in and lock — camera in close
const T_ZOOM_END     = 3.4;   // camera pulls back to reveal the full brain
const T_NAVIGATE_MS  = 5200;  // leave the splash
const T_FALLBACK_MS  = 10000; // never trap the user if the model stalls

const CAM_NEAR = 1.9;         // zoomed-in distance during assembly
const CAM_FAR  = 3.8;         // final distance after the pull-back

const smooth = t => t * t * (3 - 2 * t);
const clamp01 = v => Math.max(0, Math.min(1, v));

// ── Hologram stage ───────────────────────────────────────────────────────────
// Brain dead-centre. Assembles from particles under a close camera, then the
// camera dollies out (with a whoosh) to reveal the full hologram: duotone
// particle clusters, a firing neuron web inside, gyro rings and a projector
// cone — all with a holographic flicker.
const BRAIN_SIZE   = 1.05;
const SCATTER_DIST = 1.0;
const TINTS = { Particle_1: '#B79CFF', Particle_2: '#7DE3FF' };

const NEURON_COUNT = 44;
const IMPULSE_COUNT = 6;

function HologramStage({ started, onReady }) {
  const brain    = useRef();
  const ringA    = useRef();
  const ringB    = useRef();
  const rigMats  = useRef([]);
  const neuronMats = useRef([]);
  const impulseRefs = useRef([]);
  const impulses = useRef(null);
  const [parts, setParts] = useState(null);
  const elapsed = useRef(0);

  // Neuron web: points inside the brain volume + links between neighbours.
  const web = useMemo(() => {
    const pts = [];
    for (let i = 0; i < NEURON_COUNT; i++) {
      const v = new THREE.Vector3().randomDirection()
        .multiplyScalar(Math.cbrt(Math.random()) * 0.46);
      v.y *= 0.78;                              // brain-ish ellipsoid
      pts.push(v);
    }
    const links = [];
    for (let i = 0; i < pts.length && links.length < 64; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (pts[i].distanceTo(pts[j]) < 0.26) links.push([i, j]);
      }
    }
    const pos = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => p.toArray(pos, i * 3));
    const linePos = new Float32Array(links.length * 6);
    links.forEach(([a, b], i) => {
      pts[a].toArray(linePos, i * 6);
      pts[b].toArray(linePos, i * 6 + 3);
    });
    return { pts, links, pos, linePos };
  }, []);

  useEffect(() => {
    impulses.current = Array.from({ length: IMPULSE_COUNT }, (_, i) => ({
      link: web.links.length ? i % web.links.length : 0,
      t: Math.random(),
      speed: 0.9 + Math.random() * 1.3,
    }));
  }, [web]);

  useEffect(() => {
    let alive = true;
    loadGLTF(HOLOGRAM)
      .then(gltf => {
        if (!alive) return;
        const scene = gltf.scene.clone(true);

        const box = new THREE.Box3().setFromObject(scene);
        const dims = box.getSize(new THREE.Vector3());
        scene.scale.setScalar(BRAIN_SIZE / Math.max(dims.x, dims.y, dims.z));
        box.setFromObject(scene);
        scene.position.sub(box.getCenter(new THREE.Vector3()));

        const collected = [];
        scene.traverse(obj => {
          if (!obj.isMesh) return;
          obj.geometry.computeBoundingBox();
          const centre = obj.geometry.boundingBox.getCenter(new THREE.Vector3());
          let dir = centre.clone().normalize();
          if (!isFinite(dir.x) || dir.length() < 0.1) {
            dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          }
          const mat = obj.material.clone();
          mat.transparent = true;
          const tint = TINTS[obj.material.name];
          if (tint && mat.color) mat.color.set(tint);
          obj.material = mat;
          collected.push({
            mesh: obj,
            home: obj.position.clone(),
            dir,
            axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
            tumble: (Math.random() - 0.5) * 2.4,
            baseOpacity: mat.opacity ?? 1,
            homeQuat: obj.quaternion.clone(),
          });
        });

        setParts({ scene, collected });
        onReady?.();
      })
      .catch(err => console.warn('Hologram failed to load:', err?.message || err));
    return () => { alive = false; };
  }, []);

  useFrame((state, delta) => {
    if (!parts || !brain.current) return;
    if (started) elapsed.current += delta;
    const t = elapsed.current;

    const assembleP = smooth(clamp01(t / T_ASSEMBLE_END));
    const zoomP     = smooth(clamp01((t - T_ASSEMBLE_END) / (T_ZOOM_END - T_ASSEMBLE_END)));
    const scatter = 1 - assembleP;
    const fade = assembleP;
    const flicker = 0.86 + 0.14 * Math.sin(t * 26 + Math.sin(t * 7) * 3);

    // camera: close-up during assembly, smooth dolly out on the whoosh
    state.camera.position.z = CAM_NEAR + (CAM_FAR - CAM_NEAR) * zoomP;
    state.camera.position.y = 0.05 + 0.05 * zoomP;
    state.camera.lookAt(0, 0, 0);

    const q = new THREE.Quaternion();
    for (const p of parts.collected) {
      p.mesh.position.copy(p.home).addScaledVector(p.dir, scatter * SCATTER_DIST);
      q.setFromAxisAngle(p.axis, scatter * p.tumble);
      p.mesh.quaternion.copy(p.homeQuat).premultiply(q);
      p.mesh.material.opacity = p.baseOpacity * (0.08 + 0.92 * fade) * flicker;
    }

    // centred brain: slow spin + gentle hover once assembled
    brain.current.rotation.y += delta * (0.28 + scatter * 0.4);
    brain.current.position.y = Math.sin(t * 1.5) * 0.04 * assembleP;

    // neuron web pulses inside the brain
    const neuronGlow = fade * (0.55 + 0.45 * Math.sin(t * 4.2));
    neuronMats.current.forEach(({ mat, base }) => { mat.opacity = base * neuronGlow * flicker; });

    // impulses travel along random links
    if (impulses.current && web.links.length) {
      impulses.current.forEach((imp, i) => {
        imp.t += delta * imp.speed;
        if (imp.t >= 1) {
          imp.t = 0;
          imp.link = Math.floor(Math.random() * web.links.length);
        }
        const [a, b] = web.links[imp.link];
        const ref = impulseRefs.current[i];
        if (ref) {
          ref.position.lerpVectors(web.pts[a], web.pts[b], imp.t);
          ref.material.opacity = fade * flicker * Math.sin(Math.PI * imp.t);
        }
      });
    }

    if (ringA.current) ringA.current.rotation.z += delta * 0.7;
    if (ringB.current) ringB.current.rotation.z -= delta * 0.95;
    const rigOpacity = (0.25 + 0.75 * fade) * flicker * (0.35 + 0.65 * zoomP);
    rigMats.current.forEach(({ mat, base }) => { mat.opacity = base * rigOpacity; });
  });

  const rigMat    = base => mat => { if (mat) rigMats.current.push({ mat, base }); };
  const neuronMat = base => mat => { if (mat) neuronMats.current.push({ mat, base }); };

  if (!parts) return null;
  return (
    <group>
      {/* the particle brain — dead centre */}
      <group ref={brain} rotation={[0.1, 0, 0]}>
        <primitive object={parts.scene} />

        {/* neurons: glowing nodes, synapse lines, travelling impulses */}
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[web.pos, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={neuronMat(0.9)}
            size={0.032} sizeAttenuation color="#BFF3FF"
            transparent depthWrite={false} blending={THREE.AdditiveBlending}
          />
        </points>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[web.linePos, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            ref={neuronMat(0.28)}
            color="#7DE3FF" transparent depthWrite={false} blending={THREE.AdditiveBlending}
          />
        </lineSegments>
        {Array.from({ length: IMPULSE_COUNT }, (_, i) => (
          <mesh key={i} ref={r => { impulseRefs.current[i] = r; }}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#FFFFFF" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
        ))}

        {/* gyro rings ride with the brain */}
        <mesh ref={ringA} rotation={[1.25, 0.2, 0]}>
          <torusGeometry args={[0.72, 0.006, 8, 96]} />
          <meshBasicMaterial ref={rigMat(0.55)} color="#A78BFA" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh ref={ringB} rotation={[-1.05, -0.35, 0]}>
          <torusGeometry args={[0.60, 0.005, 8, 96]} />
          <meshBasicMaterial ref={rigMat(0.4)} color="#7DE3FF" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* projector rig below — revealed by the zoom-out */}
      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.58, 0.06, 1.15, 32, 1, true]} />
        <meshBasicMaterial ref={rigMat(0.09)} color="#8B5CF6" transparent depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, -1.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.16, 40]} />
        <meshBasicMaterial ref={rigMat(0.85)} color="#C4B5FD" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0, -1.435, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.44, 48]} />
        <meshBasicMaterial ref={rigMat(0.2)} color="#8B5CF6" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// ── Cosmic backdrop: stars + nebulas ─────────────────────────────────────────
function NeuralSpace() {
  const stars = useRef(
    Array.from({ length: 70 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: Math.random() * 2.2 + 0.8,
      o: Math.random() * 0.5 + 0.15,
      tint: Math.random() > 0.75 ? '#9FE8FF' : '#E9E2FF',
    }))
  ).current;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.nebulaCyan} />
      <View style={styles.nebulaPurple} />
      {stars.map((st, i) => (
        <View key={i} style={{
          position: 'absolute', left: st.x, top: st.y,
          width: st.s, height: st.s, borderRadius: st.s,
          backgroundColor: st.tint, opacity: st.o,
        }} />
      ))}
    </View>
  );
}

// ── Splash screen ────────────────────────────────────────────────────────────
export default function SplashScreen({ navigation }) {
  const { currentUser, loading } = useAuth();
  const [modelReady, setModelReady] = useState(false);
  const [sequenceDone, setSequenceDone] = useState(false);
  const players = useRef(null);
  const letters = useRef('RIAURA'.split('').map(() => new Animated.Value(0))).current;
  const statusFade  = useRef(new Animated.Value(0)).current;   // "Initializing…"
  const statusPulse = useRef(new Animated.Value(0)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;   // final tagline

  // Sounds
  useEffect(() => {
    try {
      setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
      players.current = {
        assemble: createAudioPlayer(SND_ASSEMBLE),
        zoom: createAudioPlayer(SND_ZOOM),
      };
    } catch (e) { /* audio is a nice-to-have — never block the splash */ }
    return () => {
      try {
        players.current?.assemble.remove();
        players.current?.zoom.remove();
      } catch (e) {}
    };
  }, []);

  // Letter cascade + pulsing status line
  useEffect(() => {
    Animated.stagger(90, letters.map(v =>
      Animated.spring(v, { toValue: 1, useNativeDriver: true, speed: 12, bounciness: 10 })
    )).start();
    Animated.timing(statusFade, { toValue: 1, duration: 500, delay: 500, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(statusPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(statusPulse, { toValue: 0, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);

  // Timeline anchored to the model being ready: sounds, text swap, exit.
  useEffect(() => {
    if (!modelReady) return;
    try { players.current?.assemble.play(); } catch (e) {}
    const tZoom = setTimeout(() => {
      try { players.current?.zoom.play(); } catch (e) {}
    }, T_ASSEMBLE_END * 1000);
    const tTagline = setTimeout(() => {
      Animated.timing(statusFade, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      Animated.timing(taglineFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
    }, T_ZOOM_END * 1000 - 200);
    const tDone = setTimeout(() => setSequenceDone(true), T_NAVIGATE_MS);
    return () => { clearTimeout(tZoom); clearTimeout(tTagline); clearTimeout(tDone); };
  }, [modelReady]);

  // Fallback: if the model never loads, move on anyway.
  useEffect(() => {
    const t = setTimeout(() => setSequenceDone(true), T_FALLBACK_MS);
    return () => clearTimeout(t);
  }, []);

  // Navigate once the show is over AND auth state is known.
  useEffect(() => {
    if (!sequenceDone || loading) return;
    (async () => {
      if (!currentUser) {
        navigation.replace('Auth');
        return;
      }
      const data = await getUserData(currentUser.uid);
      const phase = data?.phase ?? 0;
      if (phase >= 4) {
        const scores = await storage.getScores();
        navigation.replace('FinalReport', { scores });
      } else {
        navigation.replace('Main');
      }
    })();
  }, [sequenceDone, loading, currentUser]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0620" />
      <LinearGradient colors={['#0B0620', '#1B1145', '#060312']} style={StyleSheet.absoluteFill} />
      <NeuralSpace />

      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.05, CAM_NEAR], fov: 45 }}
        style={StyleSheet.absoluteFill}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 3, 4]} intensity={1.2} color="#C4B5FD" />
        <pointLight position={[-3, -1, 2]} intensity={1.4} color="#8B5CF6" />
        <HologramStage started={modelReady} onReady={() => setModelReady(true)} />
      </Canvas>

      {/* brand + copy */}
      <View style={styles.brandBlock} pointerEvents="none">
        <View style={styles.lettersRow}>
          {'RIAURA'.split('').map((ch, i) => (
            <Animated.Text
              key={i}
              style={[styles.letter, {
                opacity: letters[i],
                transform: [
                  { translateY: letters[i].interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) },
                  { scale: letters[i].interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                ],
              }]}
            >
              {ch}
            </Animated.Text>
          ))}
        </View>

        <View style={styles.copyBlock}>
          <Animated.Text
            style={[styles.status, {
              opacity: Animated.multiply(
                statusFade,
                statusPulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] })
              ),
            }]}
          >
            INITIALIZING COGNITIVE DISCOVERY…
          </Animated.Text>
          <Animated.View style={[styles.taglineWrap, { opacity: taglineFade }]}>
            <Text style={styles.tagline}>Welcome to the Universe Inside You.</Text>
            <Text style={styles.taglineSub}>Every neuron tells a story. Let's discover yours.</Text>
          </Animated.View>
        </View>
      </View>

      <Text style={styles.footer}>Class 1 Operational Architecture</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  nebulaCyan: {
    position: 'absolute', top: -W * 0.3, left: -W * 0.35,
    width: W * 0.95, height: W * 0.95, borderRadius: W * 0.48,
    backgroundColor: 'rgba(125,227,255,0.07)',
  },
  nebulaPurple: {
    position: 'absolute', bottom: -W * 0.25, right: -W * 0.3,
    width: W * 1.05, height: W * 1.05, borderRadius: W * 0.53,
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  brandBlock: { position: 'absolute', bottom: '11%', alignSelf: 'center', alignItems: 'center', width: '100%' },
  lettersRow: { flexDirection: 'row' },
  letter: {
    fontSize: rf(38), fontWeight: '900', color: '#EDE7FF',
    letterSpacing: 10, textShadowColor: 'rgba(139,92,246,0.8)', textShadowRadius: 18,
  },
  copyBlock: { height: 64, marginTop: 12, alignItems: 'center', justifyContent: 'flex-start', width: '100%' },
  status: {
    position: 'absolute', top: 6,
    fontSize: 11.5, fontWeight: '700', letterSpacing: 2.5, color: '#7DE3FF',
  },
  taglineWrap: { position: 'absolute', top: 0, alignItems: 'center', paddingHorizontal: 28 },
  tagline: { fontSize: rf(16.5), fontWeight: '800', color: '#F1EDFF', textAlign: 'center' },
  taglineSub: { fontSize: rf(12.5), color: '#B4A5EE', marginTop: 7, textAlign: 'center' },
  footer: { position: 'absolute', bottom: 30, alignSelf: 'center', fontSize: 11, color: 'rgba(180,165,238,0.5)' },
});
