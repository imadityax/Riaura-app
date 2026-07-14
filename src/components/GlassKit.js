// ─────────────────────────────────────────────────────────────────────────────
// GlassKit — the app-wide LIGHT design system (formerly dark glass).
// Soft off-white gradient pages, white cards with gentle lavender shadows,
// purple-led accents. Component names/APIs are unchanged so every screen that
// already builds on this kit picks up the new look automatically.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Easing, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { PressableScale } from './anim';
import { dark } from '../theme/colors';

const { width: SCREEN_W } = Dimensions.get('window');

// ── Ambient background layers ────────────────────────────────────────────────
// Subtle lavender speckles — barely-there texture on light pages.
export function StarField({ count = 18, height = 340 }) {
  const stars = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * SCREEN_W, y: Math.random() * height,
      s: Math.random() * 3 + 2, o: Math.random() * 0.10 + 0.04,
    }))
  ).current;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((st, i) => (
        <View key={i} style={{ position: 'absolute', left: st.x, top: st.y, width: st.s, height: st.s, borderRadius: st.s, backgroundColor: '#7C3AED', opacity: st.o }} />
      ))}
    </View>
  );
}

function BokehDot({ d }) {
  const y = useRef(new Animated.Value(0)).current;
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: d.dur * 0.4, delay: d.delay, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0, duration: d.dur * 0.6, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.timing(y, { toValue: 1, duration: d.dur, delay: d.delay, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);
  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [30, -70] });
  return (
    <Animated.View style={{
      position: 'absolute', left: d.x, top: '52%',
      width: d.size, height: d.size, borderRadius: d.size / 2,
      backgroundColor: d.tint, opacity: o, transform: [{ translateY }],
    }} />
  );
}

// ── NeuronDrift ──────────────────────────────────────────────────────────────
// Floating glowing neurons: each is a soft halo + bright core that drifts
// upward, sways sideways and twinkles. `dark` switches to the bright cyan/
// violet tints used over deep-purple hero panels.
const LIGHT_TINTS = [
  { halo: 'rgba(108,77,255,0.10)', core: 'rgba(108,77,255,0.55)' },
  { halo: 'rgba(76,201,240,0.10)', core: 'rgba(76,201,240,0.55)' },
  { halo: 'rgba(217,70,239,0.08)', core: 'rgba(217,70,239,0.45)' },
];
const DARK_TINTS = [
  { halo: 'rgba(183,156,255,0.16)', core: '#B79CFF' },
  { halo: 'rgba(125,227,255,0.14)', core: '#7DE3FF' },
  { halo: 'rgba(233,213,255,0.12)', core: '#E9D5FF' },
];

function Neuron({ n }) {
  const drift   = useRef(new Animated.Value(0)).current;
  const sway    = useRef(new Animated.Value(0)).current;
  const twinkle = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loops = [
      Animated.loop(Animated.sequence([
        Animated.timing(drift, { toValue: 1, duration: n.dur, delay: n.delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: n.dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: n.dur * 0.7, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: n.dur * 0.7, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])),
      Animated.loop(Animated.sequence([
        Animated.timing(twinkle, { toValue: 1, duration: n.dur * 0.5, delay: n.delay * 0.5, useNativeDriver: true }),
        Animated.timing(twinkle, { toValue: 0, duration: n.dur * 0.5, useNativeDriver: true }),
      ])),
    ];
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute', left: n.x, top: n.y,
      alignItems: 'center', justifyContent: 'center',
      opacity: twinkle.interpolate({ inputRange: [0, 1], outputRange: [n.oMin, n.oMax] }),
      transform: [
        { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: [n.range / 2, -n.range / 2] }) },
        { translateX: sway.interpolate({ inputRange: [0, 1], outputRange: [-n.range / 4, n.range / 4] }) },
      ],
    }}>
      <View style={{ position: 'absolute', width: n.size * 4, height: n.size * 4, borderRadius: n.size * 2, backgroundColor: n.tint.halo }} />
      <View style={{ width: n.size, height: n.size, borderRadius: n.size / 2, backgroundColor: n.tint.core }} />
    </Animated.View>
  );
}

export function NeuronDrift({ count = 10, dark = false, height = 700 }) {
  const tints = dark ? DARK_TINTS : LIGHT_TINTS;
  const neurons = useRef(
    Array.from({ length: count }, (_, i) => ({
      x: Math.random() * SCREEN_W,
      y: Math.random() * height,
      size: Math.random() * 4 + 3,
      range: Math.random() * 46 + 26,
      dur: Math.random() * 3200 + 3400,
      delay: Math.random() * 2600,
      oMin: dark ? 0.25 : 0.35,
      oMax: dark ? 0.95 : 1,
      tint: tints[i % tints.length],
    }))
  ).current;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {neurons.map((n, i) => <Neuron key={i} n={n} />)}
    </View>
  );
}

