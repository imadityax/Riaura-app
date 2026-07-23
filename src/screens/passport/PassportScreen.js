import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PressableScale, FadeInUp, CountUp, PopIn, ProgressBar } from '../../components/anim';
import { ui, dark } from '../../theme/colors';
import Icon from '../../components/Icon';
import { RingStat } from '../../components/VisualKit';
import { storage } from '../../utils/storage';
import { MINDFULNESS_DOMAINS } from '../assess/MindfulnessAssessScreen';
import { rf, scale } from '../../utils/responsive';

// ── Interpretation helpers ──────────────────────────────────────
// All copy is deliberately hedged: these are assessment-based
// interpretations, never claims of measured brain function.

function styleFor(score, high, mid, low) {
  if (score == null) return null;
  return score >= 70 ? high : score >= 45 ? mid : low;
}

const CAREER_MAP = {
  1: ['Research Analyst', 'Quality Specialist', 'Pilot / Operator roles'],
  2: ['Educator', 'Historian', 'Knowledge Manager'],
  3: ['Trader', 'Emergency Response', 'Air-Traffic Control'],
  4: ['Data Scientist', 'Engineer', 'Strategy Consultant'],
  5: ['Product Manager', 'Executive Leadership', 'Investment Analyst'],
  6: ['Counsellor', 'HR Leader', 'Healthcare Professional'],
  7: ['Designer', 'Entrepreneur', 'Creative Director'],
  8: ['Coach', 'Researcher', 'Learning & Development Lead'],
};

function buildInsights(domainMap) {
  const domains = Object.entries(domainMap).map(([num, e]) => ({
    num: Number(num),
    label: MINDFULNESS_DOMAINS.find(d => d.num === Number(num))?.label || `Domain ${num}`,
    icon:  MINDFULNESS_DOMAINS.find(d => d.num === Number(num))?.icon || 'brain',
    color: MINDFULNESS_DOMAINS.find(d => d.num === Number(num))?.color || dark.neon,
    score: e.score,
  })).sort((a, b) => b.score - a.score);

  const get = n => domainMap[n]?.score ?? null;

  const mindStyles = [
    {
      icon: 'scale-balance', title: 'Decision Style',
      value: styleFor(get(5), 'Deliberate Strategist', 'Balanced Decider', 'Developing Decider'),
      note:  styleFor(get(5),
        'Your responses suggest you weigh options carefully before committing.',
        'Your responses suggest a mix of instinct and analysis in choices.',
        'Your responses suggest decisions may feel rushed — structure can help.'),
    },
    {
      icon: 'school-outline', title: 'Learning Style',
      value: styleFor(get(2), 'Deep Consolidator', 'Steady Learner', 'Emerging Learner'),
      note:  styleFor(get(2),
        'You appear to retain and connect new information effectively.',
        'You appear to learn best with spaced review and repetition.',
        'Short, frequent study sessions may suit you better than long ones.'),
    },
    {
      icon: 'heart-outline', title: 'Emotional Profile',
      value: styleFor(get(6), 'Emotionally Attuned', 'Balanced Regulator', 'Growing Awareness'),
      note:  styleFor(get(6),
        'Your responses suggest strong awareness of emotions in yourself and others.',
        'Your responses suggest solid emotional footing with room to deepen empathy.',
        'Naming emotions as they happen is a powerful next step for you.'),
    },
    {
      icon: 'creation-outline', title: 'Creativity',
      value: styleFor(get(7), 'Original Thinker', 'Practical Creative', 'Latent Creative'),
      note:  styleFor(get(7),
        'You appear comfortable generating and developing novel ideas.',
        'You blend creative and conventional approaches to problems.',
        'Daily divergent-thinking drills can unlock more original ideas.'),
    },
  ].filter(s => s.value);

  const careers = [];
  const seen = new Set();
  for (const d of domains.slice(0, 3)) {
    for (const c of (CAREER_MAP[d.num] || []).slice(0, 2)) {
      if (!seen.has(c) && careers.length < 6) { seen.add(c); careers.push(c); }
    }
  }

  return { domains, mindStyles, careers };
}

