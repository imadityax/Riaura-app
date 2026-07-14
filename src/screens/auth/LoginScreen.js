import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, StatusBar, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { storage } from '../../utils/storage';
import { auth } from '../../firebase/config';
import { getUserData } from '../../firebase/firestore';
import { ui } from '../../theme/colors';
import NeuralLoader from '../../components/NeuralLoader';
import Brain3D from '../../components/Brain3D';
import { FadeInUp } from '../../components/anim';

const PURPLE = '#7C3AED';
const INK    = '#1E1B33';
const GRAY   = '#8A8797';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7F5FB" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FadeInUp distance={12}>
            <Brain3D size={150} style={{ marginBottom: 2, alignSelf: 'center' }} />
            <Text style={[styles.tagline, { textAlign: 'center' }]}>BEYOND AWAKENING</Text>
          </FadeInUp>

          <FadeInUp delay={100} style={{ width: '100%' }}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Your intelligence journey continues</Text>

            <Text style={styles.label}>Email</Text>
            <View style={styles.inputRow}>
              <Ionicons name="mail-outline" size={18} color={ui.lightText} style={styles.inputIcon} />
              <TextInput
                style={styles.inputText}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={ui.lightText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color={ui.lightText} style={styles.inputIcon} />
              <TextInput
                style={[styles.inputText, { flex: 1 }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={ui.lightText}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color={ui.lightText}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotRow} onPress={handleForgotPassword}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn} activeOpacity={0.85} disabled={loading}>
              {loading
                ? <NeuralLoader size={30} color={ui.white} />
                : <Text style={styles.signInText}>Sign In</Text>
              }
            </TouchableOpacity>

          </View>
          </FadeInUp>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to RiAura? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Registration')}>
              <Text style={styles.createText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F7F5FB' },
  flex:       { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  tagline: {
    fontSize: 11,
    letterSpacing: 3,
    color: PURPLE,
    marginBottom: 24,
    fontWeight: '800',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#7C6BAE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 8,
  },
  title:    { fontSize: 26, fontWeight: '900', color: INK, marginBottom: 4 },
  subtitle: { fontSize: 14, color: GRAY, marginBottom: 24 },
  label:    { fontSize: 12, fontWeight: '700', color: GRAY, marginBottom: 8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ui.inputBg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputIcon:  { marginRight: 8 },
  inputText:  { flex: 1, fontSize: 14, color: ui.darkText },
  eyeBtn:     { paddingLeft: 8 },
  forgotRow:  { alignItems: 'flex-end', marginBottom: 20, marginTop: -8 },
  forgotText: { fontSize: 13, fontWeight: '700', color: PURPLE },
  signInBtn: {
    backgroundColor: PURPLE,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 6,
  },
  signInText:   { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText:  { fontSize: 14, color: GRAY },
  createText:  { fontSize: 14, fontWeight: '800', color: PURPLE },
});
