import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, Dimensions, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PressableScale, FadeInUp, Pulse, CountUp, ProgressBar } from '../../components/anim';
import { NeuronDrift } from '../../components/GlassKit';
import Avatar from '../../components/Avatar';
import BrainIcon from '../../components/BrainIcon';
import Brain3D from '../../components/Brain3D';
import { storage } from '../../utils/storage';
import { neural } from '../../theme/colors';
import { levelFromXp, rankFromScore, neuralEnergy, neuralMap, XP_REWARDS } from '../../utils/xp';
import { BRAIN_FACTS } from '../../data/brainFacts';
import { MINDFULNESS_DOMAINS } from '../assess/MindfulnessAssessScreen';

const { width } = Dimensions.get('window');

const PURPLE = neural.primary;
const INK    = '#1E1B33';
const GRAY   = '#8A8797';

const QUICK_ACTIONS = [
  { key: 'assess', title: 'Assessments', sub: 'Evaluate your cognitive abilities', bg: '#EFEBFB', color: '#8B5CF6', icon: 'chart-pie',      nav: 'Assess' },
  { key: 'score',  title: 'Your Score',  sub: 'Track your intelligence score',     bg: '#E9F1FD', color: '#3B82F6', icon: 'chart-line',     nav: 'Growth' },
  { key: 'map',    title: 'Mind Map',    sub: 'Explore your cognitive strengths',  bg: '#E8F7F0', color: '#10B981', brain: true,            nav: 'DNA' },
  { key: 'goals',  title: 'Goals',       sub: 'Set goals and track progress',      bg: '#FDF0E6', color: '#F97316', icon: 'bullseye-arrow', nav: 'Goals' },
];

