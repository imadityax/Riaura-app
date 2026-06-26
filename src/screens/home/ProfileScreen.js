import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
  StatusBar, Modal, Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';

function levelInfo(score) {
  if (score >= 90) return { level: 9, title: 'Master Intellect',   xp: 3600 };
  if (score >= 80) return { level: 7, title: 'Cognitive Explorer', xp: 2840 };
  if (score >= 70) return { level: 5, title: 'Rising Thinker',     xp: 1920 };
  if (score >= 60) return { level: 3, title: 'Emerging Mind',      xp: 1100 };
  return                  { level: 1, title: 'Curious Learner',    xp: 400  };
}

function getRank(score) {
  if (score >= 90) return 'Top 5%';
  if (score >= 80) return 'Top 10%';
  if (score >= 70) return 'Top 20%';
  if (score >= 60) return 'Top 35%';
  if (score >= 1)  return 'Top 60%';
  return '—';
}

function buildBadges({ registered, mindfulDone, phase2Done, phase3Done, phase4Done, score }) {
  return [
    { id: 1, label: 'First Step',      icon: '🏆', unlocked: registered },
    { id: 2, label: 'Mindful Mind',    icon: '🧘', unlocked: mindfulDone },
    { id: 3, label: 'Brain Tested',    icon: '🧠', unlocked: phase3Done },
    { id: 4, label: 'Full Profile',    icon: '🎯', unlocked: mindfulDone && phase2Done && phase3Done },
    { id: 5, label: 'High Performer',  icon: '⭐', unlocked: score >= 60 },
    { id: 6, label: 'Elite Intellect', icon: '💎', unlocked: score >= 80 },
    { id: 7, label: 'Interview Ready', icon: '📋', unlocked: phase4Done },
    { id: 8, label: 'Top Mind',        icon: '🔥', unlocked: score >= 90 },
  ];
}

const COMING_SOON_FEATURES = [
  { icon: '🧬', label: 'Full Lab Access Report' },
  { icon: '🎯', label: '1-on-1 Expert Interview' },
  { icon: '📈', label: 'Advanced Growth Analytics' },
  { icon: '🏅', label: 'Certification & Credentials' },
  { icon: '🌐', label: 'Global Leaderboard' },
];

