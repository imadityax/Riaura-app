import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Switch, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';

const PREFS_KEY = 'rhims_preferences';

export default function SettingsScreen({ navigation }) {
  const [user,      setUser]      = useState(null);
  const [notifs,    setNotifs]    = useState(true);
  const [reminders, setReminders] = useState(false);

  useEffect(() => {
    (async () => {
      const reg  = await storage.getRegistration();
      if (reg) setUser(reg);
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
            navigation.replace('Login');
          },
        },
      ],
    );
  }

  const initial = user?.fullName?.[0]?.toUpperCase() || 'U';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={ui.darkText} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.accountAvatar}>
              <Text style={styles.accountInitial}>{initial}</Text>
            </View>
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
        trackColor={{ false: '#E5E7EB', true: ui.primaryBlue }}
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
  safe:    { flex: 1, backgroundColor: ui.offWhite },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: ui.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  pageTitle: { fontSize: 17, fontWeight: '800', color: ui.darkText },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: ui.lightText,
    letterSpacing: 1.5, marginTop: 22, marginBottom: 10,
  },
  card: {
    backgroundColor: ui.white, borderRadius: 18, paddingHorizontal: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  divider: { height: 1, backgroundColor: ui.borderGray },

  accountRow:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  accountAvatar: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: ui.primaryBlue, alignItems: 'center', justifyContent: 'center',
  },
  accountInitial: { fontSize: 18, fontWeight: '900', color: '#fff' },
  accountName:    { fontSize: 15, fontWeight: '800', color: ui.darkText },
  accountEmail:   { fontSize: 12, color: ui.midText, marginTop: 2 },

  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  infoRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rowLabel:  { fontSize: 14, fontWeight: '600', color: ui.darkText },
  rowSub:    { fontSize: 12, color: ui.midText, marginTop: 2 },
  rowValue:  { fontSize: 14, fontWeight: '600', color: ui.midText },

  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FEF2F2', borderRadius: 18,
    paddingHorizontal: 18, paddingVertical: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  dangerText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
});