const COURSES = [
  { id: 1, title: 'Understand\nYour Brain',   badge: 'Popular', bg: '#EFEBFB', kind: 'brain' },
  { id: 2, title: 'Memory\nMastery',                            bg: '#FBF3E3', kind: 'icon', icon: 'cloud',  tint: '#E8C983' },
  { id: 3, title: 'Focus &\nProductivity',                      bg: '#E8F7F0', kind: 'icon', icon: 'target', tint: '#10B981' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

// Split a fact into a bold headline + supporting line.
function splitFact(fact) {
  const dash = fact.indexOf(' — ');
  if (dash > 0) return [fact.slice(0, dash) + '.', fact.slice(dash + 3)];
  const dot = fact.indexOf('. ');
  if (dot > 0 && dot < fact.length - 2) return [fact.slice(0, dot + 1), fact.slice(dot + 2)];
  return [fact, null];
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [userName, setUserName]   = useState('User');
  const [score, setScore]         = useState(0);
  const [hasScores, setHasScores] = useState(false);
  const [streak, setStreak]       = useState(0);
  const [photo, setPhoto]         = useState(null);
  const [whoMap, setWhoMap]       = useState({});
  const [riaMap, setRiaMap]       = useState({});
  const [xpInfo, setXpInfo]       = useState(levelFromXp(0));
  const [fact]                    = useState(() => BRAIN_FACTS[Math.floor(Math.random() * BRAIN_FACTS.length)]);

  useFocusEffect(useCallback(() => {
    (async () => {
      const reg    = await storage.getRegistration();
      const stored = await storage.getScores();
      setStreak(await storage.touchStreak());
      setPhoto(await storage.getProfilePhoto());
      setWhoMap(await storage.getMindfulnessDomainScores());
      setRiaMap(await storage.getRiauraDomainScores());
      setXpInfo(levelFromXp(await storage.getXp()));
      if (reg?.fullName) setUserName(reg.fullName.split(' ')[0]);
      if (stored?.combined?.percent != null) {
        setScore(Math.round(stored.combined.percent));
        setHasScores(true);
      }
    })();
  }, []));

  const initial = userName[0]?.toUpperCase() || 'U';
  const [factTitle, factBody] = splitFact(fact.fact);

  const map = neuralMap(whoMap, riaMap);
  const domainScores  = Object.values(whoMap).map(e => e.score);
  const brainActivity = hasScores
    ? score
    : domainScores.length
      ? Math.round(domainScores.reduce((a, b) => a + b, 0) / domainScores.length)
      : 72;
  const energy = neuralEnergy({ streak, domainsDone: map.done });
  const rank   = rankFromScore(hasScores ? score : brainActivity);

  // Today's mission: next unmapped pathway (WHO first, then RiAura track).
  const nextWho = MINDFULNESS_DOMAINS.find(d => !whoMap[d.num]);
  const nextRia = MINDFULNESS_DOMAINS.find(d => !riaMap[d.num]);
  const mission = nextWho
    ? { domain: nextWho, route: 'MindfulnessAssess' }
    : nextRia
      ? { domain: nextRia, route: 'ActivityAssess' }
      : null;

  const heroStats = [
    { emoji: '🧠', val: brainActivity, suffix: '%',                 label: 'Brain Activity' },
    { emoji: '⚡', val: energy,        suffix: '%',                 label: 'Neural Energy' },
    { emoji: '🔥', val: streak,        suffix: streak === 1 ? ' Day' : ' Days', label: 'Streak' },
    { emoji: '🌍', val: rank,          text: true,                  label: 'Intelligence Rank' },
  ];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#241255" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

        {/* ══ Neural hero panel ══ */}
        <View style={[styles.hero, { paddingTop: insets.top + 14 }]}>
          <LinearGradient
            colors={neural.heroGrad}
            start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <NeuronDrift dark count={14} height={520} />

          {/* header row */}
          <FadeInUp distance={10}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetText}>{greeting()}</Text>
                <Text style={styles.welcomeSub}>Welcome Back</Text>
                <Text style={styles.welcomeName}>{userName}</Text>
              </View>
              <View style={styles.headerRight}>
                <PressableScale style={styles.heroIconBtn} onPress={() => navigation.navigate('Notifications')}>
                  <Ionicons name="notifications-outline" size={19} color="#E9E2FF" />
                  <Pulse to={1.35} duration={1000} style={styles.notifDot} />
                </PressableScale>
                <PressableScale onPress={() => navigation.navigate('Profile')}>
                  <Avatar photo={photo} initial={initial} size={44} style={styles.avatarCircle} />
                </PressableScale>
              </View>
            </View>
          </FadeInUp>

          {/* rotating brain */}
          <FadeInUp delay={60}>
            <View style={styles.brainStage}>
              <Brain3D size={216} />
            </View>
          </FadeInUp>

          {/* stat grid */}
          <View style={styles.statGrid}>
            {heroStats.map((s, i) => (
              <FadeInUp key={s.label} delay={100 + i * 70} style={styles.statTileWrap}>
                <View style={styles.statTile}>
                  <Text style={styles.statEmoji}>{s.emoji}</Text>
                  {s.text
                    ? <Text style={styles.statVal}>{s.val}</Text>
                    : <CountUp value={s.val} suffix={s.suffix} duration={1200} style={styles.statVal} />}
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </FadeInUp>
            ))}
          </View>

          {/* neural map scan */}
          <FadeInUp delay={380}>
            <View style={styles.scanCard}>
              <View style={styles.scanTop}>
                <View style={styles.scanTitleRow}>
                  <Pulse to={1.2} duration={1100}>
                    <View style={styles.scanDot} />
                  </Pulse>
                  <Text style={styles.scanTitle}>NEURAL MAP</Text>
                </View>
                <CountUp value={map.percent} suffix="% mapped" duration={1400} style={styles.scanPct} />
              </View>
              <ProgressBar
                progress={map.percent / 100}
                height={9}
                trackColor="rgba(255,255,255,0.12)"
                fillColor={neural.electric}
                duration={1400}
                minPct={0.02}
              />
              <Text style={styles.scanSub}>{map.done} of {map.total} neural pathways unlocked</Text>
            </View>
          </FadeInUp>
        </View>

        {/* ══ Today's Mission ══ */}
        <FadeInUp delay={120}>
          <View style={styles.missionCard}>
            <View style={styles.missionHead}>
              <Text style={styles.missionKicker}>TODAY'S MISSION</Text>
              <View style={styles.xpPill}>
                <MaterialCommunityIcons name="lightning-bolt" size={13} color="#fff" />
                <Text style={styles.xpPillText}>+{XP_REWARDS.DOMAIN_COMPLETE} XP</Text>
              </View>
            </View>
            {mission ? (
              <>
                <Text style={styles.missionTitle}>Complete {mission.domain.label}</Text>
                <Text style={styles.missionSub}>
                  Reward · Unlock the {mission.domain.label.split(' ')[0]} pathway on your neural map
                </Text>
                <PressableScale
                  style={styles.missionBtn}
                  onPress={() => navigation.navigate(mission.route, { domainNum: mission.domain.num })}
                >
                  <LinearGradient
                    colors={[neural.primary, '#5433C9']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.missionBtnGrad}
                  >
                    <Text style={styles.missionBtnText}>Continue Training</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </LinearGradient>
                </PressableScale>
              </>
            ) : (
              <>
                <Text style={styles.missionTitle}>All pathways mapped 🎉</Text>
                <Text style={styles.missionSub}>Your full neural map is unlocked. Review your passport or keep training.</Text>
                <PressableScale style={styles.missionBtn} onPress={() => navigation.navigate('Passport')}>
                  <LinearGradient
                    colors={[neural.primary, '#5433C9']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={styles.missionBtnGrad}
                  >
                    <Text style={styles.missionBtnText}>View Passport</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </LinearGradient>
                </PressableScale>
              </>
            )}
            {/* level strip */}
            <View style={styles.levelStrip}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>Lv.{xpInfo.level}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.levelRow}>
                  <Text style={styles.levelTitle}>{xpInfo.title}</Text>
                  <Text style={styles.levelXp}>{xpInfo.intoLevel}/{xpInfo.needed} XP</Text>
                </View>
                <ProgressBar
                  progress={xpInfo.progress}
                  height={6}
                  trackColor="#ECE8F5"
                  fillColor={neural.pink}
                  minPct={0.02}
                />
              </View>
            </View>
          </View>
        </FadeInUp>

        {/* ══ Today's Brain Signal ══ */}
        <FadeInUp delay={160}>
          <View style={styles.signalCard}>
            <LinearGradient
              colors={['rgba(108,77,255,0.10)', 'rgba(76,201,240,0.08)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.signalHead}>
              <Pulse to={1.12} duration={1300}>
                <LinearGradient
                  colors={[neural.primary, neural.electric]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.signalIconBg}
                >
                  <BrainIcon size={20} color="#fff" strokeWidth={2} />
                </LinearGradient>
              </Pulse>
              <Text style={styles.signalKicker}>TODAY'S BRAIN SIGNAL</Text>
            </View>
            <Text style={styles.signalTitle}>{factTitle}</Text>
            {factBody ? <Text style={styles.signalBody}>{factBody}</Text> : null}
            <PressableScale style={styles.signalBtn} onPress={() => navigation.navigate('Assess')}>
              <Text style={styles.signalBtnText}>Train Now</Text>
              <Ionicons name="arrow-forward" size={15} color={PURPLE} />
            </PressableScale>
          </View>
        </FadeInUp>

        {/* ══ Quick actions ══ */}
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((q, i) => (
            <FadeInUp key={q.key} delay={i * 60} style={{ flex: 1 }}>
              <Pressable
                style={[styles.quickCard, { backgroundColor: q.bg }]}
                onPress={() => navigation.navigate(q.nav)}
              >
                <View style={[styles.quickIconBg, { backgroundColor: q.color }]}>
                  {q.brain
                    ? <BrainIcon size={20} color="#fff" strokeWidth={1.8} />
                    : <MaterialCommunityIcons name={q.icon} size={20} color="#fff" />}
                </View>
                <Text style={styles.quickTitle}>{q.title}</Text>
                <Text style={styles.quickSub}>{q.sub}</Text>
                <Ionicons name="arrow-forward" size={14} color={q.color} style={styles.quickArrow} />
              </Pressable>
            </FadeInUp>
          ))}
        </View>

        {/* ══ Human Intelligence Passport ══ */}
        <FadeInUp delay={120}>
          <Pressable style={styles.passportCard} onPress={() => navigation.navigate('Passport')}>
            <MaterialCommunityIcons
              name="earth" size={96} color="#F0EDF8"
              style={styles.passportWatermark}
            />
            <View style={styles.passportIconBg}>
              <MaterialCommunityIcons name="card-account-details-outline" size={24} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.passportTitle}>Human Intelligence Passport</Text>
              <Text style={styles.passportSub}>Your complete cognitive profile, personality, and career roadmap.</Text>
            </View>
            <View style={styles.passportBtn}>
              <Ionicons name="arrow-forward" size={18} color={PURPLE} />
            </View>
          </Pressable>
        </FadeInUp>

        {/* ══ Continue Learning ══ */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <PressableScale onPress={() => navigation.navigate('Growth')}>
            <Text style={styles.seeAllText}>See all</Text>
          </PressableScale>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
          {COURSES.map((c, ci) => (
            <FadeInUp key={c.id} delay={ci * 80}>
              <Pressable
                style={[styles.courseCard, { backgroundColor: c.bg }]}
                onPress={() => navigation.navigate('Growth')}
              >
                {c.kind === 'brain' ? (
                  <View style={styles.courseArt}><Brain3D size={104} animated={false} /></View>
                ) : (
                  <MaterialCommunityIcons name={c.icon} size={54} color={c.tint} style={styles.courseIcon} />
                )}
                {c.badge && (
                  <View style={styles.courseBadge}>
                    <Text style={styles.courseBadgeText}>{c.badge}</Text>
                  </View>
                )}
                <Text style={styles.courseTitle}>{c.title}</Text>
              </Pressable>
            </FadeInUp>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const cardShadow = {
  shadowColor: '#7C6BAE',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.08,
  shadowRadius: 14,
  elevation: 3,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: neural.bg },

  // ── hero ──
  hero: {
    paddingHorizontal: 20, paddingBottom: 24,
    borderBottomLeftRadius: 34, borderBottomRightRadius: 34,
    overflow: 'hidden',
    marginBottom: 18,
  },
  headerRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greetText:  { fontSize: 13, color: neural.heroSub, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  welcomeSub: { fontSize: 15, color: '#CDC4EE', marginTop: 6, fontWeight: '600' },
  welcomeName:{ fontSize: 32, fontWeight: '900', color: neural.heroText, letterSpacing: 0.3, marginTop: 1 },
  headerRight:{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  heroIconBtn:{
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: neural.heroGlass, borderWidth: 1, borderColor: neural.heroBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot:   { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: neural.cyan },
  avatarCircle:{ width: 44, height: 44, borderRadius: 22, backgroundColor: PURPLE, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)' },

  brainStage: { alignItems: 'center', marginTop: 4, marginBottom: 2 },

  statGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 8 },
  statTileWrap:{ width: (width - 50) / 2 },
  statTile: {
    backgroundColor: neural.heroGlass,
    borderWidth: 1, borderColor: neural.heroBorder,
    borderRadius: 18, padding: 14,
  },
  statEmoji: { fontSize: 18, marginBottom: 6 },
  statVal:   { fontSize: 22, fontWeight: '900', color: neural.heroText },
  statLabel: { fontSize: 11.5, color: neural.heroSub, fontWeight: '600', marginTop: 3 },

  scanCard: {
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderWidth: 1, borderColor: neural.heroBorder,
    borderRadius: 18, padding: 14,
  },
  scanTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  scanTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scanDot:      { width: 8, height: 8, borderRadius: 4, backgroundColor: neural.cyan },
  scanTitle:    { fontSize: 11, fontWeight: '800', letterSpacing: 2, color: '#9FE8FF' },
  scanPct:      { fontSize: 13, fontWeight: '800', color: neural.heroText },
  scanSub:      { fontSize: 11, color: neural.heroSub, marginTop: 8 },

  // ── mission ──
  missionCard: {
    marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: neural.cardBorder, ...cardShadow,
  },
  missionHead:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  missionKicker:{ fontSize: 11, fontWeight: '800', letterSpacing: 2, color: PURPLE },
  xpPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: neural.energy, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4,
  },
  xpPillText:  { fontSize: 11, fontWeight: '900', color: '#fff' },
  missionTitle:{ fontSize: 21, fontWeight: '900', color: INK, lineHeight: 27 },
  missionSub:  { fontSize: 13, color: GRAY, marginTop: 6, lineHeight: 19 },
  missionBtn:  { marginTop: 16, borderRadius: 16, overflow: 'hidden', shadowColor: PURPLE, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 6 },
  missionBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  missionBtnText: { color: '#fff', fontWeight: '900', fontSize: 15.5 },

  levelStrip: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0EDF8' },
  levelBadge: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F3EFFC', alignItems: 'center', justifyContent: 'center' },
  levelBadgeText: { fontSize: 12, fontWeight: '900', color: PURPLE },
  levelRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  levelTitle: { fontSize: 13, fontWeight: '800', color: INK },
  levelXp:    { fontSize: 11.5, fontWeight: '700', color: GRAY },

  // ── brain signal ──
  signalCard: {
    marginHorizontal: 20, marginTop: 16, borderRadius: 24, padding: 20,
    backgroundColor: '#fff', overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(108,77,255,0.12)', ...cardShadow,
  },
  signalHead:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  signalIconBg: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  signalKicker: { fontSize: 11, letterSpacing: 2, fontWeight: '800', color: PURPLE },
  signalTitle:  { fontSize: 20, fontWeight: '900', color: INK, lineHeight: 26, marginBottom: 6 },
  signalBody:   { fontSize: 13.5, color: GRAY, lineHeight: 20, marginBottom: 14 },
  signalBtn:    { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start' },
  signalBtnText:{ fontSize: 15, fontWeight: '800', color: PURPLE },

  // ── quick actions ──
  quickRow:  { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginTop: 18 },
  quickCard: { flex: 1, borderRadius: 18, padding: 11, minHeight: 150 },
  quickIconBg: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  quickTitle:{ fontSize: 13, fontWeight: '800', color: INK, marginBottom: 4 },
  quickSub:  { fontSize: 10.5, color: GRAY, lineHeight: 14 },
  quickArrow:{ marginTop: 'auto', alignSelf: 'flex-end', paddingTop: 8 },

  // ── passport ──
  passportCard: { marginHorizontal: 20, marginTop: 18, backgroundColor: '#fff', borderRadius: 22, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden', ...cardShadow },
  passportWatermark: { position: 'absolute', right: 64, top: 6 },
  passportIconBg:{ width: 52, height: 52, borderRadius: 16, backgroundColor: PURPLE, alignItems: 'center', justifyContent: 'center' },
  passportTitle: { fontSize: 15.5, fontWeight: '800', color: INK },
  passportSub:   { fontSize: 12, color: GRAY, marginTop: 3, lineHeight: 17 },
  passportBtn:   { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFEBFB', alignItems: 'center', justifyContent: 'center' },

  // ── learning ──
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 28, marginBottom: 14 },
  sectionTitle:  { fontSize: 20, fontWeight: '900', color: INK },
  seeAllText:    { fontSize: 14.5, fontWeight: '700', color: PURPLE },
  hScroll:       { paddingLeft: 20, paddingRight: 8, gap: 12 },

  courseCard: { width: width * 0.42, height: 152, borderRadius: 20, overflow: 'hidden', padding: 14 },
  courseArt:  { position: 'absolute', right: -18, bottom: -16 },
  courseIcon: { position: 'absolute', right: 12, bottom: 14, opacity: 0.9 },
  courseBadge:{ alignSelf: 'flex-start', backgroundColor: PURPLE, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 4, marginBottom: 8 },
  courseBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },
  courseTitle: { fontSize: 15.5, fontWeight: '800', color: INK, lineHeight: 21 },
});
