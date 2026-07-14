import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, StatusBar, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, G, Defs, Stop, LinearGradient as SvgGrad, RadialGradient } from 'react-native-svg';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { storage } from '../../utils/storage';
import { auth } from '../../firebase/config';
import { getUserData } from '../../firebase/firestore';
import { ui, dark } from '../../theme/colors';
import { BRAIN_PATHS } from '../../components/BrainIcon';
import { PressableScale, FadeInUp } from '../../components/anim';
import { rf, scale } from '../../utils/responsive';
import NeuralLoader from '../../components/NeuralLoader';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Decorative glowing brain floating in the gradient hero ──
function HeroBrain({ w = 150 }) {
  const h = w;
  return (
    <Svg width={w} height={h} viewBox="0 0 160 160">
      <Defs>
        <SvgGrad id="hbBrain" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="1" stopColor="#D9E1FF" />
        </SvgGrad>
        <RadialGradient id="hbGlow" cx="50%" cy="46%" r="55%">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="80" cy="76" r="70" fill="url(#hbGlow)" />
      <Circle cx="80" cy="78" r="66" stroke="#FFFFFF" strokeWidth="1" fill="none" opacity="0.28" />
      <Circle cx="142" cy="52" r="2.6" fill="#FFFFFF" opacity="0.9" />
      <Circle cx="20" cy="60" r="2" fill="#FFFFFF" opacity="0.7" />
      <Circle cx="30" cy="118" r="2.4" fill="#C9D4FF" opacity="0.9" />
      <Circle cx="138" cy="112" r="2" fill="#FFFFFF" opacity="0.7" />
      <G transform="translate(32,30) scale(4)">
        {BRAIN_PATHS.map((d, i) => (
          <Path key={i} d={d} stroke="url(#hbBrain)" strokeWidth="1.1" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </G>
      <Circle cx="66" cy="62" r="2.2" fill="#FDE68A" />
      <Circle cx="92" cy="54" r="1.7" fill="#FFFFFF" />
      <Circle cx="104" cy="78" r="2.2" fill="#A5F3FC" />
      <Circle cx="72" cy="94" r="1.7" fill="#F5D0FE" />
    </Svg>
  );
}

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('signup'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const isSignup = mode === 'signup';

  async function handleSignIn() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      // Restore the full account from the cloud — profile, phase progress,
      // scores and mindfulness domains — so a new device picks up where
      // the user left off.
      try {
        const data = await getUserData(user.uid);
        await storage.hydrateFromCloud(data);
      } catch (_) {}
      navigation.replace('Main');
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Incorrect email or password.'
        : err.message;
      Alert.alert('Sign In Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email.trim()) {
      Alert.alert('Enter your email', 'Type your email above, then tap Forgot Password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert('Email Sent', 'Check your inbox for a password reset link.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  }

  // Sign-up only collects the credentials — the detailed profile (name, age,
  // education, consent…) is captured on the Registration screen, which also
  // creates the account. We pass the credentials forward so they're prefilled.
  function handleSignUp() {
    if (!EMAIL_RE.test(email.trim())) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match', 'Please re-enter your password.');
      return;
    }
    navigation.navigate('Registration', { email: email.trim(), password });
  }

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    setPassword('');
    setConfirm('');
    setShowPassword(false);
    setFocused(null);
  }

  function social(name) {
    Alert.alert(`Continue with ${name}`, 'Social sign-in is coming soon. Please use your email for now.');
  }

  const inputRow = (key) => [styles.inputRow, focused === key && styles.inputRowFocus];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#4B6BFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* ── Gradient hero ── */}
          <LinearGradient
            colors={['#5B7BFF', '#4B4FFF', '#7C3AED']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <SafeAreaView edges={['top']}>
              {/* floating decorative blobs */}
              <View pointerEvents="none" style={[styles.blob, styles.blob1]} />
              <View pointerEvents="none" style={[styles.blob, styles.blob2]} />

              <FadeInUp>
                <View style={styles.heroInner}>
                  <View style={styles.heroArt}>
                    <HeroBrain w={scale(148)} />
                  </View>
                  <Text style={styles.brandRow}>RiAura</Text>
                  <View style={styles.rhimsPill}>
                    <Ionicons name="sparkles" size={12} color="#FDE68A" />
                    <Text style={styles.rhimsText}>RHIMS™ Intelligence Passport</Text>
                  </View>
                </View>
              </FadeInUp>
            </SafeAreaView>
          </LinearGradient>

          {/* ── Form sheet ── */}
          <FadeInUp delay={120} style={styles.sheetWrap}>
            <View style={styles.sheet}>
              {/* segmented toggle */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tab, !isSignup && styles.tabActive]}
                  onPress={() => switchMode('signin')}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.tabText, !isSignup && styles.tabTextActive]}>Sign In</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, isSignup && styles.tabActive]}
                  onPress={() => switchMode('signup')}
                  activeOpacity={0.9}
                >
                  <Text style={[styles.tabText, isSignup && styles.tabTextActive]}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.title}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
              <Text style={styles.subtitle}>
                {isSignup ? 'Begin mapping your human intelligence' : 'Your intelligence journey continues'}
              </Text>

              {/* Email */}
              <Text style={styles.label}>Email</Text>
              <View style={inputRow('email')}>
                <Ionicons name="mail-outline" size={18} color={focused === 'email' ? dark.neon : dark.textMute} style={styles.inputIcon} />
                <TextInput
                  style={styles.inputText}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="you@example.com"
                  placeholderTextColor={dark.textMute}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password */}
              <Text style={styles.label}>Password</Text>
              <View style={inputRow('password')}>
                <Ionicons name="lock-closed-outline" size={18} color={focused === 'password' ? dark.neon : dark.textMute} style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputText, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder={isSignup ? 'Min. 6 characters' : '••••••••'}
                  placeholderTextColor={dark.textMute}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color={dark.textMute} />
                </TouchableOpacity>
              </View>

              {/* Confirm (sign up only) */}
              {isSignup && (
                <>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={inputRow('confirm')}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={focused === 'confirm' ? dark.neon : dark.textMute} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.inputText, { flex: 1 }]}
                      value={confirm}
                      onChangeText={setConfirm}
                      onFocus={() => setFocused('confirm')}
                      onBlur={() => setFocused(null)}
                      placeholder="Repeat your password"
                      placeholderTextColor={dark.textMute}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                </>
              )}

              {!isSignup && (
                <TouchableOpacity style={styles.forgotRow} onPress={handleForgotPassword}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {/* Primary CTA */}
              <PressableScale scaleTo={0.97} onPress={isSignup ? handleSignUp : handleSignIn} disabled={loading} style={{ marginTop: isSignup ? 22 : 4 }}>
                <LinearGradient
                  colors={loading ? ['#9BB0FF', '#B79BF5'] : ['#3D5BFF', '#7C3AED']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.cta}
                >
                  {loading
                    ? <NeuralLoader size={30} color={dark.glass} />
                    : (
                      <>
                        <Text style={styles.ctaText}>{isSignup ? 'Create Account' : 'Sign In'}</Text>
                        <Ionicons name="arrow-forward" size={19} color="#fff" />
                      </>
                    )}
                </LinearGradient>
              </PressableScale>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.divLine} />
                <Text style={styles.divText}>or continue with</Text>
                <View style={styles.divLine} />
              </View>

              {/* Social */}
              <View style={styles.socialRow}>
                <PressableScale style={styles.socialBtn} scaleTo={0.96} onPress={() => social('Google')}>
                  <Ionicons name="logo-google" size={18} color="#EA4335" />
                  <Text style={styles.socialText}>Google</Text>
                </PressableScale>
                <PressableScale style={styles.socialBtn} scaleTo={0.96} onPress={() => social('Apple')}>
                  <Ionicons name="logo-apple" size={19} color="#111" />
                  <Text style={styles.socialText}>Apple</Text>
                </PressableScale>
              </View>

              {/* Footer switch */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>
                  {isSignup ? 'Already have an account? ' : 'New to RiAura? '}
                </Text>
                <TouchableOpacity onPress={() => switchMode(isSignup ? 'signin' : 'signup')}>
                  <Text style={styles.switchText}>{isSignup ? 'Sign In' : 'Create Account'}</Text>
                </TouchableOpacity>
              </View>

              {/* Trust badge */}
              <View style={styles.trustRow}>
                <Ionicons name="lock-closed" size={12} color={dark.textMute} />
                <Text style={styles.trustText}>Your data is encrypted & private</Text>
              </View>
            </View>
          </FadeInUp>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FF' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 28 },

  // Hero
  hero: {
    paddingHorizontal: 24,
    paddingBottom: scale(56),
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
  },
  heroInner: { alignItems: 'center', paddingTop: scale(6) },
  heroArt: { marginBottom: 6 },
  blob: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.10)' },
  blob1: { width: scale(180), height: scale(180), top: -scale(40), right: -scale(50) },
  blob2: { width: scale(120), height: scale(120), bottom: scale(10), left: -scale(40), backgroundColor: 'rgba(255,255,255,0.08)' },
  brandRow: { fontSize: rf(34), fontWeight: '900', color: '#fff', letterSpacing: 1 },
  rhimsPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10,
  },
  rhimsText: { color: '#EAF0FF', fontSize: rf(12), fontWeight: '600', letterSpacing: 0.3 },

  // Sheet
  sheetWrap: { paddingHorizontal: 18, marginTop: -scale(34) },
  sheet: {
    backgroundColor: dark.glass,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 24,
    shadowColor: '#1B2455',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 12,
  },

  // Tabs
  tabRow: { flexDirection: 'row', backgroundColor: '#EEF1FA', borderRadius: 14, padding: 4, marginBottom: 22 },
  tab: { flex: 1, paddingVertical: 11, borderRadius: 10, alignItems: 'center' },
  tabActive: {
    backgroundColor: dark.glass,
    shadowColor: '#1B2455', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 5, elevation: 3,
  },
  tabText: { fontSize: rf(14), fontWeight: '600', color: dark.textSub },
  tabTextActive: { color: dark.neon, fontWeight: '800' },

  title: { fontSize: rf(24), fontWeight: '800', color: dark.text, marginBottom: 4 },
  subtitle: { fontSize: rf(13.5), color: dark.textSub, marginBottom: 20 },
  label: { fontSize: rf(12), fontWeight: '700', color: dark.textSub, marginBottom: 7 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F6FB',
    borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent',
    paddingHorizontal: 12, paddingVertical: 13, marginBottom: 15,
  },
  inputRowFocus: { borderColor: dark.neon, backgroundColor: '#EEF2FF' },
  inputIcon: { marginRight: 8 },
  inputText: { flex: 1, fontSize: rf(14), color: dark.text },
  eyeBtn: { paddingLeft: 8 },

  forgotRow: { alignItems: 'flex-end', marginTop: -4, marginBottom: 6 },
  forgotText: { fontSize: rf(13), fontWeight: '700', color: dark.neon },

  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 26, paddingVertical: 16,
    shadowColor: '#4B4FFF', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34, shadowRadius: 14, elevation: 8,
  },
  ctaText: { fontSize: rf(16), fontWeight: '800', color: '#fff', letterSpacing: 0.3 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22, marginBottom: 16 },
  divLine: { flex: 1, height: 1, backgroundColor: dark.glassBorder },
  divText: { fontSize: rf(12), color: dark.textMute, fontWeight: '500' },

  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: dark.glass, borderRadius: 14, paddingVertical: 14,
    borderWidth: 1, borderColor: dark.glassBorder,
  },
  socialText: { fontSize: rf(14), fontWeight: '700', color: dark.text },

  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: rf(13.5), color: dark.textSub },
  switchText: { fontSize: rf(13.5), fontWeight: '800', color: dark.neon },

  trustRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 },
  trustText: { fontSize: rf(11.5), color: dark.textMute, fontWeight: '500' },
});
