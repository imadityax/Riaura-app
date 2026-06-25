import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';

const BADGES = [
  { id: 1, label: 'First Step',    icon: '🏆', unlocked: true  },
  { id: 2, label: 'Week Warrior',  icon: '🔥', unlocked: true  },
  { id: 3, label: 'Top 10%',       icon: '⭐', unlocked: true  },
  { id: 4, label: 'Month Master',  icon: '🔒', unlocked: false },
  { id: 5, label: 'Complete Set',  icon: '🔒', unlocked: false },
];

const MENU = [
  { id: 'settings',  label: 'Settings & Preferences', icon: 'settings-outline' },
  { id: 'subs',      label: 'Subscription & Plans',   icon: 'diamond-outline' },
  { id: 'privacy',   label: 'Privacy & Security',     icon: 'shield-outline' },
  { id: 'rate',      label: 'Rate RiAura RHIMS',       icon: 'star-outline' },
];

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [xp]  = useState(2840);
  const [streak] = useState(14);

  useEffect(() => {
    storage.getRegistration().then(reg => {
      if (reg) setUser(reg);
    });
  }, []);

  const name    = user?.fullName || 'User';
  const email   = user?.email   || 'user@example.com';
  const initial = name[0]?.toUpperCase() || 'U';

  async function handleSignOut() {
    await storage.clearAll();
    navigation.replace('Login');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ui.blueGradStart} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Blue header */}
        <LinearGradient
          colors={[ui.blueGradStart, ui.blueGradEnd]}
          style={styles.header}
        >
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{name}</Text>
              <Text style={styles.userEmail}>{email}</Text>
              <View style={styles.chipRow}>
                <View style={styles.levelChip}>
                  <Text style={styles.levelChipText}>Lv.7 Cognitive Explorer</Text>
                </View>
                <View style={styles.premiumChip}>
                  <Text style={styles.premiumChipText}>Premium ✦</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🔥</Text>
              <Text style={styles.statVal}>{streak}d</Text>
              <Text style={styles.statLbl}>Streak</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={styles.statVal}>{xp.toLocaleString()}</Text>
              <Text style={styles.statLbl}>XP</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statVal}>Top 8%</Text>
              <Text style={styles.statLbl}>Rank</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Badges</Text>
          <View style={styles.badgeGrid}>
            {BADGES.map(b => (
              <View key={b.id} style={[styles.badgeItem, !b.unlocked && styles.badgeLocked]}>
                <View style={[styles.badgeIconBg, b.unlocked && styles.badgeIconUnlocked]}>
                  <Text style={styles.badgeEmoji}>{b.icon}</Text>
                </View>
                <Text style={[styles.badgeLabel, !b.unlocked && styles.badgeLabelLocked]}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {MENU.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuRow, i < MENU.length - 1 && styles.menuBorder]}
              activeOpacity={0.7}
            >
              <Ionicons name={item.icon} size={20} color={ui.midText} style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={ui.lightText} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutRow} onPress={handleSignOut} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.menuIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: ui.offWhite },
  scroll: { flex: 1 },

  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 },
  avatarRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 24 },
  avatar: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 26, fontWeight: '900', color: '#fff' },
  userName:   { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 2 },
  userEmail:  { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
  chipRow:    { flexDirection: 'row', gap: 8 },
  levelChip: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  levelChipText:  { fontSize: 11, fontWeight: '700', color: '#fff' },
  premiumChip: {
    backgroundColor: '#F5C518',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  premiumChipText: { fontSize: 11, fontWeight: '800', color: '#1A1A2E' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14, padding: 12, alignItems: 'center',
  },
  statIcon: { fontSize: 16, marginBottom: 4 },
  statVal:  { fontSize: 15, fontWeight: '900', color: '#fff' },
  statLbl:  { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  section:      { margin: 20, backgroundColor: ui.white, borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: ui.darkText, marginBottom: 14 },
  badgeGrid:    { flexDirection: 'row', gap: 8 },
  badgeItem:    { flex: 1, alignItems: 'center', gap: 6 },
  badgeLocked:  { opacity: 0.45 },
  badgeIconBg:  { width: 48, height: 48, borderRadius: 14, backgroundColor: ui.inputBg, alignItems: 'center', justifyContent: 'center' },
  badgeIconUnlocked: { backgroundColor: '#FEF3C7' },
  badgeEmoji:   { fontSize: 22 },
  badgeLabel:       { fontSize: 9, fontWeight: '700', color: ui.darkText, textAlign: 'center' },
  badgeLabelLocked: { color: ui.lightText },

  menuCard: { marginHorizontal: 20, backgroundColor: ui.white, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, marginBottom: 12 },
  menuRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16 },
  menuBorder:{ borderBottomWidth: 1, borderBottomColor: ui.borderGray },
  menuIcon:  { marginRight: 14 },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: ui.darkText },

  signOutRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, backgroundColor: ui.white, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  signOutText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
});
