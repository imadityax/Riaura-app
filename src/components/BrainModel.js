import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { loadGLTF } from './gltfLoader';

// ─────────────────────────────────────────────────────────────────────────────
// BrainModel — the real 3D brain (assets/models/brain_areas.glb) rendered in
// a transparent GL canvas with a slow "neuro" auto-rotation and purple-tinted
// studio lighting. Loading goes through the shared gltfLoader (cached parse;
// every instance clones the same scene and shares its geometry).
// ─────────────────────────────────────────────────────────────────────────────

const MODEL = require('../../assets/models/brain_areas.glb');

// Normalise a fresh clone: known size, centred on the origin.
function prepareScene(gltf) {
  const s = gltf.scene.clone(true);
  const box = new THREE.Box3().setFromObject(s);
  const dims = box.getSize(new THREE.Vector3());
  const scale = 1.85 / Math.max(dims.x, dims.y, dims.z);
  s.scale.setScalar(scale);
  box.setFromObject(s);
  const centre = box.getCenter(new THREE.Vector3());
  s.position.sub(centre);
  return s;
}

function Brain({ spin = 0.5 }) {
  const group = useRef();
  const [gltf, setGltf] = useState(null);

  useEffect(() => {
    let alive = true;
    loadGLTF(MODEL)
      .then(g => { if (alive) setGltf(g); })
      .catch(err => console.warn('Brain model failed to load:', err?.message || err));
    return () => { alive = false; };
  }, []);

  const scene = useMemo(() => (gltf ? prepareScene(gltf) : null), [gltf]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * spin;
  });

  if (!scene) return null;
  return (
    <group ref={group} rotation={[0.12, -0.6, 0]}>
      <primitive object={scene} />
    </group>
  );
}

export default function BrainModel({ size = 180, spin = 0.5, style }) {
  return (
    <View style={[{ width: size, height: size }, style]} pointerEvents="none">
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.15, 2.5], fov: 42 }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);   // fully transparent backdrop
          scene.background = null;
        }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[2.5, 3, 4]} intensity={1.5} color="#FFFFFF" />
        <directionalLight position={[-3, 1, -2]} intensity={0.5} color="#C4B5FD" />
        <pointLight position={[-2.5, -1.5, 2.5]} intensity={0.9} color="#8B5CF6" />
        <Brain spin={spin} />
      </Canvas>
    </View>
  );
}