export default function ProfileScreen({ navigation }) {
  const [user,        setUser]        = useState(null);
  const [score,       setScore]       = useState(0);
  const [assessCount, setAssessCount] = useState(0);
  const [badges,      setBadges]      = useState([]);

  const [showSubs,   setShowSubs]   = useState(false);
  const [showRate,   setShowRate]   = useState(false);
  const [starPicked, setStarPicked] = useState(0);
  const [rated,      setRated]      = useState(false);

  useEffect(() => {
    (async () => {
      const reg        = await storage.getRegistration();
      const ms         = await storage.getMindfulnessScore();
      const { answers} = await storage.getPhase2Answers();
      const { scores } = await storage.getPhase3Scores();
      const p4Marks    = await storage.getPhase4Marks();
      const saved      = await storage.getScores();

      if (reg) setUser(reg);

      const mindfulDone = ms != null;
      const phase2Done  = answers.length >= 40;
      const phase3Done  = scores.length >= 8;
      const phase4Done  = p4Marks !== null;
      const combined    = Math.round(saved?.combined?.percent ?? 0);

      setScore(combined);
      setAssessCount([mindfulDone, phase2Done, phase3Done].filter(Boolean).length);
      setBadges(buildBadges({ registered: !!reg, mindfulDone, phase2Done, phase3Done, phase4Done, score: combined }));
    })();
  }, []);

  const name    = user?.fullName || 'User';
  const email   = user?.email   || '';
  const initial = name[0]?.toUpperCase() || 'U';
  const lv      = levelInfo(score);
  const rank    = getRank(score);

  async function handleSignOut() {
    await storage.clearAll();
    await signOut(auth);
    navigation.replace('Login');
  }

  function handleMenu(id) {
    if (id === 'settings') navigation.navigate('Settings');
    if (id === 'subs')     setShowSubs(true);
    if (id === 'privacy')  navigation.navigate('Privacy');
    if (id === 'rate')     { setStarPicked(0); setRated(false); setShowRate(true); }
  }

  function submitRating() {
    setRated(true);
  }

  const MENU = [
    { id: 'settings',  label: 'Settings & Preferences', icon: 'settings-outline' },
    { id: 'subs',      label: 'Subscription & Plans',   icon: 'diamond-outline' },
    { id: 'privacy',   label: 'Privacy & Security',     icon: 'shield-outline' },
    { id: 'rate',      label: 'Rate RiAura RHIMS',       icon: 'star-outline' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ui.blueGradStart} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Blue header */}
        <LinearGradient colors={[ui.blueGradStart, ui.blueGradEnd]} style={styles.header}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{name}</Text>
              {!!email && <Text style={styles.userEmail}>{email}</Text>}
              <View style={styles.chipRow}>
                <View style={styles.levelChip}>
                  <Text style={styles.levelChipText}>Lv.{lv.level} {lv.title}</Text>
                </View>
                {score >= 60 && (
                  <View style={styles.premiumChip}>
                    <Text style={styles.premiumChipText}>High Perf ✦</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statVal}>{assessCount}/3</Text>
              <Text style={styles.statLbl}>Assessed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>⚡</Text>
              <Text style={styles.statVal}>{lv.xp.toLocaleString()}</Text>
              <Text style={styles.statLbl}>XP</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statIcon}>🏆</Text>
              <Text style={styles.statVal}>{rank}</Text>
              <Text style={styles.statLbl}>Rank</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Badges */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Badges</Text>
          <View style={styles.badgeGrid}>
            {badges.map(b => (
              <View key={b.id} style={[styles.badgeItem, !b.unlocked && styles.badgeLocked]}>
                <View style={[styles.badgeIconBg, b.unlocked && styles.badgeIconUnlocked]}>
                  <Text style={styles.badgeEmoji}>{b.unlocked ? b.icon : '🔒'}</Text>
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
              onPress={() => handleMenu(item.id)}
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

      {/* ── Subscription Coming Soon Modal ── */}
      <Modal visible={showSubs} transparent animationType="slide" onRequestClose={() => setShowSubs(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowSubs(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetEmoji}>💎</Text>
            <Text style={styles.sheetTitle}>Premium Plans</Text>
            <Text style={styles.sheetSub}>Unlock the full power of RiAura RHIMS. Coming very soon.</Text>

            <View style={styles.featureList}>
              {COMING_SOON_FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <View style={styles.soonBadge}><Text style={styles.soonText}>Soon</Text></View>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.sheetBtn} activeOpacity={0.85} onPress={() => setShowSubs(false)}>
              <Text style={styles.sheetBtnText}>Notify Me When Available</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowSubs(false)} style={{ marginTop: 12, alignSelf: 'center' }}>
              <Text style={{ color: ui.midText, fontSize: 14 }}>Maybe later</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Rate Modal ── */}
      <Modal visible={showRate} transparent animationType="slide" onRequestClose={() => setShowRate(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowRate(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            {rated ? (
              <>
                <Text style={styles.sheetEmoji}>🎉</Text>
                <Text style={styles.sheetTitle}>Thank You!</Text>
                <Text style={styles.sheetSub}>Your feedback helps us build a better experience for everyone.</Text>
                <TouchableOpacity style={styles.sheetBtn} activeOpacity={0.85} onPress={() => setShowRate(false)}>
                  <Text style={styles.sheetBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.sheetEmoji}>⭐</Text>
                <Text style={styles.sheetTitle}>Rate RiAura RHIMS</Text>
                <Text style={styles.sheetSub}>How would you rate your experience so far?</Text>

                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <TouchableOpacity key={n} onPress={() => setStarPicked(n)} activeOpacity={0.7}>
                      <Text style={[styles.star, n <= starPicked && styles.starFilled]}>★</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {starPicked > 0 && (
                  <Text style={styles.rateHint}>
                    {starPicked === 5 ? 'Excellent! You love it 🎉' :
                     starPicked >= 4 ? 'Great! Glad you enjoy it 😊' :
                     starPicked >= 3 ? 'Thanks for the honest feedback 👍' :
                     'Sorry to hear that. We\'ll keep improving 🙏'}
                  </Text>
                )}

                <TouchableOpacity
                  style={[styles.sheetBtn, !starPicked && styles.sheetBtnDisabled]}
                  activeOpacity={starPicked ? 0.85 : 1}
                  onPress={starPicked ? submitRating : null}
                >
                  <Text style={styles.sheetBtnText}>Submit Rating</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowRate(false)} style={{ marginTop: 12, alignSelf: 'center' }}>
                  <Text style={{ color: ui.midText, fontSize: 14 }}>Not now</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: ui.offWhite },
  scroll: { flex: 1 },

  header:    { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28 },
  avatarRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 24 },
  avatar: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText:  { fontSize: 26, fontWeight: '900', color: '#fff' },
  userName:    { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 2 },
  userEmail:   { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 10 },
  chipRow:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  levelChip:   { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  levelChipText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  premiumChip:   { backgroundColor: '#F5C518', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  premiumChipText: { fontSize: 11, fontWeight: '800', color: '#1A1A2E' },

  statsRow: { flexDirection: 'row', gap: 10 },
  statBox:  { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 12, alignItems: 'center' },
  statIcon: { fontSize: 16, marginBottom: 4 },
  statVal:  { fontSize: 15, fontWeight: '900', color: '#fff' },
  statLbl:  { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  section:      { margin: 20, backgroundColor: ui.white, borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: ui.darkText, marginBottom: 14 },
  badgeGrid:    { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  badgeItem:    { width: '23%', alignItems: 'center', gap: 6 },
  badgeLocked:  { opacity: 0.4 },
  badgeIconBg:  { width: 48, height: 48, borderRadius: 14, backgroundColor: ui.inputBg, alignItems: 'center', justifyContent: 'center' },
  badgeIconUnlocked: { backgroundColor: '#FEF3C7' },
  badgeEmoji:   { fontSize: 22 },
  badgeLabel:       { fontSize: 9, fontWeight: '700', color: ui.darkText, textAlign: 'center' },
  badgeLabelLocked: { color: ui.lightText },

  menuCard:   { marginHorizontal: 20, backgroundColor: ui.white, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, marginBottom: 12 },
  menuRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: ui.borderGray },
  menuIcon:   { marginRight: 14 },
  menuLabel:  { flex: 1, fontSize: 14, fontWeight: '600', color: ui.darkText },

  signOutRow:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, backgroundColor: ui.white, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  signOutText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },

  // Modal shared
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: ui.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetEmoji: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 22, fontWeight: '900', color: ui.darkText, textAlign: 'center', marginBottom: 8 },
  sheetSub:   { fontSize: 14, color: ui.midText, textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  // Subscription modal
  featureList: { gap: 12, marginBottom: 24 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: ui.offWhite, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  featureIcon: { fontSize: 20 },
  featureLabel:{ flex: 1, fontSize: 14, fontWeight: '600', color: ui.darkText },
  soonBadge:   { backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  soonText:    { fontSize: 11, fontWeight: '700', color: '#92400E' },

  // Rating modal
  starsRow:   { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  star:       { fontSize: 42, color: '#D1D5DB' },
  starFilled: { color: '#F59E0B' },
  rateHint:   { fontSize: 13, color: ui.midText, textAlign: 'center', marginBottom: 20 },

  // Shared button
  sheetBtn: { backgroundColor: ui.primaryBlue, borderRadius: 24, paddingVertical: 15, alignItems: 'center', shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  sheetBtnDisabled: { backgroundColor: '#9CA3AF', shadowOpacity: 0 },
  sheetBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
