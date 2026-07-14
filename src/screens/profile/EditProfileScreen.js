import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Avatar from '../../components/Avatar';
import { ui, dark } from '../../theme/colors';
import { storage } from '../../utils/storage';
import { auth } from '../../firebase/config';
import { updateUserProfileFields, uploadProfilePhoto, removeProfilePhotoFromCloud } from '../../firebase/firestore';

const GENDERS = ['Male', 'Female', 'Other'];

export default function EditProfileScreen({ navigation }) {
  const [form, setForm]       = useState({ fullName: '', age: '', gender: '', mobile: '', education: '' });
  const [email, setEmail]     = useState('');
  const [photo, setPhoto]     = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  useEffect(() => {
    storage.getRegistration().then(reg => {
      if (!reg) return;
      setForm({
        fullName:  reg.fullName  || '',
        age:       String(reg.age ?? ''),
        gender:    reg.gender    || '',
        mobile:    reg.mobile    || '',
        education: reg.education || '',
      });
      setEmail(reg.email || '');
    });
    storage.getProfilePhoto().then(setPhoto);
  }, []);

  async function pickFrom(source) {
    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', `Please allow ${source === 'camera' ? 'camera' : 'photo'} access in Settings to change your picture.`);
      return;
    }
    const opts = { allowsEditing: true, aspect: [1, 1], quality: 0.4, base64: true };
    const res = source === 'camera'
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (res.canceled) return;
    const asset = res.assets[0];
    const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
    setPhoto(uri);
    await storage.saveProfilePhoto(uri);   // persist locally & instantly
    // Upload to the cloud in the background so it syncs across devices.
    if (auth.currentUser && uri.startsWith('data:')) {
      setUploading(true);
      uploadProfilePhoto(auth.currentUser.uid, uri)
        .catch(() => {})
        .finally(() => setUploading(false));
    }
  }

  function changePhoto() {
    const options = [
      { text: 'Take Photo', onPress: () => pickFrom('camera') },
      { text: 'Choose from Library', onPress: () => pickFrom('library') },
    ];
    if (photo) options.push({
      text: 'Remove Photo', style: 'destructive',
      onPress: async () => {
        setPhoto(null);
        await storage.removeProfilePhoto();
        if (auth.currentUser) removeProfilePhotoFromCloud(auth.currentUser.uid).catch(() => {});
      },
    });
    options.push({ text: 'Cancel', style: 'cancel' });
    Alert.alert('Profile Photo', 'Update your profile picture', options);
  }

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Name is required';
    const age = parseInt(form.age, 10);
    if (!form.age || isNaN(age) || age < 1 || age > 120) e.age = 'Enter a valid age';
    if (!form.gender) e.gender = 'Select a gender';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      const existing = (await storage.getRegistration()) || {};
      const profile = {
        ...existing,
        fullName:  form.fullName.trim(),
        age:       parseInt(form.age, 10),
        gender:    form.gender,
        mobile:    form.mobile.trim(),
        education: form.education.trim(),
      };
      await storage.updateRegistration(profile);
      if (auth.currentUser) {
        await updateUserProfileFields(auth.currentUser.uid, profile).catch(() => {});
      }
      Alert.alert('Saved', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={'#1E1B33'} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.avatarWrap}>
            <TouchableOpacity activeOpacity={0.85} onPress={changePhoto}>
              <Avatar photo={photo} initial={form.fullName[0]?.toUpperCase() || 'U'} size={92} style={styles.avatar} />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={changePhoto} disabled={uploading}>
              <Text style={styles.changePhotoText}>
                {uploading ? 'Syncing…' : photo ? 'Change Photo' : 'Add Photo'}
              </Text>
            </TouchableOpacity>
            {!!email && <Text style={styles.emailText}>{email}</Text>}
            <Text style={styles.emailHint}>Email can't be changed — it's your sign-in ID</Text>
          </View>

          <Field label="Full Name" error={errors.fullName}>
            <TextInput
              style={styles.input}
              value={form.fullName}
              onChangeText={v => set('fullName', v)}
              placeholder="Your full name"
              placeholderTextColor={dark.textMute}
            />
          </Field>

          <Field label="Age" error={errors.age}>
            <TextInput
              style={styles.input}
              value={form.age}
              onChangeText={v => set('age', v.replace(/[^0-9]/g, ''))}
              placeholder="Your age"
              placeholderTextColor={dark.textMute}
              keyboardType="number-pad"
              maxLength={3}
            />
          </Field>

          <Field label="Gender" error={errors.gender}>
            <View style={styles.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderChip, form.gender === g && styles.genderChipActive]}
                  onPress={() => set('gender', g)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.genderText, form.gender === g && styles.genderTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Field>

          <Field label="Mobile (optional)">
            <TextInput
              style={styles.input}
              value={form.mobile}
              onChangeText={v => set('mobile', v)}
              placeholder="Phone number"
              placeholderTextColor={dark.textMute}
              keyboardType="phone-pad"
            />
          </Field>

          <Field label="Education (optional)">
            <TextInput
              style={styles.input}
              value={form.education}
              onChangeText={v => set('education', v)}
              placeholder="Highest qualification"
              placeholderTextColor={dark.textMute}
            />
          </Field>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.saveText}>Save Changes</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, error, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: dark.bgSolid },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: dark.glass, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  pageTitle: { fontSize: 17, fontWeight: '800', color: '#1E1B33' },

  avatarWrap: { alignItems: 'center', marginVertical: 18 },
  avatar: { borderWidth: 3, borderColor: dark.glass },
  cameraBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 32, height: 32, borderRadius: 16, backgroundColor: dark.neon,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: dark.bgSolid,
  },
  changePhotoText: { fontSize: 13.5, fontWeight: '700', color: dark.neon, marginTop: 10 },
  emailText:  { fontSize: 14, fontWeight: '600', color: '#1E1B33', marginTop: 8 },
  emailHint:  { fontSize: 11, color: dark.textMute, marginTop: 3 },

  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: dark.textSub, marginBottom: 7 },
  input: {
    backgroundColor: dark.glass, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: '#1E1B33', borderWidth: 1, borderColor: dark.glassBorder,
  },
  errorText: { fontSize: 11, color: '#EF4444', marginTop: 5 },

  genderRow:  { flexDirection: 'row', gap: 10 },
  genderChip: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: dark.glass, borderWidth: 1.5, borderColor: dark.glassBorder,
  },
  genderChipActive: { backgroundColor: dark.neon, borderColor: dark.neon },
  genderText:       { fontSize: 13, fontWeight: '700', color: dark.textSub },
  genderTextActive: { color: '#fff' },

  saveBtn: {
    backgroundColor: dark.neon, borderRadius: 28, paddingVertical: 16,
    alignItems: 'center', marginTop: 10,
    shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  saveText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
