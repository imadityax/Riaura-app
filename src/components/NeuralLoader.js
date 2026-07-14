import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import BrainIcon from './BrainIcon';
import { ui } from '../theme/colors';

// A premium replacement for spinners: a brain core with orbiting neural
// nodes on two counter-rotating rings, plus a soft breathing glow.
export default function NeuralLoader({ size = 96, color = '#7C3AED' }) {
  const spinA = useRef(new Animated.Value(0)).current;
  const spinB = useRef(new Animated.Value(0)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mk = (val, dur, dir = 1) =>
      Animated.loop(Animated.timing(val, {
        toValue: dir, duration: dur, easing: Easing.linear, useNativeDriver: true,
      }));
    const a = mk(spinA, 3600, 1);
    const b = mk(spinB, 5200, -1);
    const g = Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
    ]));
    a.start(); b.start(); g.start();
    return () => { a.stop(); b.stop(); g.stop(); };
  }, []);

  const rotA = spinA.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const rotB = spinB.interpolate({ inputRange: [-1, 0], outputRange: ['-360deg', '0deg'] });

  const nodes = (count, radius, dot) =>
    Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count;
      return (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color,
            left: size / 2 - dot / 2 + radius * Math.cos(angle),
            top:  size / 2 - dot / 2 + radius * Math.sin(angle),
            opacity: 0.35 + 0.5 * ((i % 3) / 2),
          }}
        />
      );
    });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[styles.glow, {
          width: size * 0.9, height: size * 0.9, borderRadius: size,
          backgroundColor: color + '22',
          opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.6] }),
          transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.15] }) }],
        }]}
      />
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotA }] }]}>
        {nodes(6, size * 0.42, 6)}
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate: rotB }] }]}>
        {nodes(4, size * 0.29, 4)}
      </Animated.View>
      <BrainIcon size={size * 0.42} color={color} strokeWidth={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
});
