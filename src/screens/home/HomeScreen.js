import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../../utils/storage';
import { ui } from '../../theme/colors';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.42;

const COURSES = [
  { id: 1, title: 'Mastering Critical\nThinking', weeks: 6, badge: 'Popular',   color: '#3D5BFF', icon: '🧠' },
  { id: 2, title: 'Emotional\nIntelligence',       weeks: 4, badge: 'Top Rated', color: '#7C3AED', icon: '💜' },
  { id: 3, title: 'Strategic\nLeadership',         weeks: 8, badge: 'New',       color: '#059669', icon: '🎯' },
];

const DOMAIN_MAP = [
  { key: 'analytical', label: 'Analytical Thinking', color: '#3D5BFF', icon: '🧠', idx: 0 },
  { key: 'emotional',  label: 'Emotional IQ',        color: '#EC4899', icon: '❤️', idx: 1 },
  { key: 'creative',   label: 'Creative Thinking',   color: '#7C3AED', icon: '💡', idx: 2 },
  { key: 'strategic',  label: 'Strategic Insight',   color: '#059669', icon: '🎯', idx: 7 },
];

const DOMAIN_BADGES = ['Top performer', 'Developing', 'Growing fast', 'Strong'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return '☀️ Good morning';
  if (h < 17) return '🌤 Good afternoon';
  return '🌙 Good evening';
}

function levelInfo(score) {
  if (score >= 90) return { level: 9, title: 'Master Intellect',   xp: 3600, nextXp: 4000 };
  if (score >= 80) return { level: 7, title: 'Cognitive Explorer', xp: 2840, nextXp: 3500 };
  if (score >= 70) return { level: 5, title: 'Rising Thinker',     xp: 1920, nextXp: 2500 };
  if (score >= 60) return { level: 3, title: 'Emerging Mind',      xp: 1100, nextXp: 1600 };
  return                  { level: 1, title: 'Curious Learner',    xp: 400,  nextXp: 800  };
}

function percentileFor(score) {
  if (score >= 90) return 3;
  if (score >= 80) return 8;
  if (score >= 70) return 20;
  if (score >= 60) return 35;
  return 60;
}

