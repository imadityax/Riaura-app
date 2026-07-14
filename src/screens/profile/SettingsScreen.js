import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from '../../components/Avatar';
import { Emblem } from '../../components/VisualKit';
import { ui, dark } from '../../theme/colors';
import { storage } from '../../utils/storage';

const PREFS_KEY = 'rhims_preferences';

export default function SettingsScreen({ navigation }) {
  const [user,      setUser]      = useState(null);
  const [notifs,    setNotifs]    = useState(true);
  const [reminders, setReminders] = useState(false);
  const [photo,     setPhoto]     = useState(null);

  useEffect(() => {
    (async () => {
      const reg  = await storage.getRegistration();
      if (reg) setUser(reg);
      setPhoto(await storage.getProfilePhoto());
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setNotifs(p.notifications ?? true);
        setReminders(p.reminders ?? false);
      }
    })();
  }, []);

  async function savePref(key, val) {
    const raw  = await AsyncStorage.getItem(PREFS_KEY);
    const prefs = raw ? JSON.parse(raw) : {};
    prefs[key] = val;
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }

  function handleResetData() {
    Alert.alert(
      'Reset All Data',
      'This will erase all your assessment scores and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => {
            await storage.clearAll();
            navigation.replace('Auth');
          },
        },
      ],
    );
  }

  const initial = user?.fullName?.[0]?.toUpperCase() || 'U';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={'#1E1B33'} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.introHead}>
          <Emblem icon="cog-outline" size={60} />
          <Text style={styles.introText}>Manage your account & preferences</Text>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <Avatar photo={photo} initial={initial} size={44} style={styles.accountAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.accountName}>{user?.fullName || '—'}</Text>
              <Text style={styles.accountEmail}>{user?.email || '—'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <InfoRow label="Age"    value={user?.age    ?? '—'} />
          <View style={styles.divider} />
          <InfoRow label="Gender" value={user?.gender ?? '—'} />
        </View>

        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Push Notifications"
            sub="Assessment reminders and updates"
            value={notifs}
            onChange={v => { setNotifs(v); savePref('notifications', v); }}
          />
          <View style={styles.divider} />
          <ToggleRow
            label="Daily Reminders"
            sub="Nudge to complete your assessments"
            value={reminders}
            onChange={v => { setReminders(v); savePref('reminders', v); }}
          />
        </View>

        <Text style={styles.sectionLabel}>APP INFO</Text>
        <View style={styles.card}>
          <InfoRow label="Version" value="1.0.0" />
          <View style={styles.divider} />
          <InfoRow label="Build"   value="2025.06" />
          <View style={styles.divider} />
          <InfoRow label="Platform" value="RiAura RHIMS" />
        </View>

        <Text style={styles.sectionLabel}>DATA</Text>
        <TouchableOpacity style={styles.dangerBtn} onPress={handleResetData} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.dangerText}>Reset All Assessment Data</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({ label, sub, value, onChange }) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#E5E7EB', true: dark.neon }}
        thumbColor="#fff"
      />
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{String(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: dark.bgSolid },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  introHead: { alignItems: 'center', paddingTop: 8, paddingBottom: 18, gap: 10 },
  introText: { fontSize: 13, color: dark.textSub },

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

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: dark.textMute,
    letterSpacing: 1.5, marginTop: 22, marginBottom: 10,
  },
  card: {
    backgroundColor: dark.glass, borderRadius: 18, paddingHorizontal: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  divider: { height: 1, backgroundColor: dark.glassBorder },

  accountRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  accountAvatar: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: dark.neon, alignItems: 'center', justifyContent: 'center',
  },
  accountInitial: { fontSize: 18, fontWeight: '900', color: '#fff' },
  accountName:    { fontSize: 15, fontWeight: '800', color: '#1E1B33' },
  accountEmail:   { fontSize: 12, color: dark.textSub, marginTop: 2 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  infoRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rowLabel:  { fontSize: 14, fontWeight: '600', color: '#1E1B33' },
  rowSub:    { fontSize: 12, color: dark.textSub, marginTop: 2 },
  rowValue:  { fontSize: 14, fontWeight: '600', color: dark.textSub },

  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEF2F2', borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  dangerText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
});
