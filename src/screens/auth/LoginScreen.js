import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { ui } from '../../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  function handleSignIn() {
    navigation.replace('Main');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.beige} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.tagline}>BEYOND AWAKENING</Text>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Your intelligence journey continues</Text>

            {/* Email */}
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

            {/* Password */}
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

            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn} activeOpacity={0.85}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social buttons */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
                <FontAwesome name="google" size={16} color="#EA4335" style={{ marginRight: 6 }} />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, styles.appleBtnGap]} activeOpacity={0.8}>
                <FontAwesome name="apple" size={18} color="#1A1A2E" style={{ marginRight: 6 }} />
                <Text style={styles.socialText}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

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
  safe:       { flex: 1, backgroundColor: ui.beige },
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
    color: '#7A6A58',
    marginBottom: 24,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    backgroundColor: ui.white,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  title:    { fontSize: 26, fontWeight: '800', color: ui.darkText, marginBottom: 4 },
  subtitle: { fontSize: 14, color: ui.midText, marginBottom: 24 },
  label:    { fontSize: 12, fontWeight: '600', color: ui.midText, marginBottom: 8 },
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
  forgotText: { fontSize: 13, fontWeight: '600', color: ui.primaryBlue },
  signInBtn: {
    backgroundColor: ui.primaryBlue,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: ui.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInText:   { fontSize: 16, fontWeight: '700', color: ui.white },
  dividerRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine:  { flex: 1, height: 1, backgroundColor: ui.borderGray },
  dividerText:  { fontSize: 12, color: ui.lightText, marginHorizontal: 12 },
  socialRow:    { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.inputBg,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 12,
  },
  appleBtnGap:  {},
  socialText:   { fontSize: 14, fontWeight: '600', color: ui.darkText },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText:  { fontSize: 14, color: ui.midText },
  createText:  { fontSize: 14, fontWeight: '700', color: ui.primaryBlue },
});
