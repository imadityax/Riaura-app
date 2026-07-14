import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G, Defs, RadialGradient, Stop } from 'react-native-svg';
import BrainModel from './BrainModel';
import { Float, Breathe } from './anim';

// ─────────────────────────────────────────────────────────────────────────────
// Brain3D — the app's brain hero: the REAL 3D model (brain_areas.glb) slowly
// rotating at the centre, composited inside the signature purple glow, orbit
// ring and floating particles. Used on Home, Splash, Login, course cards and
// the page-swap transition — one component, one look.
// `animated` adds the gentle float + breathing glow around the (always
// rotating) model. `spin` controls the rotation speed in rad/s.
// ─────────────────────────────────────────────────────────────────────────────
export default function Brain3D({ size = 180, style, animated = true, spin = 0.5 }) {
  const core = (
    <View style={{ width: size, height: size }}>
      <DecorBack size={size} />
      <View style={styles.modelWrap}>
        <BrainModel size={size * 0.78} spin={spin} />
      </View>
      <DecorFront size={size} />
    </View>
  );

  if (!animated) return <View style={style}>{core}</View>;
  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Breathe size={size * 0.78} duration={2800} />
      <Float distance={size * 0.05} duration={2800}>
        {core}
      </Float>
    </View>
  );
}

// Glow halo + rear half of the orbit ring (renders BEHIND the model).
function DecorBack({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 320 300" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <RadialGradient id="b3halo" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#8B5CF6" stopOpacity="0.35" />
          <Stop offset="0.7" stopColor="#8B5CF6" stopOpacity="0.14" />
          <Stop offset="1" stopColor="#8B5CF6" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="160" cy="150" r="148" fill="url(#b3halo)" />
      <Circle cx="160" cy="150" r="104" fill="rgba(139,92,246,0.12)" />
      <G transform="rotate(-18 160 160)">
        <Path d="M 20 160 A 140 48 0 0 1 300 160"
          stroke="rgba(196,181,253,0.55)" strokeWidth="1.5" fill="none" />
      </G>
    </Svg>
  );
}

// Front half of the orbit ring, satellites and particles (renders IN FRONT).
function DecorFront({ size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 320 300" style={StyleSheet.absoluteFill} pointerEvents="none">
      <G transform="rotate(-18 160 160)">
        <Path d="M 20 160 A 140 48 0 0 0 300 160"
          stroke="rgba(196,181,253,0.7)" strokeWidth="1.5" fill="none" />
        <Circle cx="20" cy="160" r="4" fill="#E9D5FF" />
        <Circle cx="300" cy="160" r="5" fill="#A78BFA" />
        <Circle cx="267" cy="191" r="3.5" fill="#C4B5FD" />
      </G>
      <Circle cx="34" cy="78" r="7" fill="rgba(183,156,255,0.25)" />
      <Circle cx="34" cy="78" r="3" fill="#B79CFF" />
      <Circle cx="278" cy="52" r="8" fill="rgba(196,181,253,0.22)" />
      <Circle cx="278" cy="52" r="3.5" fill="#C4B5FD" />
      <Circle cx="146" cy="20" r="3" fill="#D8C8FF" opacity="0.9" />
      <Circle cx="52" cy="234" r="3" fill="#B79CFF" opacity="0.8" />
      <Circle cx="256" cy="242" r="7" fill="rgba(183,156,255,0.22)" />
      <Circle cx="256" cy="242" r="3" fill="#C4B5FD" />
      <Circle cx="306" cy="132" r="2.5" fill="#E9D5FF" opacity="0.9" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  modelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
