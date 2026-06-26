import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { saveUserProfile } from '../../firebase/firestore';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';
import PhaseHeader from '../../components/PhaseHeader';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const EDUCATION = ['High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'Doctorate', 'Other'];

function Field({ label, field, keyboardType = 'default', placeholder, value, error, onChange, secureTextEntry }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={v => onChange(field, v)}
        placeholder={placeholder || label}
        placeholderTextColor={ui.lightText}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
        secureTextEntry={secureTextEntry}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function SelectField({ label, field, options, value, error, onChange }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.optionBtn, value === opt && styles.optionSelected]}
            onPress={() => onChange(field, opt)}
          >
            <Text style={[styles.optionText, value === opt && styles.optionTextSelected]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export default function RegistrationScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '', age: '', gender: '', mobile: '', email: '',
    education: '', occupation: '', city: '', state: '', country: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    const age = parseInt(form.age);
    if (!form.age || isNaN(age) || age < 18 || age > 25) e.age = 'Age must be 18–25';
    if (!form.gender) e.gender = 'Required';
    if (!/^[0-9]{10}$/.test(form.mobile)) e.mobile = 'Enter valid 10-digit mobile';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter valid email';
    if (!form.education) e.education = 'Required';
    if (!form.occupation.trim()) e.occupation = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (!form.country.trim()) e.country = 'Required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    return e;
  }

  async function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);

      const profile = {
        fullName: form.fullName, age: parseInt(form.age), gender: form.gender,
        mobile: form.mobile, email: form.email, education: form.education,
        occupation: form.occupation, city: form.city, state: form.state, country: form.country,
      };

      await saveUserProfile(user.uid, profile);
      await storage.saveRegistration(profile);

      navigation.replace('Consent');
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists. Please sign in.'
        : err.message;
      Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <PhaseHeader phase={1} title="Participant Registration" subtitle="Tell us about yourself" progress={0.1} />

          <View style={styles.form}>
            <Field label="Full Name" field="fullName" placeholder="Enter your full name" value={form.fullName} error={errors.fullName} onChange={set} />
            <Field label="Age (18–25)" field="age" keyboardType="numeric" placeholder="Your age" value={form.age} error={errors.age} onChange={set} />
            <SelectField label="Gender" field="gender" options={GENDERS} value={form.gender} error={errors.gender} onChange={set} />
            <Field label="Mobile Number" field="mobile" keyboardType="phone-pad" placeholder="10-digit mobile" value={form.mobile} error={errors.mobile} onChange={set} />
            <Field label="Email Address" field="email" keyboardType="email-address" placeholder="your@email.com" value={form.email} error={errors.email} onChange={set} />
            <SelectField label="Education" field="education" options={EDUCATION} value={form.education} error={errors.education} onChange={set} />
            <Field label="Occupation" field="occupation" placeholder="Student / Professional / etc." value={form.occupation} error={errors.occupation} onChange={set} />
            <Field label="City" field="city" placeholder="Your city" value={form.city} error={errors.city} onChange={set} />
            <Field label="State" field="state" placeholder="Your state" value={form.state} error={errors.state} onChange={set} />
            <Field label="Country" field="country" placeholder="Your country" value={form.country} error={errors.country} onChange={set} />

            <View style={styles.divider} />

            <Field label="Password" field="password" placeholder="Min. 6 characters" value={form.password} error={errors.password} onChange={set} secureTextEntry />
            <Field label="Confirm Password" field="confirmPassword" placeholder="Repeat your password" value={form.confirmPassword} error={errors.confirmPassword} onChange={set} secureTextEntry />

            <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.8} disabled={loading}>
              <View style={styles.btnInner}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnText}>Continue to Consent →</Text>
                }
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ui.offWhite },
  form: { paddingHorizontal: 20, paddingBottom: 40 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, color: ui.midText, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: ui.white,
    borderRadius: 12, borderWidth: 1, borderColor: ui.borderGray,
    color: ui.darkText, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 11, marginTop: 4 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionBtn: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1, borderColor: ui.borderGray, backgroundColor: ui.white,
  },
  optionSelected: { borderColor: ui.primaryBlue, backgroundColor: ui.primaryBlue + '18' },
  optionText: { fontSize: 12, color: ui.midText, fontWeight: '500' },
  optionTextSelected: { color: ui.primaryBlue, fontWeight: '700' },
  divider: { height: 1, backgroundColor: ui.borderGray, marginVertical: 20 },
  btn: { marginTop: 24, borderRadius: 14, overflow: 'hidden' },
  btnInner: { paddingVertical: 16, alignItems: 'center', borderRadius: 14, backgroundColor: ui.primaryBlue },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
