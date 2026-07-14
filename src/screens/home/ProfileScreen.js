import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Modal, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { dark } from '../../theme/colors';
import Icon from '../../components/Icon';
import Avatar from '../../components/Avatar';
import { RingStat } from '../../components/VisualKit';
import { Screen, GlassCard, NeonButton } from '../../components/GlassKit';
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
    { id: 1, label: 'First Step',      icon: 'trophy-outline', unlocked: registered },
    { id: 2, label: 'Mindful Mind',    icon: 'meditation', unlocked: mindfulDone },
    { id: 3, label: 'Brain Tested',    icon: 'brain', unlocked: phase3Done },
    { id: 4, label: 'Full Profile',    icon: 'target', unlocked: mindfulDone && phase2Done && phase3Done },
    { id: 5, label: 'High Performer',  icon: 'star-outline', unlocked: score >= 60 },
    { id: 6, label: 'Elite Intellect', icon: 'diamond-outline', unlocked: score >= 80 },
    { id: 7, label: 'Interview Ready', icon: 'clipboard-text-outline', unlocked: phase4Done },
    { id: 8, label: 'Top Mind',        icon: 'fire', unlocked: score >= 90 },
  ];
}

const COMING_SOON_FEATURES = [
  { icon: 'dna', label: 'Full Lab Access Report' },
  { icon: 'target', label: '1-on-1 Expert Interview' },
  { icon: 'trending-up', label: 'Advanced Growth Analytics' },
  { icon: 'medal-outline', label: 'Certification & Credentials' },
  { icon: 'earth', label: 'Global Leaderboard' },
];

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [user,        setUser]        = useState(null);
  const [score,       setScore]       = useState(0);
  const [assessCount, setAssessCount] = useState(0);
  const [badges,      setBadges]      = useState([]);
  const [photo,       setPhoto]       = useState(null);
  const [showSubs,   setShowSubs]   = useState(false);
  const [showRate,   setShowRate]   = useState(false);
  const [starPicked, setStarPicked] = useState(0);
  const [rated,      setRated]      = useState(false);

  useFocusEffect(useCallback(() => {
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
      setPhoto(await storage.getProfilePhoto());
    })();
  }, []));

  const name    = user?.fullName || 'User';
  const email   = user?.email   || '';
  const initial = name[0]?.toUpperCase() || 'U';
  const lv      = levelInfo(score);
  const rank    = getRank(score);

  async function handleSignOut() {
    await storage.clearAll();
    await signOut(auth);
    navigation.replace('Auth');
  }

  function handleMenu(id) {
    if (id === 'edit')      navigation.navigate('EditProfile');
    if (id === 'analytics') navigation.navigate('DNA');
    if (id === 'growth')    navigation.navigate('Growth');
    if (id === 'settings')  navigation.navigate('Settings');
    if (id === 'subs')      setShowSubs(true);
    if (id === 'privacy')   navigation.navigate('Privacy');
    if (id === 'help')      navigation.navigate('HelpSupport');
    if (id === 'about')     navigation.navigate('About');
    if (id === 'rate')      { setStarPicked(0); setRated(false); setShowRate(true); }
  }

  const MENU = [
    { id: 'edit',      label: 'Edit Profile',            icon: 'person-outline' },
    { id: 'analytics', label: 'Intelligence Analytics',  icon: 'stats-chart-outline' },
    { id: 'growth',    label: 'Growth Path',             icon: 'trending-up-outline' },
    { id: 'settings',  label: 'Settings & Preferences',  icon: 'settings-outline' },
    { id: 'subs',      label: 'Subscription & Plans',    icon: 'diamond-outline' },
    { id: 'privacy',   label: 'Privacy & Security',      icon: 'shield-outline' },
    { id: 'help',      label: 'Help & Support',          icon: 'help-buoy-outline' },
    { id: 'about',     label: 'About RHIMS',             icon: 'information-circle-outline' },
    { id: 'rate',      label: 'Rate RiAura RHIMS',        icon: 'star-outline' },
  ];

  return (
    <Screen edges={[]}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Hero */}
        <View style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <View style={styles.avatarRow}>
            <Avatar photo={photo} initial={initial} size={64} bg={dark.violet2} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{name}</Text>
              {!!email && <Text style={styles.userEmail}>{email}</Text>}
              <View style={styles.chipRow}>
                <View style={styles.levelChip}><Text style={styles.levelChipText}>Lv.{lv.level} {lv.title}</Text></View>
                {score >= 60 && <View style={styles.premiumChip}><Text style={styles.premiumChipText}>High Perf</Text></View>}
              </View>
            </View>
          </View>

          <GlassCard style={styles.scoreBanner} tint={dark.glassStrong}>
            <RingStat percent={score} size={86} stroke={8} color={dark.neon} color2={dark.violet} trackColor="#ECE8F5">
              <Text style={styles.scoreRingNum}>{score}</Text>
              <Text style={styles.scoreRingSub}>SCORE</Text>
            </RingStat>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreBannerTitle}>Intelligence Score</Text>
              <Text style={styles.scoreBannerSub}>{lv.title} · {rank} globally</Text>
            </View>
          </GlassCard>

          <View style={styles.statsRow}>
            <StatBox icon="chart-box-outline" val={`${assessCount}/3`} lbl="Assessed" />
            <StatBox icon="lightning-bolt-outline" val={lv.xp.toLocaleString()} lbl="XP" />
            <StatBox icon="trophy-outline" val={rank} lbl="Rank" />
          </View>
        </View>

        {/* Badges */}
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>My Badges</Text>
          <View style={styles.badgeGrid}>
            {badges.map(b => (
              <View key={b.id} style={[styles.badgeItem, !b.unlocked && styles.badgeLocked]}>
                <View style={[styles.badgeIconBg, b.unlocked && styles.badgeIconUnlocked]}>
                  <Icon name={b.unlocked ? b.icon : 'lock-outline'} size={22} color={b.unlocked ? '#FFFFFF' : dark.textMute} />
                </View>
                <Text style={[styles.badgeLabel, !b.unlocked && styles.badgeLabelLocked]}>{b.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Menu */}
        <GlassCard style={styles.menuCard}>
          {MENU.map((item, i) => (
            <TouchableOpacity key={item.id} style={[styles.menuRow, i < MENU.length - 1 && styles.menuBorder]} activeOpacity={0.7} onPress={() => handleMenu(item.id)}>
              <Ionicons name={item.icon} size={20} color={dark.neon} style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={dark.textMute} />
            </TouchableOpacity>
          ))}
        </GlassCard>

        <GlassCard style={styles.signOutRow} onPress={handleSignOut} tint="rgba(255,111,181,0.1)" border="rgba(255,111,181,0.35)">
          <Ionicons name="log-out-outline" size={20} color={dark.pink} style={styles.menuIcon} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </GlassCard>
      </ScrollView>

      {/* Subscription Modal */}
      <Modal visible={showSubs} transparent animationType="slide" onRequestClose={() => setShowSubs(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowSubs(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <MaterialCommunityIcons name="diamond-outline" size={44} color={dark.neon} style={styles.sheetIcon} />
            <Text style={styles.sheetTitle}>Premium Plans</Text>
            <Text style={styles.sheetSub}>Unlock the full power of RiAura RHIMS. Coming very soon.</Text>
            <View style={styles.featureList}>
              {COMING_SOON_FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Icon name={f.icon} size={20} color={dark.neon} />
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <View style={styles.soonBadge}><Text style={styles.soonText}>Soon</Text></View>
                </View>
              ))}
            </View>
            <NeonButton label="Notify Me When Available" onPress={() => setShowSubs(false)} />
            <TouchableOpacity onPress={() => setShowSubs(false)} style={{ marginTop: 12, alignSelf: 'center' }}>
              <Text style={{ color: dark.textSub, fontSize: 14 }}>Maybe later</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Rate Modal */}
      <Modal visible={showRate} transparent animationType="slide" onRequestClose={() => setShowRate(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowRate(false)}>
          <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            {rated ? (
              <>
                <MaterialCommunityIcons name="party-popper" size={44} color={dark.neon} style={styles.sheetIcon} />
                <Text style={styles.sheetTitle}>Thank You!</Text>
                <Text style={styles.sheetSub}>Your feedback helps us build a better experience for everyone.</Text>
                <NeonButton label="Close" onPress={() => setShowRate(false)} />
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="star-outline" size={44} color={dark.gold} style={styles.sheetIcon} />
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
                    {starPicked === 5 ? 'Excellent! You love it' :
                     starPicked >= 4 ? 'Great! Glad you enjoy it' :
                     starPicked >= 3 ? 'Thanks for the honest feedback' :
                     'Sorry to hear that. We\'ll keep improving'}
                  </Text>
                )}
                <NeonButton label="Submit Rating" onPress={starPicked ? () => setRated(true) : null} disabled={!starPicked} />
                <TouchableOpacity onPress={() => setShowRate(false)} style={{ marginTop: 12, alignSelf: 'center' }}>
                  <Text style={{ color: dark.textSub, fontSize: 14 }}>Not now</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

function StatBox({ icon, val, lbl }) {
  return (
    <GlassCard style={styles.statBox} radius={14}>
      <MaterialCommunityIcons name={icon} size={16} color={dark.neon} style={{ marginBottom: 4 }} />
      <Text style={styles.statVal}>{val}</Text>
      <Text style={styles.statLbl}>{lbl}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  hero:      { paddingHorizontal: 20, paddingBottom: 8 },
  avatarRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 18 },
  avatar:    { width: 64, height: 64, borderRadius: 20, borderWidth: 2, borderColor: dark.glassBorderStrong },
  userName:  { fontSize: 20, fontWeight: '900', color: '#1E1B33', marginBottom: 2 },
  userEmail: { fontSize: 12, color: dark.textSub, marginBottom: 10 },
  chipRow:   { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  levelChip: { backgroundColor: dark.glass, borderWidth: 1, borderColor: dark.glassBorder, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  levelChipText: { fontSize: 11, fontWeight: '700', color: '#7C3AED' },
  premiumChip:   { backgroundColor: dark.gold, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  premiumChipText: { fontSize: 11, fontWeight: '800', color: '#1A1A2E' },

  scoreBanner:      { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 14, marginBottom: 14 },
  scoreRingNum:     { fontSize: 22, fontWeight: '900', color: '#1E1B33' },
  scoreRingSub:     { fontSize: 9, color: dark.textSub, fontWeight: '800', letterSpacing: 1, marginTop: 1 },
  scoreBannerTitle: { fontSize: 16, fontWeight: '800', color: '#1E1B33' },
  scoreBannerSub:   { fontSize: 12, color: dark.textSub, marginTop: 3 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statBox:  { flex: 1, padding: 12, alignItems: 'center' },
  statVal:  { fontSize: 15, fontWeight: '900', color: '#1E1B33' },
  statLbl:  { fontSize: 10, color: dark.textSub, marginTop: 2 },

  section:      { marginHorizontal: 20, marginTop: 18, padding: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E1B33', marginBottom: 14 },
  badgeGrid:    { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 },
  badgeItem:    { width: '23%', alignItems: 'center', gap: 6 },
  badgeLocked:  { opacity: 0.4 },
  badgeIconBg:  { width: 48, height: 48, borderRadius: 14, backgroundColor: dark.glass, borderWidth: 1, borderColor: dark.glassBorder, alignItems: 'center', justifyContent: 'center' },
  badgeIconUnlocked: { backgroundColor: dark.gold, borderColor: dark.gold },
  badgeLabel:       { fontSize: 9, fontWeight: '700', color: '#1E1B33', textAlign: 'center' },
  badgeLabelLocked: { color: dark.textMute },

  menuCard:   { marginHorizontal: 20, marginTop: 14, padding: 0 },
  menuRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: '#F0EDF8' },
  menuIcon:   { marginRight: 14 },
  menuLabel:  { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E1B33' },

  signOutRow:  { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 14, paddingHorizontal: 18, paddingVertical: 16 },
  signOutText: { fontSize: 14, fontWeight: '700', color: dark.pink },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 40, borderTopWidth: 1, borderColor: dark.glassBorder },
  sheetHandle: { width: 40, height: 4, backgroundColor: dark.glassBorderStrong, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  sheetIcon: { alignSelf: 'center', marginBottom: 12 },
  sheetTitle: { fontSize: 22, fontWeight: '900', color: '#1E1B33', textAlign: 'center', marginBottom: 8 },
  sheetSub:   { fontSize: 14, color: dark.textSub, textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  featureList: { gap: 12, marginBottom: 24 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: dark.glass, borderWidth: 1, borderColor: dark.glassBorder, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  featureLabel:{ flex: 1, fontSize: 14, fontWeight: '600', color: '#1E1B33' },
  soonBadge:   { backgroundColor: 'rgba(255,217,74,0.18)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  soonText:    { fontSize: 11, fontWeight: '700', color: dark.gold },

  starsRow:   { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16 },
  star:       { fontSize: 42, color: dark.glassBorderStrong },
  starFilled: { color: dark.gold },
  rateHint:   { fontSize: 13, color: dark.textSub, textAlign: 'center', marginBottom: 20 },
});
