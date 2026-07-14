import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PressableScale, FadeInUp, ProgressBar, Pulse } from '../../components/anim';
import { BRAIN_FACTS } from '../../data/brainFacts';
import NeuralLoader from '../../components/NeuralLoader';
import { ui, dark } from '../../theme/colors';
import Icon from '../../components/Icon';
import BrainIcon from '../../components/BrainIcon';
import { storage } from '../../utils/storage';
import { AGE_GROUPS, getMindfulnessQuestions, scoreMindfulnessBank } from '../../data/mindfulnessQuestions';
import { saveMindfulnessToCloud, saveMindfulnessDomainsToCloud } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import NeuralLinesBg from '../../components/NeuralLinesBg';

export const MINDFULNESS_DOMAINS = [
  { num: 1, label: 'Attention Intelligence',     icon: 'target',            color: '#2196F3', desc: 'Fronto-parietal attention network' },
  { num: 2, label: 'Memory Intelligence',        icon: 'brain',             color: '#9C27B0', desc: 'Medial temporal lobe · hippocampus' },
  { num: 3, label: 'Processing Intelligence',    icon: 'lightning-bolt-outline',    color: '#4CAF50', desc: 'Occipito-parietal · sensorimotor' },
  { num: 4, label: 'Reasoning Intelligence',     icon: 'puzzle-outline',    color: '#00BCD4', desc: 'Dorsolateral prefrontal cortex' },
  { num: 5, label: 'Decision Intelligence',      icon: 'scale-balance',     color: '#FF9800', desc: 'Orbitofrontal · frontal lobe' },
  { num: 6, label: 'Emotional Intelligence',     icon: 'heart-outline',     color: '#E91E63', desc: 'Limbic system · amygdala' },
  { num: 7, label: 'Social & Originality',       icon: 'handshake-outline', color: '#FF5722', desc: 'Temporo-parietal junction · DMN' },
  { num: 8, label: 'Metacognitive Intelligence', icon: 'mirror',            color: '#607D8B', desc: 'Dorsomedial prefrontal cortex' },
];

const AGE_GROUP_META = {
  g3_6:   { icon: 'sparkles-outline',  color: '#F59E0B' },
  g6_9:   { icon: 'star-outline',      color: '#10B981' },
  g9_12:  { icon: 'bulb-outline',      color: '#06B6D4' },
  g12_18: { icon: 'disc-outline',      color: '#8B5CF6' },
  g18_30: { icon: 'school-outline',    color: '#3B82F6' },
  g30_45: { icon: 'briefcase-outline', color: '#EF4444' },
  g45_60: { icon: 'ribbon-outline',    color: '#F97316' },
  g60p:   { icon: 'flower-outline',    color: '#14B8A6' },
};

