import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable } from 'react-native';

// ── PressableScale ──────────────────────────────────────────────
// Drop-in replacement for TouchableOpacity that springs down on press
// and bounces back on release — makes every tap feel tactile.
export function PressableScale({ children, style, scaleTo = 0.96, onPress, disabled, ...rest }) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} disabled={disabled} {...rest}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ── FadeInUp ────────────────────────────────────────────────────
// Entrance animation: fades in while sliding up. Use `delay` to
// stagger lists (e.g. delay={i * 70}).
export function FadeInUp({ children, delay = 0, distance = 16, duration = 420, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration, delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[style, {
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
      }]}
    >
      {children}
    </Animated.View>
  );
}

// ── PopIn ───────────────────────────────────────────────────────
// Springs from tiny to full size — for badges, trophies, score reveals.
export function PopIn({ children, delay = 0, style }) {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1, delay, useNativeDriver: true, speed: 14, bounciness: 14,
    }).start();
  }, []);

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}

// ── CountUp ─────────────────────────────────────────────────────
// Animated number that counts from 0 to `value`. Renders inside a Text-like
// Animated.Text so it inherits the given style.
export function CountUp({ value, duration = 1000, delay = 0, style, suffix = '' }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(anim, {
      toValue: value, duration, delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value]);

  return <Animated.Text style={style}>{display}{suffix}</Animated.Text>;
}

// ── ProgressBar ─────────────────────────────────────────────────
// Progress bar whose fill sweeps smoothly to `progress` (0–1).
export function ProgressBar({ progress, height = 8, trackColor = 'rgba(0,0,0,0.08)', fillColor = '#2B4EFF', duration = 700, style, minPct = 0 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(Math.min(progress, 1), minPct),
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width animation
    }).start();
  }, [progress]);

  return (
    <Animated.View style={[{ height, borderRadius: height / 2, backgroundColor: trackColor, overflow: 'hidden' }, style]}>
      <Animated.View
        style={{
          height: '100%',
          borderRadius: height / 2,
          backgroundColor: fillColor,
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </Animated.View>
  );
}

// ── Float ───────────────────────────────────────────────────────
// Slow, infinite vertical bob — for hero art (the brain, illustrations).
export function Float({ children, distance = 6, duration = 2600, delay = 0, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, delay, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[style, {
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [distance / 2, -distance / 2] }) }],
      }]}
    >
      {children}
    </Animated.View>
  );
}

// ── Breathe ─────────────────────────────────────────────────────
// Soft glow that scales and fades in a loop — put it BEHIND hero art.
export function Breathe({ size = 200, color = 'rgba(139,92,246,0.22)', duration = 2600, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[{
        position: 'absolute', width: size, height: size, borderRadius: size / 2,
        backgroundColor: color,
        opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.85] }),
        transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.1] }) }],
      }, style]}
    />
  );
}

// ── Pulse ───────────────────────────────────────────────────────
// Gentle infinite heartbeat — draws the eye to streaks and live badges.
export function Pulse({ children, to = 1.12, duration = 700, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: to, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      {children}
    </Animated.View>
  );
}