export function Bokeh({ count = 5 }) {
  const dots = useRef(
    Array.from({ length: count }, () => ({
      x: Math.random() * SCREEN_W,
      size: Math.random() * 90 + 55,
      delay: Math.random() * 4000,
      dur: Math.random() * 5000 + 6000,
      tint: Math.random() > 0.5 ? 'rgba(124,58,237,0.05)' : 'rgba(59,130,246,0.05)',
    }))
  ).current;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {dots.map((d, i) => <BokehDot key={i} d={d} />)}
    </View>
  );
}

// ── Screen scaffold ──────────────────────────────────────────────────────────
// Light gradient page with soft ambient depth. Wrap any screen's content in this.
export function Screen({ children, gradient = dark.bg, edges = ['top'], stars = true, bokeh = true, neurons = true, style }) {
  return (
    <View style={[styles.screen, style]}>
      <LinearGradient colors={gradient} style={StyleSheet.absoluteFill} />
      {bokeh && <Bokeh />}
      {stars && <StarField />}
      {neurons && <NeuronDrift />}
      <SafeAreaView edges={edges} style={{ flex: 1 }}>{children}</SafeAreaView>
    </View>
  );
}

// ── Card surface ─────────────────────────────────────────────────────────────
// White rounded card with a soft lavender shadow. `tint`/`border` overrides are
// still honoured for screens that pass pastel fills.
export function GlassCard({ children, style, tint = dark.glass, border = dark.glassBorder, radius = 22, highlight = false, onPress }) {
  const base = [{
    backgroundColor: tint, borderWidth: 1, borderColor: border, borderRadius: radius, overflow: 'hidden',
    shadowColor: '#7C6BAE', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 3,
  }, style];
  if (onPress) return <PressableScale onPress={onPress} scaleTo={0.97} style={base}>{children}</PressableScale>;
  return <View style={base}>{children}</View>;
}

// ── Primary gradient button ──────────────────────────────────────────────────
export function NeonButton({ label, icon, onPress, colors = ['#8B5CF6', '#6D28D9'], style, disabled }) {
  return (
    <PressableScale onPress={disabled ? null : onPress} scaleTo={0.96} style={[styles.neonBtn, disabled && { opacity: 0.5 }, style]}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.neonBtnGrad}>
        {icon ? <MaterialCommunityIcons name={icon} size={20} color="#fff" /> : null}
        <Text style={styles.neonBtnText}>{label}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

// Ghost (outline) button for secondary actions.
export function GhostButton({ label, icon, onPress, style }) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.96} style={[styles.ghostBtn, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={18} color={dark.neon} /> : null}
      <Text style={styles.ghostText}>{label}</Text>
    </PressableScale>
  );
}

// ── Top bar ──────────────────────────────────────────────────────────────────
export function GlassHeader({ title, subtitle, onBack, right }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={10} style={styles.hIconBtn}>
          <Ionicons name="chevron-back" size={22} color={dark.text} />
        </Pressable>
      ) : <View style={styles.hSpacer} />}
      <View style={styles.hTitleWrap}>
        <Text style={styles.hTitle} numberOfLines={1}>{title}</Text>
        {subtitle ? <Text style={styles.hSub} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right || <View style={styles.hSpacer} />}
    </View>
  );
}

// ── Emblem medallion ─────────────────────────────────────────────────────────
export function GlassEmblem({ icon, colors = ['#8B5CF6', '#6D28D9'], size = 72, iconSize, style }) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <View style={[styles.emblemGlow, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors[0] }]} />
      <LinearGradient
        colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.emblem, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <MaterialCommunityIcons name={icon} size={iconSize || size * 0.46} color="#fff" />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: dark.bgSolid },

  neonBtn: { borderRadius: 18, overflow: 'hidden', shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 8 },
  neonBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 24 },
  neonBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },

  ghostBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 20, backgroundColor: '#F3F0FA', borderWidth: 1, borderColor: dark.glassBorderStrong },
  ghostText: { color: dark.neon, fontWeight: '800', fontSize: 15 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  hIconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: dark.glassBorder, alignItems: 'center', justifyContent: 'center', shadowColor: '#7C6BAE', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  hSpacer: { width: 40, height: 40 },
  hTitleWrap: { flex: 1, alignItems: 'center' },
  hTitle: { color: dark.text, fontSize: 17, fontWeight: '800' },
  hSub: { color: dark.textSub, fontSize: 12, marginTop: 1 },

  emblemGlow: { position: 'absolute', opacity: 0.18, transform: [{ scale: 1.35 }] },
  emblem: { alignItems: 'center', justifyContent: 'center' },
});