// Anchor text for a scale point: "1\nNever" → "Never"; bare numbers ("2")
// have no anchor and render as just the number badge.
function cleanLabel(raw) {
  if (!raw.includes('\n')) {
    if (/^\d+$/.test(raw.trim())) return '';
    return raw.trim();
  }
  return raw.split('\n').slice(1).join(' ');
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function MindfulnessAssessScreen({ navigation, route }) {
  const preselected = MINDFULNESS_DOMAINS.find(d => d.num === route?.params?.domainNum) || null;
  const [phase, setPhase]       = useState(preselected ? 'age' : 'domains');   // domains → age → questions
  const [domain, setDomain]     = useState(preselected);
  const [ageGroup, setAgeGroup] = useState(null);
  const [doneMap, setDoneMap]   = useState({});
  const [questions, setQuestions]     = useState([]);
  const [options, setOptions]         = useState([]);
  const [scale, setScale]             = useState(5);
  const [scoring, setScoring]         = useState('standard');
  const [framework, setFramework]     = useState('');
  const [current, setCurrent]         = useState(0);
  const [answers, setAnswers]         = useState([]);
  const [selected, setSelected]       = useState(null);
  const [seconds, setSeconds]         = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { currentUser } = useAuth();

  useFocusEffect(useCallback(() => {
    storage.getMindfulnessDomainScores().then(setDoneMap);
  }, []));

  useEffect(() => {
    if (phase !== 'questions') return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  function openDomain(d) {
    setDomain(d);
    setPhase('age');
  }

  function startAssessment(group) {
    const data = getMindfulnessQuestions(domain.num, group.key);
    const labels = data.scaleLabels.map((raw, i) => ({
      label: cleanLabel(raw),
      value: i + 1,
    }));
    setAgeGroup(group);
    setQuestions(data.questions);
    setOptions(labels);
    setScale(data.scale);
    setScoring(data.scoring || 'standard');
    setFramework(data.framework);
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setSeconds(0);
    setPhase('questions');
  }

  function animateFade(cb) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      cb();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  async function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];

    if (current + 1 < questions.length) {
      animateFade(() => {
        setAnswers(newAnswers);
        setCurrent(c => c + 1);
        setSelected(null);
      });
    } else {
      const { percent: score, band } = scoreMindfulnessBank({ scale, questions, scoring }, newAnswers);

      const map = await storage.saveMindfulnessDomainScore(domain.num, {
        score,
        band,
        ageGroup: ageGroup.key,
        framework,
        completedAt: new Date().toISOString(),
      });
      const scores  = Object.values(map).map(e => e.score);
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      await storage.saveMindfulnessScore(overall);
      if (currentUser) {
        saveMindfulnessToCloud(currentUser.uid, overall).catch(() => {});
        saveMindfulnessDomainsToCloud(currentUser.uid, map).catch(() => {});
      }

      navigation.replace('Completion', {
        report: {
          score,
          band,
          timeTaken: seconds,
          framework,
          totalQuestions: questions.length,
          domainNum: domain.num,
          domainLabel: domain.label,
          domainIcon: domain.icon,
          ageLabel: ageGroup.label,
          domainsDone: Object.keys(map).length,
        },
      });
    }
  }

  // ── STEP 1 · 8 DOMAINS ───────────────────────────────────
  if (phase === 'domains') {
    const doneCount = Object.keys(doneMap).length;
    return (
      <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
      <NeuralLinesBg />
        <StatusBar barStyle="dark-content" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.introContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color={dark.neon} />
            <Text style={s.backText}>Back</Text>
          </TouchableOpacity>

          <Text style={s.pageTitle}>Mindfulness Assessment</Text>
          <Text style={s.introSub}>Science-backed evaluation across 8 domains</Text>

          {/* Compact hero */}
          <View style={s.heroWrap}>
            <View style={s.heroTop}>
              <View style={s.heroIconBg}>
                <BrainIcon size={28} color="#fff" strokeWidth={2} />
              </View>
              <Text style={s.heroCardTitle}>MINDFULNESS MEASUREMENT SCALE</Text>
            </View>
            <View style={s.heroBottom}>
              <View style={s.heroBadges}>
                <View style={[s.badge, s.badgeGreen]}>
                  <Text style={[s.badgeText, s.badgeTextGreen]}>Validated Scale</Text>
                </View>
                <View style={[s.badge, s.badgeBlue]}>
                  <Text style={[s.badgeText, s.badgeTextBlue]}>Age-Adaptive</Text>
                </View>
              </View>
              <Text style={s.heroDesc}>
                Pick a domain below, choose your age group, and answer a short set of
                clinically validated questions (C-OMM, S-CAMM, MAAS-A, FFMQ). You'll
                receive a score report after each domain.
              </Text>
              <View style={s.progressPill}>
                <Ionicons name="checkmark-circle" size={15} color={doneCount ? '#059669' : dark.textSub} />
                <Text style={s.progressPillText}>{doneCount} of 8 domains completed</Text>
              </View>
            </View>
          </View>

          <Text style={s.sectionLabel}>CHOOSE A DOMAIN TO BEGIN</Text>

          {MINDFULNESS_DOMAINS.map((d, di) => {
            const done = doneMap[d.num];
            return (
              <FadeInUp key={d.num} delay={di * 60}>
              <PressableScale
                style={s.domainCard}
                scaleTo={0.97}
                onPress={() => openDomain(d)}
              >
                <View style={s.domainCardHead}>
                  <View style={[s.domainNumPill, { backgroundColor: d.color + '18' }]}>
                    <Text style={[s.domainNumText, { color: d.color }]}>DOMAIN {d.num} OF 8</Text>
                  </View>
                  {done && (
                    <View style={s.doneBadge}>
                      <Text style={s.doneBadgeText}>✓ {done.score}</Text>
                    </View>
                  )}
                </View>
                <View style={s.domainRow}>
                  <View style={[s.domainIconBg, { backgroundColor: d.color + '15' }]}>
                    <Icon name={d.icon} size={22} color={d.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.domainLabel}>{d.label}</Text>
                    <Text style={s.domainDesc}>{d.desc}</Text>
                  </View>
                  <View style={[s.chevronBg, { backgroundColor: d.color + '15' }]}>
                    <Ionicons name="chevron-forward" size={16} color={d.color} />
                  </View>
                </View>
              </PressableScale>
              </FadeInUp>
            );
          })}

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── STEP 2 · SELECT AGE GROUP ────────────────────────────
  if (phase === 'age') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
      <NeuralLinesBg />
        <StatusBar barStyle="dark-content" />

        <View style={s.ageHeader}>
          <TouchableOpacity
            style={s.ageBackBtn}
            onPress={() => (preselected ? navigation.goBack() : setPhase('domains'))}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={20} color={'#1E1B33'} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.ageTitle}>Select Age Group</Text>
            <Text style={s.ageSub}>We'll show questions tailored to you</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.ageContent}>
          <View style={[s.selectedDomainCard, { borderLeftColor: domain.color }]}>
            <Icon name={domain.icon} size={24} color={domain.color} />
            <View style={{ flex: 1 }}>
              <Text style={s.selectedDomainKicker}>DOMAIN {domain.num} OF 8</Text>
              <Text style={s.selectedDomainLabel}>{domain.label}</Text>
            </View>
          </View>

          {AGE_GROUPS.map((g) => {
            const meta = AGE_GROUP_META[g.key] || { icon: 'person-outline', color: dark.neon };
            const bank = getMindfulnessQuestions(domain.num, g.key);
            return (
              <FadeInUp key={g.key} delay={AGE_GROUPS.indexOf(g) * 50}>
              <PressableScale
                style={s.ageCard}
                scaleTo={0.97}
                onPress={() => startAssessment(g)}
              >
                <View style={[s.ageIconBg, { backgroundColor: meta.color + '18' }]}>
                  <Ionicons name={meta.icon} size={22} color={meta.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.ageLabel}>{g.label} years</Text>
                  <Text style={s.ageMeta}>
                    {bank.framework} · {bank.questions.length} items · {bank.scale}-point
                  </Text>
                </View>
                <View style={[s.chevronBg, { backgroundColor: meta.color + '15' }]}>
                  <Ionicons name="chevron-forward" size={16} color={meta.color} />
                </View>
              </PressableScale>
              </FadeInUp>
            );
          })}

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── STEP 3 · QUESTIONS ───────────────────────────────────
  if (!questions.length) {
    const loadingFact = BRAIN_FACTS[Math.floor(Math.random() * BRAIN_FACTS.length)];
    return (
      <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
      <NeuralLinesBg />
        <View style={s.loadingWrap}>
          <NeuralLoader size={104} />
          <Text style={s.loadingText}>Preparing your assessment…</Text>
          <View style={s.loadingFactCard}>
            <Icon name={loadingFact.icon} size={20} color={dark.neon} />
            <Text style={s.loadingFactText}>{loadingFact.fact}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const q        = questions[current];
  const opts     = options;
  const progress = (current + 1) / questions.length;
  const isLast   = current + 1 === questions.length;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
      <NeuralLinesBg />
      <StatusBar barStyle="dark-content" />

      <View style={s.qTopBar}>
        <TouchableOpacity onPress={() => setPhase('age')} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <View style={s.timerPill}>
          <Text style={s.timerText}>⏱ {formatTime(seconds)}</Text>
        </View>
        <Text style={s.progressText}>{current + 1} / {questions.length}</Text>
      </View>

      <ProgressBar
        progress={progress}
        height={6}
        trackColor={dark.glassBorder}
        fillColor={domain.color}
        duration={500}
        style={s.progressTrack}
      />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {current === Math.floor(questions.length / 2) && questions.length > 4 && (
          <FadeInUp style={s.checkpointBanner}>
            <MaterialCommunityIcons name="flag-checkered" size={15} color="#059669" />
            <Text style={s.checkpointText}>Halfway through your cognitive journey — great focus so far.</Text>
          </FadeInUp>
        )}

        <View style={s.frameworkRow}>
          <View style={[s.frameworkBadge, { backgroundColor: domain.color + '18' }]}>
            <Text style={[s.frameworkText, { color: domain.color }]}>
              <Icon name={domain.icon} size={12} color={domain.color} />
              {'  '}{domain.label}
            </Text>
          </View>
          <View style={s.frameworkBadge}>
            <Text style={s.frameworkText}>{framework}</Text>
          </View>
        </View>

        <View style={[s.diffBadge,
          q.difficulty === 'Easy'     && s.diffEasy,
          q.difficulty === 'Moderate' && s.diffMid,
          q.difficulty === 'Hard'     && s.diffHard,
        ]}>
          <Text style={[s.diffText,
            q.difficulty === 'Easy'     && s.diffTextEasy,
            q.difficulty === 'Moderate' && s.diffTextMid,
            q.difficulty === 'Hard'     && s.diffTextHard,
          ]}>{q.difficulty}</Text>
        </View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          }}
        >
          <Text style={s.questionText}>{q.text}</Text>

          <View style={s.optionsWrap}>
            {opts.map((opt) => (
              <PressableScale
                key={opt.value}
                style={[s.optionCard, selected === opt.value && s.optionCardSelected]}
                scaleTo={0.95}
                onPress={() => setSelected(opt.value)}
              >
                <View style={s.optionRow}>
                  <View style={[s.optionNum, selected === opt.value && s.optionNumSelected]}>
                    <Text style={[s.optionNumText, selected === opt.value && s.optionNumTextSelected]}>
                      {opt.value}
                    </Text>
                  </View>
                  <Text style={[s.optionLabel, selected === opt.value && s.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                </View>
                {selected === opt.value && (
                  <View style={s.optionCheck}>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  </View>
                )}
              </PressableScale>
            ))}
          </View>
        </Animated.View>

        <PressableScale
          style={[s.nextBtn, selected === null && s.nextBtnDisabled]}
          scaleTo={0.95}
          onPress={handleNext}
          disabled={selected === null}
        >
          <Text style={[s.nextBtnText, selected === null && s.nextBtnTextDisabled]}>
            {isLast ? 'Submit  ✓' : 'Next  →'}
          </Text>
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: dark.bgSolid },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  loadingIconBg: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: dark.glass,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  loadingText: { fontSize: 15, fontWeight: '600', color: dark.textSub, marginBottom: 26 },
  loadingFactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: dark.glass, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: dark.glassBorder,
  },
  loadingFactText: { flex: 1, fontSize: 12.5, color: dark.textSub, lineHeight: 18 },

  backBtn:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, marginBottom: 6, alignSelf: 'flex-start' },
  backText: { fontSize: 15, fontWeight: '700', color: dark.neon, marginLeft: 2 },

  // ── domains step ──
  introContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },
  pageTitle:    { fontSize: 24, fontWeight: '900', color: '#1E1B33' },
  introSub:     { fontSize: 13, color: dark.textSub, marginTop: 4, marginBottom: 16 },

  heroWrap: {
    borderRadius: 20, overflow: 'hidden', marginBottom: 24, backgroundColor: dark.glass,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  heroTop: {
    backgroundColor: dark.neon, alignItems: 'center', paddingVertical: 22, paddingHorizontal: 20,
  },
  heroIconBg: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  heroCardTitle: { fontSize: 13, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: 1.5 },

  heroBottom: { padding: 18 },
  heroBadges: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  badge:      { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeGreen: { backgroundColor: '#D1FAE5' },
  badgeBlue:  { backgroundColor: dark.glass },
  badgeText:      { fontSize: 12, fontWeight: '700' },
  badgeTextGreen: { color: '#065F46' },
  badgeTextBlue:  { color: dark.neon },
  heroDesc: { fontSize: 13, color: dark.textSub, lineHeight: 20, marginBottom: 14 },

  progressPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: dark.glass, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  progressPillText: { fontSize: 12, fontWeight: '700', color: '#fff' },

  sectionLabel: { fontSize: 11, fontWeight: '800', color: dark.textSub, letterSpacing: 1.2, marginBottom: 10 },

  domainCard: {
    backgroundColor: dark.glass, borderRadius: 16, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  domainCardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  domainNumPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  domainNumText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  doneBadge:     { backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  doneBadgeText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  domainRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  domainIconBg:  { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  domainLabel:   { fontSize: 14, fontWeight: '800', color: '#1E1B33' },
  domainDesc:    { fontSize: 11, color: dark.textSub, marginTop: 2 },
  chevronBg:     { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },

  // ── age step ──
  ageHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
    backgroundColor: dark.glass, borderBottomWidth: 1, borderBottomColor: dark.glassBorder,
  },
  ageBackBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: dark.glass,
    alignItems: 'center', justifyContent: 'center',
  },
  ageTitle: { fontSize: 20, fontWeight: '900', color: '#1E1B33' },
  ageSub:   { fontSize: 12, color: dark.textSub, marginTop: 2 },

  ageContent: { paddingHorizontal: 20, paddingTop: 16 },

  selectedDomainCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: dark.glass, borderRadius: 14, padding: 14,
    borderLeftWidth: 4, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  selectedDomainKicker: { fontSize: 10, fontWeight: '800', color: dark.textSub, letterSpacing: 0.6 },
  selectedDomainLabel:  { fontSize: 15, fontWeight: '800', color: '#1E1B33', marginTop: 2 },

  ageCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: dark.glass, borderRadius: 16, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  ageIconBg: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ageLabel:  { fontSize: 16, fontWeight: '800', color: '#1E1B33' },
  ageMeta:   { fontSize: 12, color: dark.textSub, marginTop: 3 },

  // ── questions step ──
  qTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  timerPill: {
    backgroundColor: dark.glass, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  timerText:    { fontSize: 13, fontWeight: '700', color: dark.neon },
  progressText: { fontSize: 13, fontWeight: '600', color: dark.textSub, minWidth: 48, textAlign: 'right' },

  progressTrack: { height: 4, backgroundColor: dark.glassBorder, marginHorizontal: 20, borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: dark.neon, borderRadius: 2 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },

  checkpointBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#D1FAE5', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12,
  },
  checkpointText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#065F46' },
  frameworkRow:   { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  frameworkBadge: {
    backgroundColor: dark.glass, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  frameworkText: { fontSize: 11, fontWeight: '700', color: dark.neon, letterSpacing: 0.5 },

  diffBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16 },
  diffEasy:  { backgroundColor: '#D1FAE5' },
  diffMid:   { backgroundColor: '#FEF3C7' },
  diffHard:  { backgroundColor: '#FEE2E2' },
  diffText:  { fontSize: 11, fontWeight: '700' },
  diffTextEasy: { color: '#065F46' },
  diffTextMid:  { color: '#92400E' },
  diffTextHard: { color: '#991B1B' },

  questionText: { fontSize: 17, fontWeight: '700', color: '#1E1B33', lineHeight: 26, marginBottom: 24 },

  optionsWrap: { gap: 10, marginBottom: 8 },
  optionCard:  {
    backgroundColor: dark.glass, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 14,
    borderWidth: 1.5, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  optionCardSelected: { backgroundColor: dark.neon, borderColor: dark.neon },
  optionRow:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 30 },
  optionNum: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: dark.glass,
    alignItems: 'center', justifyContent: 'center',
  },
  optionNumSelected:     { backgroundColor: 'rgba(255,255,255,0.25)' },
  optionNumText:         { fontSize: 13, fontWeight: '800', color: dark.textSub },
  optionNumTextSelected: { color: '#fff' },
  optionLabel:        { flex: 1, fontSize: 15, fontWeight: '600', color: '#1E1B33' },
  optionLabelSelected:{ color: '#fff' },
  optionCheck:        { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },

  nextBtn: {
    backgroundColor: dark.neon, borderRadius: 28, paddingVertical: 16,
    alignItems: 'center', marginTop: 16,
    shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  nextBtnDisabled:    { backgroundColor: dark.glassBorder, shadowOpacity: 0 },
  nextBtnText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
  nextBtnTextDisabled:{ color: dark.textMute },
});
