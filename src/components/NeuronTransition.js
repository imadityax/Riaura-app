import React, { useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Brain3D from './Brain3D';

const { width: W, height: H } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────────────────
// NeuronTransition — the page-swap interstitial.
// A soft light veil rises over the outgoing page; the brain sits at the
// centre with its glow while two counter-rotating rings of neurons orbit it;
// everything melts away as the new page settles (~820ms total).
// Every layer animates on the native driver (opacity / rotate / scale only),
// so the effect stays butter-smooth alongside the screen slide.
// Mount once above the NavigationContainer and call ref.play() on navigation.
// ─────────────────────────────────────────────────────────────────────────────

const PURPLE = '#8B5CF6';
const BRAIN  = 128;          // brain art size
const RING_A = 210;          // outer ring diameter
const RING_B = 158;          // inner ring diameter

// Neurons on each orbit: angle (deg), dot size, opacity.
const ORBIT_A = [
  { a: 0,   s: 9,  o: 1    }, { a: 55,  s: 5, o: 0.55 }, { a: 110, s: 7, o: 0.85 },
  { a: 165, s: 4,  o: 0.5  }, { a: 220, s: 8, o: 0.9  }, { a: 275, s: 5, o: 0.6  },
  { a: 320, s: 6,  o: 0.75 },
];
const ORBIT_B = [
  { a: 30,  s: 6, o: 0.9 }, { a: 120, s: 4, o: 0.55 }, { a: 200, s: 7, o: 1 },
  { a: 290, s: 5, o: 0.7 },
];

function Ring({ diameter, dots, spin, direction = 1, color = PURPLE }) {
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: direction > 0 ? ['0deg', '160deg'] : ['0deg', '-200deg'],
  });
  const r = diameter / 2;
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, {
        width: diameter, height: diameter, borderRadius: r,
        marginLeft: -r, marginTop: -r,
        transform: [{ rotate }],
      }]}
    >
      {dots.map((d, i) => {
        const rad = (d.a * Math.PI) / 180;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: r + (r - 4) * Math.cos(rad) - d.s / 2,
              top:  r + (r - 4) * Math.sin(rad) - d.s / 2,
              width: d.s, height: d.s, borderRadius: d.s / 2,
              backgroundColor: color, opacity: d.o,
              shadowColor: color, shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.9, shadowRadius: 5, elevation: 3,
            }}
          />
        );
      })}
    </Animated.View>
  );
}

const NeuronTransition = forwardRef(function NeuronTransition(_, ref) {
  const fade  = useRef(new Animated.Value(0)).current;  // veil + content opacity
  const spin  = useRef(new Animated.Value(0)).current;  // orbit clock
  const grow  = useRef(new Animated.Value(0)).current;  // brain scale-in
  const [visible, setVisible] = useState(false);
  const running = useRef(false);

  useImperativeHandle(ref, () => ({
    play() {
      if (running.current) return;           // never stack bursts
      running.current = true;
      setVisible(true);
      fade.setValue(0);
      spin.setValue(0);
      grow.setValue(0);

      Animated.parallel([
        // one continuous, eased orbit across the whole interstitial
        Animated.timing(spin, { toValue: 1, duration: 820, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        // brain breathes in with a gentle spring
        Animated.spring(grow, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 9 }),
        // veil: quick rise → brief hold → soft melt
        Animated.sequence([
          Animated.timing(fade, { toValue: 1, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.delay(300),
          Animated.timing(fade, { toValue: 0, duration: 340, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ]),
      ]).start(() => {
        running.current = false;
        setVisible(false);
      });
    },
  }));

  if (!visible) return null;

  const brainScale = grow.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { opacity: fade }]}>
      {/* soft light veil over the outgoing page */}
      <View style={styles.veil} />

      {/* halo behind everything */}
      <View style={styles.centre}>
        <View style={styles.halo} />
        <View style={styles.haloInner} />
      </View>

      {/* faint orbit tracks */}
      <View style={[styles.centre]}>
        <View style={[styles.track, { width: RING_A, height: RING_A, borderRadius: RING_A / 2, marginLeft: -RING_A / 2, marginTop: -RING_A / 2 }]} />
        <View style={[styles.track, { width: RING_B, height: RING_B, borderRadius: RING_B / 2, marginLeft: -RING_B / 2, marginTop: -RING_B / 2 }]} />
      </View>

      {/* counter-rotating neuron orbits */}
      <View style={styles.centre}>
        <Ring diameter={RING_A} dots={ORBIT_A} spin={spin} direction={1} />
        <Ring diameter={RING_B} dots={ORBIT_B} spin={spin} direction={-1} color="#A78BFA" />
      </View>

      {/* the brain, centre stage */}
      <View style={styles.centre}>
        <Animated.View style={{ marginLeft: -BRAIN / 2, marginTop: -BRAIN / 2, transform: [{ scale: brainScale }] }}>
          <Brain3D size={BRAIN} animated={false} />
        </Animated.View>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248,246,253,0.92)',
  },
  centre: { position: 'absolute', left: W / 2, top: H / 2 },
  halo: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    marginLeft: -130, marginTop: -130,
    backgroundColor: 'rgba(139,92,246,0.10)',
  },
  haloInner: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    marginLeft: -90, marginTop: -90,
    backgroundColor: 'rgba(139,92,246,0.12)',
  },
  track: {
    position: 'absolute',
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.18)',
  },
  ring: { position: 'absolute' },
});

export default NeuronTransition;
