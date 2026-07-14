// ─────────────────────────────────────────────────────────────────────────────
// VisualKit — shared "visuals-first" building blocks for the Ri-Aura app.
// Big iconography + progress rings + picture tiles that carry meaning visually,
// with concise text alongside (the 50-50 language).
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ui } from '../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ── RingStat ─────────────────────────────────────────────────────────────────
// Animated circular progress ring with free-form center content. Renders a value
// as a visual arc first, number second.
export function RingStat({
  percent = 0, size = 128, stroke = 12,
  color = ui.primaryBlue, color2, trackColor = 'rgba(0,0,0,0.06)',
  children, duration = 1100, style,
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const anim = useRef(new Animated.Value(0)).current;
  const gid = useRef(`rg${Math.random().toString(36).slice(2)}`).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(100, percent)),
      duration, useNativeDriver: false,
    }).start();
  }, [percent]);

  const dashoffset = anim.interpolate({ inputRange: [0, 100], outputRange: [circ, 0] });

  return (
    <View style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGrad id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={color} />
            <Stop offset="1" stopColor={color2 || color} />
          </SvgGrad>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={`url(#${gid})`} strokeWidth={stroke} fill="none"
          strokeDasharray={circ} strokeDashoffset={dashoffset} strokeLinecap="round"
          rotation="-90" originX={size / 2} originY={size / 2}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

// ── Emblem ───────────────────────────────────────────────────────────────────
// A big gradient icon medallion — the visual anchor at the top of a screen.
export function Emblem({ icon, colors = [ui.blueGradStart, ui.blueGradEnd], size = 72, iconSize, style }) {
  return (
    <LinearGradient
      colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={[{
        width: size, height: size, borderRadius: size / 2,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: colors[0], shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
      }, style]}
    >
      <MaterialCommunityIcons name={icon} size={iconSize || size * 0.46} color="#fff" />
    </LinearGradient>
  );
}

// ── ScreenHeader ─────────────────────────────────────────────────────────────
// Visual header: centered emblem + title + subtitle. Consistent across screens.
export function ScreenHeader({ icon, colors, title, subtitle, style }) {
  return (
    <View style={[styles.header, style]}>
      <Emblem icon={icon} colors={colors} />
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
    </View>
  );
}

// ── IconTile ─────────────────────────────────────────────────────────────────
// Big-icon action tile: picture leads, label + optional caption follow.
export function IconTile({ icon, color = ui.primaryBlue, title, caption, onPress, style }) {
  return (
    <View style={[styles.tile, style]}>
      <View style={[styles.tileIcon, { backgroundColor: color + '18' }]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <Text style={styles.tileTitle}>{title}</Text>
      {caption ? <Text style={styles.tileCaption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: ui.darkText, marginTop: 12, textAlign: 'center' },
  headerSub: { fontSize: 13, color: ui.midText, marginTop: 6, textAlign: 'center', lineHeight: 19 },
  tile: {
    backgroundColor: ui.white, borderRadius: 18, padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  tileIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  tileTitle: { fontSize: 14, fontWeight: '800', color: ui.darkText, textAlign: 'center' },
  tileCaption: { fontSize: 11.5, color: ui.midText, textAlign: 'center', marginTop: 3, lineHeight: 15 },
});
