import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, {
  Path, Circle, Ellipse, G, Defs, Stop,
  LinearGradient as SvgLinearGradient, RadialGradient,
} from 'react-native-svg';
import { PressableScale } from '../components/anim';
import BrainIcon, { BRAIN_PATHS } from '../components/BrainIcon';
import { storage } from '../utils/storage';
import { rf, scale } from '../utils/responsive';
import { ui, dark } from '../theme/colors';

// ── Gradient brand title (blue → purple, per-letter interpolation) ──
function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function lerpColor(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const c = A.map((v, i) => Math.round(v + (B[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}
function GradientBrand() {
  const letters = 'RIAURA'.split('');
  return (
    <View style={styles.brandRow}>
      {letters.map((ch, i) => (
        <Text key={i} style={[styles.brand, { color: lerpColor('#2B4EFF', '#7C3AED', i / (letters.length - 1)) }]}>
          {ch}
        </Text>
      ))}
    </View>
  );
}

// ── Glowing neural brain floating on a podium (stylised SVG) ──
// Swap point: to use a photoreal render, drop a PNG in /assets and replace
// this component with <Image source={require('../../assets/brain.png')} />.
function BrainHero({ w = 232 }) {
  const h = w * 1.26;
  return (
    <Svg width={w} height={h} viewBox="0 0 232 292">
      <Defs>
        <SvgLinearGradient id="brainGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#A78BFA" />
          <Stop offset="1" stopColor="#5B8DEF" />
        </SvgLinearGradient>
        <RadialGradient id="glow" cx="50%" cy="42%" r="55%">
          <Stop offset="0" stopColor="#C4B5FD" stopOpacity="0.5" />
          <Stop offset="1" stopColor="#C4B5FD" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="podGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="1" stopColor="#DCE4FF" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {/* soft aura */}
      <Circle cx="116" cy="118" r="94" fill="url(#glow)" />
      {/* orbit ring + dots */}
      <Circle cx="116" cy="118" r="98" stroke="#C7D2FE" strokeWidth="1" fill="none" opacity="0.55" />
      <Circle cx="208" cy="78" r="3.2" fill="#8B9EFF" />
      <Circle cx="200" cy="150" r="2.4" fill="#C4B5FD" />
      <Circle cx="34" cy="70" r="2.6" fill="#F0ABFC" />
      <Circle cx="26" cy="146" r="2" fill="#8B9EFF" />

      {/* brain (BRAIN_PATHS scaled from 24-box → ~140px, centred at 116,116) */}
      <G transform="translate(46,46) scale(5.83)">
        {BRAIN_PATHS.map((d, i) => (
          <Path key={i} d={d} stroke="url(#brainGrad)" strokeWidth="1.1" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </G>
      {/* neural node lights */}
      <Circle cx="96" cy="94" r="2.6" fill="#F0ABFC" />
      <Circle cx="122" cy="80" r="2" fill="#FFFFFF" />
      <Circle cx="138" cy="110" r="2.6" fill="#93C5FD" />
      <Circle cx="106" cy="132" r="2" fill="#C4B5FD" />
      <Circle cx="152" cy="96" r="1.8" fill="#FFFFFF" />
      <Circle cx="86" cy="116" r="1.8" fill="#93C5FD" />

      {/* podium */}
      <Ellipse cx="116" cy="250" rx="82" ry="20" fill="#E7ECFB" />
      <Ellipse cx="116" cy="241" rx="67" ry="16" fill="#D6DEF9" />
      <Ellipse cx="116" cy="233" rx="53" ry="12" fill="#EEF2FE" />
      <Ellipse cx="116" cy="231" rx="34" ry="7" fill="url(#podGlow)" />
    </Svg>
  );
}

const FEATURES = [
  { lib: 'brain', name: 'brain',          tint: '#3B82F6', bg: '#EAF1FF', title: 'Cognitive\nInsights',   desc: 'Understand how you think and solve problems.' },
  { lib: 'ion',   name: 'person-outline', tint: '#7C3AED', bg: '#F1EAFE', title: 'Personality\nProfile',  desc: 'Discover your unique traits and behavioral style.' },
  { lib: 'ion',   name: 'locate-outline', tint: '#10B981', bg: '#E6F7F0', title: 'Strengths &\nPotential', desc: 'Identify your strengths and unlock potential.' },
  { lib: 'mci',   name: 'finance',        tint: '#F59E0B', bg: '#FEF3E6', title: 'Growth\nRoadmap',       desc: 'Personalized recommendations for your growth.' },
];

function FeatureIcon({ f, size }) {
  if (f.lib === 'brain') return <BrainIcon size={size} color={f.tint} strokeWidth={2} />;
  if (f.lib === 'ion')   return <Ionicons name={f.name} size={size} color={f.tint} />;
  return <MaterialCommunityIcons name={f.name} size={size} color={f.tint} />;
}

export default function OnboardingScreen({ navigation }) {
  async function proceed(route) {
    await storage.setOnboarded();
    navigation.replace(route);
  }
  function social(name) {
    Alert.alert(`Continue with ${name}`, 'Social sign-in is coming soon. Please create an account or log in for now.');
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View pointerEvents="none" style={styles.heroArt}>
            <BrainHero w={scale(224)} />
          </View>
          <Text style={styles.welcome}>Welcome to</Text>
          <GradientBrand />
          <Text style={styles.subtitle}>Human Intelligence Passport</Text>
          <Text style={styles.body}>
            AI-powered assessments to help you discover your strengths, understand
            yourself better and unlock your potential.
          </Text>
        </View>

        {/* ── Feature cards ── */}
        <View style={styles.cardsRow}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.card}>
              <View style={[styles.cardIcon, { backgroundColor: f.bg }]}>
                <FeatureIcon f={f} size={22} />
              </View>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>

        {/* ── Primary CTA ── */}
        <PressableScale scaleTo={0.97} onPress={() => proceed('Registration')}>
          <LinearGradient
            colors={['#3B6BFF', '#7C3AED']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Start Your Journey</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </LinearGradient>
        </PressableScale>

        {/* ── Divider ── */}
        <View style={styles.dividerRow}>
          <View style={styles.divLine} />
          <Text style={styles.divText}>or continue with</Text>
          <View style={styles.divLine} />
        </View>

        {/* ── Social sign-in ── */}
        <View style={styles.socialRow}>
          <PressableScale style={styles.socialBtn} scaleTo={0.97} onPress={() => social('Google')}>
            <Ionicons name="logo-google" size={19} color="#4285F4" />
            <Text style={styles.socialText}>Continue with Google</Text>
          </PressableScale>
          <PressableScale style={styles.socialBtn} scaleTo={0.97} onPress={() => social('Apple')}>
            <Ionicons name="logo-apple" size={20} color="#111" />
            <Text style={styles.socialText}>Continue with Apple</Text>
          </PressableScale>
        </View>

        {/* ── Login ── */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Text style={styles.loginLink} onPress={() => proceed('Login')}>Log in</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: dark.bgSolid },
  content: { paddingHorizontal: 22, paddingBottom: 28 },

  // Hero
  hero:     { minHeight: scale(360), paddingTop: 8 },
  heroArt:  { position: 'absolute', right: -22, top: scale(58) },
  welcome:  { fontSize: rf(22), color: dark.textSub, fontWeight: '500', marginTop: 6 },
  brandRow: { flexDirection: 'row', marginTop: 2, marginBottom: 4 },
  brand:    { fontSize: rf(50), fontWeight: '900', letterSpacing: 1 },
  subtitle: { fontSize: rf(15), color: dark.textMute, fontWeight: '500' },
  body:     { width: '58%', fontSize: rf(15), lineHeight: rf(23), color: dark.textSub, marginTop: scale(26) },

  // Feature cards
  cardsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  card: {
    flex: 1, backgroundColor: dark.glass, borderRadius: 16, borderWidth: 1, borderColor: dark.glassBorder, paddingVertical: 16, paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#1B2455', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 10, elevation: 2,
  },
  cardIcon: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  cardTitle: { fontSize: rf(12.5), fontWeight: '800', color: dark.text, textAlign: 'center', lineHeight: rf(16) },
  cardDesc:  { fontSize: rf(10.5), color: dark.textMute, textAlign: 'center', marginTop: 6, lineHeight: rf(14) },

  // CTA
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 18, paddingVertical: 18, marginTop: 26,
    shadowColor: '#5B6BFF', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  ctaText: { fontSize: rf(17), fontWeight: '800', color: '#fff' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22, marginBottom: 16 },
  divLine:    { flex: 1, height: 1, backgroundColor: dark.glassBorder },
  divText:    { fontSize: rf(12.5), color: dark.textMute },

  // Social
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: dark.glass, borderRadius: 14, paddingVertical: 15,
    borderWidth: 1, borderColor: dark.glassBorder,
  },
  socialText: { fontSize: rf(13), fontWeight: '600', color: dark.text },

  // Login
  loginRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  loginText: { fontSize: rf(14), color: dark.textSub },
  loginLink: { fontSize: rf(14), fontWeight: '700', color: dark.neon },
});