function buildNarrative(name, domains, overall) {
  if (!domains.length) return null;
  const top = domains[0];
  const low = domains[domains.length - 1];
  const parts = [
    `${name}, your responses across ${domains.length} of 8 intelligence domains sketch a distinctive cognitive signature.`,
    `${top.label.replace(' Intelligence', '')} stands out as your strongest area (${top.score}/100), suggesting you may thrive in situations that lean on it.`,
  ];
  if (top.num !== low.num) {
    parts.push(`${low.label.replace(' Intelligence', '')} (${low.score}/100) shows the most room to grow — small, consistent practice moves this fastest.`);
  }
  if (overall != null) parts.push(`Your overall mindfulness index currently sits at ${overall}/100.`);
  parts.push('Treat these as interpretations of your responses — a starting map, not a verdict. Your broader experience completes the picture.');
  return parts.join(' ');
}

// ── Sections config for the staged reveal ───────────────────────
const STAGES = [
  { key: 'cognitive', label: 'Cognitive Profile',   icon: 'brain' },
  { key: 'styles',    label: 'Mind Styles',          icon: 'head-cog-outline' },
  { key: 'careers',   label: 'Career Suitability',   icon: 'briefcase-outline' },
  { key: 'narrative', label: 'AI Narrative',         icon: 'robot-outline' },
  { key: 'roadmap',   label: 'Growth Roadmap',       icon: 'map-marker-path' },
];