export default function HomeScreen({ navigation }) {
  const [userName, setUserName]         = useState('User');
  const [score, setScore]               = useState(0);
  const [domainScores, setDomainScores] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [hasScores, setHasScores]       = useState(false);
  const [streak, setStreak]             = useState(0);

  useEffect(() => {
    (async () => {
      const reg    = await storage.getRegistration();
      const stored = await storage.getScores();
      const streakCount = await storage.touchStreak();
      setStreak(streakCount);
      if (reg?.fullName) setUserName(reg.fullName.split(' ')[0]);
      if (stored?.combined?.percent != null) {
        setScore(Math.round(stored.combined.percent));
        setHasScores(true);
      }
      if (stored?.domainPercents?.length === 8) {
        setDomainScores(stored.domainPercents);
      }
    })();
  }, []);

  const lv       = levelInfo(score);
  const xpToNext = lv.nextXp - lv.xp;
  const xpPct    = lv.xp / lv.nextXp;
  const initial  = userName[0]?.toUpperCase() || 'U';

  const domains = DOMAIN_MAP.map((d, i) => ({
    ...d,
    score: domainScores[d.idx] ?? 0,
    badge: DOMAIN_BADGES[i],
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetText}>{greeting()}</Text>
            <Text style={styles.welcomeText}>Welcome{'\n'}back, {userName}</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.streakPill}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakNum}>{streak}</Text>
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Chat')}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={ui.midText} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Ionicons name="notifications-outline" size={18} color={ui.midText} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarCircle}
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.75}
            >
              <Text style={styles.avatarText}>{initial}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Intelligence Score Card ── */}
        <LinearGradient
          colors={[ui.blueGradStart, ui.blueGradEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.scoreCard}
        >
          <Text style={styles.journeyLabel}>YOUR INTELLIGENCE JOURNEY</Text>
          <Text style={styles.scoreBig}>{hasScores ? score : '—'}</Text>
          <Text style={styles.scoreSubLabel}>{hasScores ? 'Intelligence Score' : 'Complete assessments to see your score'}</Text>

          {hasScores && (
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>Lv.{lv.level}</Text>
                <Text style={styles.statSub}>{lv.title}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={[styles.statVal, { color: '#90EE90' }]}>+5 pts</Text>
                <Text style={styles.statSub}>This week</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statVal}>Top {percentileFor(score)}%</Text>
                <Text style={styles.statSub}>Globally</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.journeyBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Phase2Intro')}
          >
            <Text style={styles.journeyBtnText}>{hasScores ? 'Continue Journey  →' : 'Start Assessment  →'}</Text>
          </TouchableOpacity>

          <Text style={styles.brainWm}>🧠</Text>
        </LinearGradient>

        {/* ── XP Bar ── */}
        {hasScores && (
          <View style={styles.xpContainer}>
            <View style={styles.xpLabelRow}>
              <Text style={styles.xpLeft}>⚡ {lv.xp.toLocaleString()} XP</Text>
              <Text style={styles.xpRight}>{xpToNext} XP to Level {lv.level + 1}</Text>
            </View>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${Math.min(xpPct * 100, 100)}%` }]} />
            </View>
          </View>
        )}

        {/* ── Your Intelligence ── */}
        {hasScores && (
          <>
            <SectionHeader title="Your Intelligence" onViewAll={() => navigation.navigate('DNA')} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hScrollContent}
            >
              {domains.map(d => (
                <View key={d.key} style={styles.domainCard}>
                  <View style={[styles.domainIconBg, { backgroundColor: d.color + '18' }]}>
                    <Text style={styles.domainIconEmoji}>{d.icon}</Text>
                  </View>
                  <Text style={styles.domainLabel}>{d.label}</Text>
                  <View style={styles.domainScoreRow}>
                    <Text style={[styles.domainScore, { color: d.color }]}>{d.score}</Text>
                    <Text style={styles.domainMax}>/100</Text>
                  </View>
                  <View style={styles.domainBarBg}>
                    <View style={[styles.domainBarFill, { width: `${d.score}%`, backgroundColor: d.color }]} />
                  </View>
                  <Text style={[styles.domainBadge, { color: d.color }]}>{d.badge}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Today's Insight ── */}
        <View style={styles.insightCard}>
          <View style={styles.insightHead}>
            <View style={styles.insightIconBg}>
              <Text style={styles.insightIconEmoji}>💡</Text>
            </View>
            <Text style={styles.insightLabel}>TODAY'S INSIGHT</Text>
          </View>
          <Text style={styles.insightTitle}>
            {hasScores && score >= 60
              ? 'Your analytical strength is your superpower'
              : 'Start your intelligence journey today'}
          </Text>
          <Text style={styles.insightDesc}>
            {hasScores && score >= 60
              ? 'People with high analytical scores excel at pattern recognition. Try the Logic Challenge today to sharpen this further.'
              : 'Complete the WHO Psychometric and Cognitive assessments to unlock your full intelligence profile and personalized insights.'}
          </Text>
          <TouchableOpacity
            style={styles.insightBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Assess')}
          >
            <Text style={styles.insightBtnText}>✨  {hasScores ? "Try Today's Challenge" : 'Go to Assessments'}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Continue Learning ── */}
        <SectionHeader title="Continue Learning" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScrollContent}
        >
          {COURSES.map(c => (
            <TouchableOpacity key={c.id} style={styles.courseCard} activeOpacity={0.85}>
              <View style={[styles.courseTop, { backgroundColor: c.color }]}>
                <Text style={styles.courseIconEmoji}>{c.icon}</Text>
                <View style={[styles.courseBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Text style={styles.courseBadgeText}>{c.badge}</Text>
                </View>
              </View>
              <View style={styles.courseBottom}>
                <Text style={styles.courseTitle}>{c.title}</Text>
                <Text style={styles.courseWeeks}>{c.weeks} weeks</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Brain Challenge ── */}
        <View style={styles.challengeCard}>
          <View style={styles.challengeRow}>
            <View style={styles.challengeIconBg}>
              <Text style={styles.challengeIconEmoji}>⚡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.challengeLabel}>BRAIN CHALLENGE</Text>
              <Text style={styles.challengeTitle}>Cognitive Tasks</Text>
              <Text style={styles.challengeSub}>8 tasks · Measure your cognitive performance</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.challengeBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Phase3Intro')}
          >
            <Text style={styles.challengeBtnText}>{hasScores ? 'Retake Tasks' : 'Start Tasks'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onViewAll }) {
  return (
    <View style={[styles.sectionHeader, styles.sectionHeaderRow]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: ui.offWhite },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greetText:   { fontSize: 13, color: ui.midText, marginBottom: 2 },
  welcomeText: { fontSize: 22, fontWeight: '800', color: ui.darkText, lineHeight: 28 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  streakPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: ui.streakBg, borderWidth: 1, borderColor: ui.streakBorder,
    borderRadius: 17, paddingHorizontal: 10, height: 34,
  },
  streakEmoji: { fontSize: 13 },
  streakNum:   { fontSize: 13, fontWeight: '800', color: ui.darkText },
  iconBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: ui.inputBg,
    alignItems: 'center', justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute', top: 7, right: 7,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1, borderColor: ui.white,
  },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: ui.primaryBlue,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: ui.white },

  scoreCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 22,
    overflow: 'hidden',
    shadowColor: ui.blueGradStart,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  journeyLabel:  { fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginBottom: 8 },
  scoreBig:      { fontSize: 64, fontWeight: '900', color: ui.white, lineHeight: 68 },
  scoreSubLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 16 },
  statsRow:      { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  statCol:       { flex: 1, alignItems: 'center' },
  statVal:       { fontSize: 14, fontWeight: '800', color: ui.white },
  statSub:       { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2, textAlign: 'center' },
  statDivider:   { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  journeyBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  journeyBtnText: { fontSize: 14, fontWeight: '700', color: ui.white },
  brainWm: { position: 'absolute', right: 14, bottom: 12, fontSize: 72, opacity: 0.12 },

  xpContainer: { marginHorizontal: 20, marginTop: 16, marginBottom: 4 },
  xpLabelRow:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLeft:      { fontSize: 13, fontWeight: '700', color: ui.darkText },
  xpRight:     { fontSize: 12, color: ui.midText },
  xpBarBg:     { height: 7, backgroundColor: ui.borderGray, borderRadius: 4, overflow: 'hidden' },
  xpBarFill:   { height: '100%', backgroundColor: ui.primaryBlue, borderRadius: 4 },

  sectionHeader: { marginHorizontal: 20, marginTop: 24, marginBottom: 14 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: ui.darkText },
  viewAllText:   { fontSize: 13, fontWeight: '700', color: ui.primaryBlue },
  hScrollContent:{ paddingLeft: 20, paddingRight: 8, gap: 12 },

  domainCard: {
    width: CARD_W, backgroundColor: ui.white, borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3, marginBottom: 4,
  },
  domainIconBg:    { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  domainIconEmoji: { fontSize: 18 },
  domainLabel:     { fontSize: 12, fontWeight: '600', color: ui.darkText, marginBottom: 8, lineHeight: 16 },
  domainScoreRow:  { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  domainScore:     { fontSize: 26, fontWeight: '900' },
  domainMax:       { fontSize: 12, color: ui.lightText, marginLeft: 2 },
  domainBarBg:     { height: 4, backgroundColor: ui.borderGray, borderRadius: 2, overflow: 'hidden', marginBottom: 8 },
  domainBarFill:   { height: '100%', borderRadius: 2 },
  domainBadge:     { fontSize: 11, fontWeight: '600' },

  insightCard: {
    marginHorizontal: 20, marginTop: 24,
    backgroundColor: ui.amberBg, borderRadius: 18, padding: 20, borderWidth: 1, borderColor: '#FDE68A',
  },
  insightHead:      { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  insightIconBg:    { width: 28, height: 28, borderRadius: 8, backgroundColor: ui.amber, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  insightIconEmoji: { fontSize: 14 },
  insightLabel:     { fontSize: 10, letterSpacing: 1.5, fontWeight: '800', color: '#92400E' },
  insightTitle:     { fontSize: 16, fontWeight: '800', color: ui.darkText, marginBottom: 8, lineHeight: 22 },
  insightDesc:      { fontSize: 13, color: '#78716C', lineHeight: 18, marginBottom: 16 },
  insightBtn:       { backgroundColor: ui.amber, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start' },
  insightBtnText:   { fontSize: 13, fontWeight: '700', color: ui.white },

  courseCard: {
    width: CARD_W, backgroundColor: ui.white, borderRadius: 18, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, marginBottom: 4,
  },
  courseTop:        { height: 120, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  courseIconEmoji:  { fontSize: 40 },
  courseBadge:      { position: 'absolute', top: 10, left: 10, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  courseBadgeText:  { fontSize: 10, fontWeight: '700', color: ui.white },
  courseBottom:     { padding: 12 },
  courseTitle:      { fontSize: 13, fontWeight: '700', color: ui.darkText, lineHeight: 18, marginBottom: 4 },
  courseWeeks:      { fontSize: 12, color: ui.midText },

  challengeCard: {
    marginHorizontal: 20, marginTop: 24, backgroundColor: ui.challengeBg, borderRadius: 18, padding: 18,
  },
  challengeRow:       { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  challengeIconBg:    { width: 44, height: 44, borderRadius: 14, backgroundColor: ui.primaryBlue, alignItems: 'center', justifyContent: 'center' },
  challengeIconEmoji: { fontSize: 22 },
  challengeLabel:     { fontSize: 9, letterSpacing: 1.5, fontWeight: '800', color: ui.primaryBlue, marginBottom: 2 },
  challengeTitle:     { fontSize: 15, fontWeight: '800', color: ui.darkText },
  challengeSub:       { fontSize: 12, color: ui.midText, marginTop: 2 },
  challengeBtn: {
    backgroundColor: ui.primaryBlue, borderRadius: 24, paddingVertical: 14, alignItems: 'center',
    shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  challengeBtnText: { fontSize: 15, fontWeight: '700', color: ui.white },
});
