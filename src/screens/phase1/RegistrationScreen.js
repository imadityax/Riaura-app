import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { saveUserProfile } from '../../firebase/firestore';
import { colors, ui, dark } from '../../theme/colors';
import { storage } from '../../utils/storage';
import { rf, scale, ms } from '../../utils/responsive';
import PhaseHeader from '../../components/PhaseHeader';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
const EDUCATION = ['High School', 'Diploma', 'Bachelor\'s', 'Master\'s', 'Doctorate', 'Other'];
const RELATIONSHIPS = ['Mother', 'Father', 'Guardian', 'Other'];

const MINOR_AGE = 18;

// ── Age from a day/month/year triple. Returns null until the date is complete
//    and valid; otherwise the whole-year age as of today.
function computeAge({ day, month, year }) {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (!d || !m || !y) return null;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const now = new Date();
  if (y < 1900 || y > now.getFullYear()) return null;
  const dob = new Date(y, m - 1, d);
  // Reject impossible dates like 31 Feb (Date rolls them over).
  if (dob.getFullYear() !== y || dob.getMonth() !== m - 1 || dob.getDate() !== d) return null;
  let age = now.getFullYear() - y;
  const beforeBirthday =
    now.getMonth() < m - 1 || (now.getMonth() === m - 1 && now.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

function Field({
  label, field, keyboardType = 'default', placeholder, value, error,
  onChange, secureTextEntry, inputRef, returnKeyType, onSubmitEditing, autoCapitalize,
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={inputRef}
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={v => onChange(field, v)}
        placeholder={placeholder || label}
        placeholderTextColor={dark.textMute}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || (keyboardType === 'email-address' ? 'none' : 'words')}
        secureTextEntry={secureTextEntry}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={returnKeyType === 'done'}
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
            activeOpacity={0.8}
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

export default function RegistrationScreen({ navigation, route }) {
  // Credentials chosen on the Auth (Sign Up) screen are passed forward so the
  // user doesn't have to re-enter them here.
  const prefill = route?.params ?? {};
  const [form, setForm] = useState({
    fullName: '', gender: '', mobile: '', email: prefill.email || '',
    education: '', occupation: '', city: '', state: '', country: '',
    password: prefill.password || '', confirmPassword: prefill.password || '',
    // Date of birth — age is derived from this, never typed directly.
    dobDay: '', dobMonth: '', dobYear: '',
    // Parent / guardian (required only when the participant is a minor).
    parentName: '', parentRelation: '', parentMobile: '', parentEmail: '',
  });
  const [errors, setErrors] = useState({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const monthRef = useRef(null);
  const yearRef = useRef(null);

  const age = useMemo(
    () => computeAge({ day: form.dobDay, month: form.dobMonth, year: form.dobYear }),
    [form.dobDay, form.dobMonth, form.dobYear]
  );
  const isMinor = age !== null && age < MINOR_AGE;

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  }

  // Digit-only setter for the DOB fields, with auto-advance to the next box.
  function setDob(field, value, maxLen, nextRef) {
    const digits = value.replace(/[^0-9]/g, '').slice(0, maxLen);
    set(field, digits);
    if (digits.length === maxLen && nextRef?.current) nextRef.current.focus();
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';

    if (!form.dobDay || !form.dobMonth || !form.dobYear) {
      e.dob = 'Enter your full date of birth';
    } else if (age === null) {
      e.dob = 'Enter a valid date of birth';
    } else if (age < 1 || age > 120) {
      e.dob = 'Enter a valid date of birth';
    }

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

    if (isMinor) {
      if (!form.parentName.trim()) e.parentName = 'Required';
      if (!form.parentRelation) e.parentRelation = 'Required';
      if (!/^[0-9]{10}$/.test(form.parentMobile)) e.parentMobile = 'Enter valid 10-digit mobile';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.parentEmail)) e.parentEmail = 'Enter valid email';
      if (!guardianConsent) e.guardianConsent = 'Parent/guardian consent is required for under-18 users';
    }

    if (!termsAccepted) e.terms = 'You must accept the Terms & Conditions';
    return e;
  }

  async function handleNext() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      // Surface non-field errors (DOB/terms/consent) that live outside a Field.
      const first = e.dob || e.terms || e.guardianConsent;
      if (first) Alert.alert('Please check the form', first);
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);

      const dob = `${form.dobYear}-${String(form.dobMonth).padStart(2, '0')}-${String(form.dobDay).padStart(2, '0')}`;

      const profile = {
        fullName: form.fullName, dob, age, isMinor,
        gender: form.gender, mobile: form.mobile, email: form.email,
        education: form.education, occupation: form.occupation,
        city: form.city, state: form.state, country: form.country,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        parent: isMinor ? {
          name: form.parentName.trim(),
          relation: form.parentRelation,
          mobile: form.parentMobile,
          email: form.parentEmail.trim(),
          consent: true,
        } : null,
      };

      await saveUserProfile(user.uid, profile);
      await storage.saveRegistration(profile);

      navigation.replace('Consent', { isMinor, parentName: form.parentName.trim() });
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.scrollContent}
        >
          <PhaseHeader phase={1} title="Participant Registration" subtitle="Tell us about yourself" progress={0.1} onBack={() => navigation.goBack()} />

          <View style={styles.form}>
            <Field label="Full Name" field="fullName" placeholder="Enter your full name" value={form.fullName} error={errors.fullName} onChange={set} />

            {/* ── Date of Birth (age is computed automatically) ── */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.dobRow}>
                <TextInput
                  style={[styles.dobInput, errors.dob && styles.inputError]}
                  value={form.dobDay}
                  onChangeText={v => setDob('dobDay', v, 2, monthRef)}
                  placeholder="DD"
                  placeholderTextColor={dark.textMute}
                  keyboardType="number-pad"
                  maxLength={2}
                  returnKeyType="next"
                />
                <Text style={styles.dobSep}>/</Text>
                <TextInput
                  ref={monthRef}
                  style={[styles.dobInput, errors.dob && styles.inputError]}
                  value={form.dobMonth}
                  onChangeText={v => setDob('dobMonth', v, 2, yearRef)}
                  placeholder="MM"
                  placeholderTextColor={dark.textMute}
                  keyboardType="number-pad"
                  maxLength={2}
                  returnKeyType="next"
                />
                <Text style={styles.dobSep}>/</Text>
                <TextInput
                  ref={yearRef}
                  style={[styles.dobInput, styles.dobYearInput, errors.dob && styles.inputError]}
                  value={form.dobYear}
                  onChangeText={v => setDob('dobYear', v, 4, null)}
                  placeholder="YYYY"
                  placeholderTextColor={dark.textMute}
                  keyboardType="number-pad"
                  maxLength={4}
                  returnKeyType="done"
                />
                {age !== null && age >= 1 && age <= 120 && (
                  <View style={[styles.ageChip, isMinor && styles.ageChipMinor]}>
                    <Text style={[styles.ageChipText, isMinor && styles.ageChipTextMinor]}>
                      Age {age}
                    </Text>
                  </View>
                )}
              </View>
              {errors.dob ? <Text style={styles.error}>{errors.dob}</Text> : (
                <Text style={styles.hint}>Your age is calculated automatically from this.</Text>
              )}
            </View>

            <SelectField label="Gender" field="gender" options={GENDERS} value={form.gender} error={errors.gender} onChange={set} />
            <Field label="Mobile Number" field="mobile" keyboardType="phone-pad" placeholder="10-digit mobile" value={form.mobile} error={errors.mobile} onChange={set} />
            <Field label="Email Address" field="email" keyboardType="email-address" placeholder="your@email.com" value={form.email} error={errors.email} onChange={set} />
            <SelectField label="Education" field="education" options={EDUCATION} value={form.education} error={errors.education} onChange={set} />
            <Field label="Occupation" field="occupation" placeholder="Student / Professional / etc." value={form.occupation} error={errors.occupation} onChange={set} />
            <Field label="City" field="city" placeholder="Your city" value={form.city} error={errors.city} onChange={set} />
            <Field label="State" field="state" placeholder="Your state" value={form.state} error={errors.state} onChange={set} />
            <Field label="Country" field="country" placeholder="Your country" value={form.country} error={errors.country} onChange={set} />

            {/* ── Parent / Guardian section — only for under-18 participants ── */}
            {isMinor && (
              <View style={styles.minorBlock}>
                <View style={styles.minorHeader}>
                  <Ionicons name="shield-checkmark" size={scale(18)} color={dark.neon} />
                  <Text style={styles.minorTitle}>Parent / Guardian Details</Text>
                </View>
                <Text style={styles.minorNote}>
                  Since you are under {MINOR_AGE}, a parent or guardian must provide their details
                  and consent for you to participate.
                </Text>

                <Field label="Parent / Guardian Name" field="parentName" placeholder="Full name" value={form.parentName} error={errors.parentName} onChange={set} />
                <SelectField label="Relationship" field="parentRelation" options={RELATIONSHIPS} value={form.parentRelation} error={errors.parentRelation} onChange={set} />
                <Field label="Parent Mobile Number" field="parentMobile" keyboardType="phone-pad" placeholder="10-digit mobile" value={form.parentMobile} error={errors.parentMobile} onChange={set} />
                <Field label="Parent Email Address" field="parentEmail" keyboardType="email-address" placeholder="parent@email.com" value={form.parentEmail} error={errors.parentEmail} onChange={set} />

                <TouchableOpacity
                  style={[styles.checkRow, guardianConsent && styles.checkRowOn, errors.guardianConsent && styles.checkRowError]}
                  onPress={() => { setGuardianConsent(v => !v); if (errors.guardianConsent) setErrors(e => ({ ...e, guardianConsent: '' })); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, guardianConsent && styles.checkboxOn]}>
                    {guardianConsent && <Ionicons name="checkmark" size={scale(14)} color="#fff" />}
                  </View>
                  <Text style={styles.checkText}>
                    As the parent/guardian, I consent to my child participating in the RHIMS™ assessment.
                  </Text>
                </TouchableOpacity>
                {errors.guardianConsent ? <Text style={styles.error}>{errors.guardianConsent}</Text> : null}
              </View>
            )}

            <View style={styles.divider} />

            <Field label="Password" field="password" placeholder="Min. 6 characters" value={form.password} error={errors.password} onChange={set} secureTextEntry autoCapitalize="none" />
            <Field label="Confirm Password" field="confirmPassword" placeholder="Repeat your password" value={form.confirmPassword} error={errors.confirmPassword} onChange={set} secureTextEntry autoCapitalize="none" />

            {/* ── Terms & Conditions acceptance ── */}
            <TouchableOpacity
              style={[styles.checkRow, termsAccepted && styles.checkRowOn, errors.terms && styles.checkRowError]}
              onPress={() => { setTermsAccepted(v => !v); if (errors.terms) setErrors(e => ({ ...e, terms: '' })); }}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, termsAccepted && styles.checkboxOn]}>
                {termsAccepted && <Ionicons name="checkmark" size={scale(14)} color="#fff" />}
              </View>
              <Text style={styles.checkText}>
                I have read and agree to the{' '}
                <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>
                  Terms &amp; Conditions
                </Text>.
              </Text>
            </TouchableOpacity>
            {errors.terms ? <Text style={styles.error}>{errors.terms}</Text> : null}

            <TouchableOpacity style={styles.btn} onPress={handleNext} activeOpacity={0.85} disabled={loading}>
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
  container: { flex: 1, backgroundColor: dark.bgSolid },
  scrollContent: { paddingBottom: scale(40) },
  form: { paddingHorizontal: scale(20), paddingBottom: scale(20) },
  fieldWrap: { marginBottom: ms(16) },
  label: { fontSize: rf(12), color: dark.textSub, fontWeight: '600', marginBottom: ms(6), letterSpacing: 0.5 },
  input: {
    backgroundColor: dark.glass,
    borderRadius: 12, borderWidth: 1, borderColor: dark.glassBorder,
    color: '#1E1B33', paddingHorizontal: scale(14), paddingVertical: ms(12), fontSize: rf(14),
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: rf(11), marginTop: ms(4) },
  hint: { color: dark.textMute, fontSize: rf(11), marginTop: ms(5) },

  // Date of birth row
  dobRow: { flexDirection: 'row', alignItems: 'center', gap: scale(8), flexWrap: 'wrap' },
  dobInput: {
    backgroundColor: dark.glass, borderRadius: 12, borderWidth: 1, borderColor: dark.glassBorder,
    color: '#1E1B33', paddingHorizontal: scale(12), paddingVertical: ms(12),
    fontSize: rf(15), textAlign: 'center', width: scale(58), fontWeight: '600',
  },
  dobYearInput: { width: scale(78) },
  dobSep: { fontSize: rf(18), color: dark.textMute, fontWeight: '700' },
  ageChip: {
    marginLeft: 'auto', backgroundColor: dark.neon + '15',
    borderRadius: 20, paddingHorizontal: scale(12), paddingVertical: ms(7),
    borderWidth: 1, borderColor: dark.neon + '40',
  },
  ageChipMinor: { backgroundColor: colors.warning + '18', borderColor: colors.warning + '55' },
  ageChipText: { fontSize: rf(12), fontWeight: '800', color: dark.neon },
  ageChipTextMinor: { color: colors.warning },

  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(8) },
  optionBtn: {
    paddingHorizontal: scale(12), paddingVertical: ms(8), borderRadius: 20,
    borderWidth: 1, borderColor: dark.glassBorder, backgroundColor: dark.glass,
  },
  optionSelected: { borderColor: dark.neon, backgroundColor: dark.neon + '18' },
  optionText: { fontSize: rf(12), color: dark.textSub, fontWeight: '500' },
  optionTextSelected: { color: dark.neon, fontWeight: '700' },

  // Minor / guardian block
  minorBlock: {
    marginTop: ms(8), padding: scale(16), borderRadius: 16,
    backgroundColor: colors.warning + '0D', borderWidth: 1, borderColor: colors.warning + '33',
  },
  minorHeader: { flexDirection: 'row', alignItems: 'center', gap: scale(8), marginBottom: ms(6) },
  minorTitle: { fontSize: rf(15), fontWeight: '800', color: '#1E1B33' },
  minorNote: { fontSize: rf(12), color: dark.textSub, lineHeight: rf(18), marginBottom: ms(14) },

  // Checkbox rows (terms + guardian consent)
  checkRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: scale(10),
    backgroundColor: dark.glass, borderRadius: 12, borderWidth: 1, borderColor: dark.glassBorder,
    padding: scale(13), marginTop: ms(6),
  },
  checkRowOn: { borderColor: dark.neon, backgroundColor: dark.neon + '0A' },
  checkRowError: { borderColor: colors.danger },
  checkbox: {
    width: scale(22), height: scale(22), borderRadius: 6, borderWidth: 2,
    borderColor: dark.glassBorder, alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  checkboxOn: { backgroundColor: dark.neon, borderColor: dark.neon },
  checkText: { flex: 1, fontSize: rf(12.5), color: '#1E1B33', lineHeight: rf(18) },
  link: { color: dark.neon, fontWeight: '800', textDecorationLine: 'underline' },

  divider: { height: 1, backgroundColor: dark.glassBorder, marginVertical: ms(20) },
  btn: { marginTop: ms(24), borderRadius: 14, overflow: 'hidden' },
  btnInner: { paddingVertical: ms(16), alignItems: 'center', borderRadius: 14, backgroundColor: dark.neon },
  btnText: { fontSize: rf(16), fontWeight: '800', color: '#fff' },
});