export default function PassportScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [name, setName]       = useState('Explorer');
  const [overall, setOverall] = useState(null);
  const [data, setData]       = useState({ domains: [], mindStyles: [], careers: [] });
  const [stage, setStage]     = useState(0);
  const scrollRef = useRef(null);

  useFocusEffect(useCallback(() => {
    (async () => {
      const reg = await storage.getRegistration();
      if (reg?.fullName) setName(reg.fullName.split(' ')[0]);
      const map = await storage.getMindfulnessDomainScores();
      setOverall(await storage.getMindfulnessScore());
      setData(buildInsights(map));
    })();
  }, []));

  const { domains, mindStyles, careers } = data;
  const narrative = buildNarrative(name, domains, overall);
  const hasData   = domains.length > 0;
  const heroScore = overall ?? (domains.length
    ? Math.round(domains.reduce((a, d) => a + d.score, 0) / domains.length)
    : 0);

  function unlockNext() {
    setStage(s => Math.min(s + 1, STAGES.length));
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 350);
  }

  return (
    <SafeAreaView edges={[]} style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0B1026" />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* ── Passport hero ── */}
        <LinearGradient colors={['#4B3A9B', '#3A2C74', '#33265F']} style={[s.hero, { paddingTop: insets.top + 12 }]}>
          <View style={s.heroTopRow}>
            {navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()} style={s.heroBack}>
                <Ionicons name="arrow-back" size={20} color={dark.text} />
              </TouchableOpacity>
            ) : <View style={s.heroBack} />}
            <View style={s.heroBadge}>
              <MaterialCommunityIcons name="shield-check-outline" size={12} color="#8B9EFF" />
              <Text style={s.heroBadgeText}>RHIMS VERIFIED</Text>
            </View>
          </View>

          <Text style={s.heroEyebrow}>HUMAN INTELLIGENCE PASSPORT</Text>
          <Text style={s.heroName}>{name}</Text>

          <PopIn delay={250} style={s.ringWrap}>
            <RingStat
              percent={hasData ? heroScore : 0}
              size={132} stroke={11}
              color="#8B9EFF" color2="#4F7BFF"
              trackColor="rgba(255,255,255,0.14)"
            >
              {hasData ? (
                <>
                  <Text style={s.ringScore}>{heroScore}</Text>
                  <Text style={s.ringLabel}>INDEX</Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons name="lock-outline" size={30} color="rgba(255,255,255,0.5)" />
                  <Text style={s.ringLabel}>LOCKED</Text>
                </>
              )}
            </RingStat>
          </PopIn>

          <Text style={s.heroMeta}>
            {hasData
              ? `${domains.length}/8 domains mapped · updated live from your assessments`
              : 'Complete assessments in the Assess tab to activate your passport'}
          </Text>
        </LinearGradient>

        {!hasData ? (
          <FadeInUp delay={200} style={s.emptyCard}>
            <MaterialCommunityIcons name="compass-outline" size={34} color={dark.neon} />
            <Text style={s.emptyTitle}>Your passport awaits its first stamp</Text>
            <Text style={s.emptySub}>Each domain you complete unlocks a page of your interactive intelligence profile.</Text>
            <PressableScale style={s.emptyBtn} scaleTo={0.95} onPress={() => navigation.navigate('Assess')}>
              <Text style={s.emptyBtnText}>Start Assessing</Text>
            </PressableScale>
          </FadeInUp>
        ) : (
          <View style={s.content}>

            {/* Stage 1 · Cognitive profile */}
            {stage >= 1 && (
              <FadeInUp>
                <SectionTitle icon="brain" title="Cognitive Profile" />
                <View style={s.card}>
                  {domains.map(d => (
                    <View key={d.num} style={s.domainRow}>
                      <View style={[s.domainIcon, { backgroundColor: d.color + '15' }]}>
                        <Icon name={d.icon} size={16} color={d.color} />
                      </View>
                      <Text style={s.domainLabel}>{d.label.replace(' Intelligence', '')}</Text>
                      <View style={{ flex: 1 }}>
                        <ProgressBar progress={d.score / 100} height={6} fillColor={d.color} trackColor="rgba(0,0,0,0.06)" duration={800} />
                      </View>
                      <Text style={[s.domainScore, { color: d.color }]}>{d.score}</Text>
                    </View>
                  ))}
                  <View style={s.chipRow}>
                    <View style={[s.chip, { backgroundColor: 'rgba(52,211,153,0.18)' }]}>
                      <Text style={[s.chipText, { color: dark.green }]}>Strongest · {domains[0].label.replace(' Intelligence', '')}</Text>
                    </View>
                    {domains.length > 1 && (
                      <View style={[s.chip, { backgroundColor: 'rgba(251,191,36,0.18)' }]}>
                        <Text style={[s.chipText, { color: dark.gold }]}>Focus · {domains[domains.length - 1].label.replace(' Intelligence', '')}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </FadeInUp>
            )}

            {/* Stage 2 · Mind styles */}
            {stage >= 2 && (
              <FadeInUp>
                <SectionTitle icon="head-cog-outline" title="Mind Styles" />
                <View style={s.stylesGrid}>
                  {mindStyles.map((m, i) => (
                    <FadeInUp key={m.title} delay={i * 90} style={s.styleCard}>
                      <Icon name={m.icon} size={20} color={dark.neon} />
                      <Text style={s.styleTitle}>{m.title}</Text>
                      <Text style={s.styleValue}>{m.value}</Text>
                      <Text style={s.styleNote}>{m.note}</Text>
                    </FadeInUp>
                  ))}
                </View>
              </FadeInUp>
            )}

            {/* Stage 3 · Careers */}
            {stage >= 3 && careers.length > 0 && (
              <FadeInUp>
                <SectionTitle icon="briefcase-outline" title="Career Suitability" />
                <View style={s.card}>
                  <Text style={s.cardHint}>Fields that tend to reward your strongest domains:</Text>
                  <View style={s.careerWrap}>
                    {careers.map(c => (
                      <View key={c} style={s.careerChip}>
                        <MaterialCommunityIcons name="check-circle-outline" size={13} color={dark.neon} />
                        <Text style={s.careerText}>{c}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </FadeInUp>
            )}

            {/* Stage 4 · AI narrative */}
            {stage >= 4 && narrative && (
              <FadeInUp>
                <SectionTitle icon="robot-outline" title="AI Narrative" />
                <View style={[s.card, s.narrativeCard]}>
                  <Text style={s.narrativeText}>{narrative}</Text>
                </View>
              </FadeInUp>
            )}

            {/* Stage 5 · Roadmap */}
            {stage >= 5 && (
              <FadeInUp>
                <SectionTitle icon="map-marker-path" title="Growth Roadmap" />
                <View style={s.card}>
                  <Text style={s.cardHint}>
                    Pick development goals and RHIMS will track them across your journey.
                  </Text>
                  <PressableScale style={s.goalsBtn} scaleTo={0.95} onPress={() => navigation.navigate('Goals')}>
                    <MaterialCommunityIcons name="flag-outline" size={17} color="#fff" />
                    <Text style={s.goalsBtnText}>Set My Development Goals</Text>
                  </PressableScale>
                </View>
              </FadeInUp>
            )}

            {/* Unlock control */}
            {stage < STAGES.length && (
              <PressableScale style={s.unlockBtn} scaleTo={0.95} onPress={unlockNext}>
                <Icon name={STAGES[stage].icon} size={17} color={dark.neon} />
                <Text style={s.unlockText}>
                  {stage === 0 ? 'Open Passport' : `Unlock ${STAGES[stage].label}`}
                </Text>
                <Ionicons name="chevron-down" size={15} color={dark.neon} />
              </PressableScale>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <View style={s.sectionRow}>
      <Icon name={icon} size={15} color={dark.textSub} />
      <Text style={s.sectionTitle}>{title.toUpperCase()}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: dark.bgSolid },

  hero: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28, alignItems: 'center' },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch', marginBottom: 16 },
  heroBack: {
    width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(139,158,255,0.15)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(139,158,255,0.35)',
  },
  heroBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5, color: '#8B9EFF' },
  heroEyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2.5, color: 'rgba(255,255,255,0.55)' },
  heroName:    { fontSize: rf(25), fontWeight: '900', color: '#fff', marginTop: 4, marginBottom: 18 },
  ringWrap: { marginBottom: 14 },
  ring: {
    width: scale(116), height: scale(116), borderRadius: scale(58),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2, borderColor: 'rgba(139,158,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  ringScore: { fontSize: rf(36), fontWeight: '900', color: '#fff' },
  ringLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  heroMeta:  { fontSize: 11.5, color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingHorizontal: 20 },

  content: { paddingHorizontal: 20, paddingTop: 6 },

  emptyCard: {
    margin: 20, backgroundColor: dark.glass, borderRadius: 20, padding: 26, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: dark.text, marginTop: 12, textAlign: 'center' },
  emptySub:   { fontSize: 13, color: dark.textSub, textAlign: 'center', marginTop: 6, lineHeight: 19 },
  emptyBtn:   { backgroundColor: dark.neon, borderRadius: 24, paddingHorizontal: 26, paddingVertical: 13, marginTop: 16 },
  emptyBtnText: { fontSize: 14, fontWeight: "800", color: "#05233A" },

  sectionRow:   { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 22, marginBottom: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: dark.textSub },

  card: {
    backgroundColor: dark.glass, borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: dark.glassBorder,
  },
  cardHint: { fontSize: 12.5, color: dark.textSub, lineHeight: 18, marginBottom: 12 },

  domainRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  domainIcon:  { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  domainLabel: { width: 92, fontSize: 12, fontWeight: '700', color: dark.text },
  domainScore: { width: 30, fontSize: 12.5, fontWeight: '800', textAlign: 'right' },
  chipRow:  { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  chip:     { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 11, fontWeight: '800' },

  stylesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  styleCard: {
    width: '48%', flexGrow: 1, backgroundColor: dark.glass, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: dark.glassBorder,
  },
  styleTitle: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.5, color: dark.textMute, marginTop: 8 },
  styleValue: { fontSize: 14.5, fontWeight: '800', color: dark.text, marginTop: 2 },
  styleNote:  { fontSize: 11.5, color: dark.textSub, lineHeight: 16, marginTop: 6 },

  careerWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  careerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: dark.glass, borderRadius: 12,
    paddingHorizontal: 11, paddingVertical: 7,
  },
  careerText: { fontSize: 12, fontWeight: '700', color: dark.neon },

  narrativeCard: { borderLeftWidth: 3, borderLeftColor: dark.neon },
  narrativeText: { fontSize: 13.5, color: dark.text, lineHeight: 21 },

  goalsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: dark.neon, borderRadius: 24, paddingVertical: 13,
  },
  goalsBtnText: { fontSize: 14, fontWeight: "800", color: "#05233A" },

  unlockBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: dark.glass, borderRadius: 24, paddingVertical: 14, marginTop: 22,
    borderWidth: 1.5, borderColor: dark.neon + '40',
  },
  unlockText: { fontSize: 14, fontWeight: '800', color: dark.neon },
});
