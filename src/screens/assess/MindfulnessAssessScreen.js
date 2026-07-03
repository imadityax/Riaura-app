import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';
import { MINDFULNESS_QUESTIONS } from '../../data/mindfulnessQuestions';
import { saveMindfulnessToCloud } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';

// Universal question set — FFMQ (most comprehensive, validated for all adults)
const UNIVERSAL_KEY = 'g18_30';

const MINDFULNESS_DOMAINS = [
  { num: 1, label: 'Present-Moment Awareness', icon: '🎯', color: '#2196F3', desc: 'Noticing what is happening right now' },
  { num: 2, label: 'Observing & Noticing',     icon: '👁️', color: '#9C27B0', desc: 'Tuning in to sensory experience' },
  { num: 3, label: 'Describing Inner Experience', icon: '✍️', color: '#4CAF50', desc: 'Labelling thoughts and feelings' },
  { num: 4, label: 'Acting with Awareness',    icon: '🌊', color: '#00BCD4', desc: 'Conscious, intentional action' },
  { num: 5, label: 'Non-Judging of Thoughts',  icon: '🕊️', color: '#FF9800', desc: 'Accepting thoughts without evaluation' },
  { num: 6, label: 'Non-Reactivity',           icon: '⚖️', color: '#E91E63', desc: 'Letting thoughts pass without reaction' },
  { num: 7, label: 'Emotional Regulation',      icon: '❤️', color: '#FF5722', desc: 'Managing feelings with clarity' },
  { num: 8, label: 'Body Awareness',           icon: '🧘', color: '#607D8B', desc: 'Sensing internal physical states' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cleanLabel(raw, value) {
  if (!raw.includes('\n')) {
    if (/^\d+$/.test(raw.trim())) return `Level ${value}`;
    return raw.trim();
  }
  return raw.split('\n').slice(1).join(' ');
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function MindfulnessAssessScreen({ navigation }) {
  const [phase, setPhase]       = useState('intro');
  const [questions, setQuestions]     = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [scale, setScale]             = useState(5);
  const [framework, setFramework]     = useState('');
  const [current, setCurrent]         = useState(0);
  const [answers, setAnswers]         = useState([]);
  const [selected, setSelected]       = useState(null);
  const [seconds, setSeconds]         = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { currentUser } = useAuth();

  useEffect(() => {
    if (phase !== 'questions') return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  function startAssessment() {
    const data = MINDFULNESS_QUESTIONS[UNIVERSAL_KEY];
    const labels = data.scaleLabels.map((raw, i) => ({
      label: cleanLabel(raw, i + 1),
      value: i + 1,
    }));
    const shuffledOpts = data.questions.map(() => shuffle([...labels]));
    setQuestions(data.questions);
    setShuffledOptions(shuffledOpts);
    setScale(data.scale);
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
      let total = 0;
      questions.forEach((q, i) => {
        const raw = newAnswers[i] || 0;
        total += q.reverse ? (scale + 1) - raw : raw;
      });
      const score = Math.round((total / (questions.length * scale)) * 100);
      await storage.saveMindfulnessScore(score);
      if (currentUser) {
        saveMindfulnessToCloud(currentUser.uid, score).catch(() => {});
      }
      navigation.replace('MindfulnessReport', {
        score,
        timeTaken: seconds,
        framework,
        totalQuestions: questions.length,
      });
    }
  }

  // ── INTRO ────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Text style={s.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={s.topTitle}>Assessments</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.introContent}>
          <Text style={s.introSub}>Science-backed mindfulness evaluation</Text>

          {/* Hero */}
          <View style={s.heroCard}>
            <Text style={s.heroIcon}>🧠</Text>
            <Text style={s.heroCardTitle}>MINDFULNESS{'\n'}ASSESSMENT</Text>
            <View style={s.heroBadges}>
              <View style={s.badge}><Text style={s.badgeText}>Validated Scale</Text></View>
              <View style={s.badge}><Text style={s.badgeText}>Science-Backed</Text></View>
            </View>
            <Text style={s.heroDesc}>
              This assessment uses the Five Facet Mindfulness Questionnaire (FFMQ) — a clinically validated
              instrument measuring present-moment awareness, attention regulation, and non-judgmental
              observation across 8 mindfulness domains.
            </Text>
            <View style={s.heroStats}>
              <View style={s.heroStat}>
                <Text style={s.heroStatNum}>8</Text>
                <Text style={s.heroStatLbl}>Domains</Text>
              </View>
              <View style={s.heroStatDiv} />
              <View style={s.heroStat}>
                <Text style={s.heroStatNum}>15</Text>
                <Text style={s.heroStatLbl}>Questions</Text>
              </View>
              <View style={s.heroStatDiv} />
              <View style={s.heroStat}>
                <Text style={s.heroStatNum}>FFMQ</Text>
                <Text style={s.heroStatLbl}>Framework</Text>
              </View>
            </View>
          </View>

          <Text style={s.sectionLabel}>8 MINDFULNESS DOMAINS</Text>

          {MINDFULNESS_DOMAINS.map((d) => (
            <View key={d.num} style={s.domainCard}>
              <View style={[s.domainNumPill, { backgroundColor: d.color + '18' }]}>
                <Text style={[s.domainNumText, { color: d.color }]}>DOMAIN {d.num} OF 8</Text>
              </View>
              <View style={s.domainRow}>
                <Text style={s.domainIcon}>{d.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.domainLabel}>{d.label}</Text>
                  <Text style={s.domainDesc}>{d.desc}</Text>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity style={s.beginBtn} onPress={startAssessment} activeOpacity={0.85}>
            <Text style={s.beginBtnText}>Begin Assessment →</Text>
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── QUESTIONS ────────────────────────────────────────────
  if (!questions.length) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.loadingWrap}>
          <Text style={s.loadingText}>Loading your assessment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const q        = questions[current];
  const opts     = shuffledOptions[current] || [];
  const progress = (current + 1) / questions.length;
  const isLast   = current + 1 === questions.length;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />

      <View style={s.qTopBar}>
        <TouchableOpacity onPress={() => setPhase('intro')} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <View style={s.timerPill}>
          <Text style={s.timerText}>⏱ {formatTime(seconds)}</Text>
        </View>
        <Text style={s.progressText}>{current + 1} / {questions.length}</Text>
      </View>

      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.frameworkRow}>
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

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={s.questionText}>{q.text}</Text>

          <View style={s.optionsWrap}>
            {opts.map((opt, idx) => (
              <TouchableOpacity
                key={idx}
                style={[s.optionCard, selected === opt.value && s.optionCardSelected]}
                onPress={() => setSelected(opt.value)}
                activeOpacity={0.75}
              >
                <Text style={[s.optionLabel, selected === opt.value && s.optionLabelSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <TouchableOpacity
          style={[s.nextBtn, selected === null && s.nextBtnDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={selected === null}
        >
          <Text style={[s.nextBtnText, selected === null && s.nextBtnTextDisabled]}>
            {isLast ? 'Submit  ✓' : 'Next  →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: ui.offWhite },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15, color: ui.midText },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backBtn:  { paddingVertical: 4, paddingRight: 8 },
  backText: { fontSize: 16, fontWeight: '700', color: ui.primaryBlue },
  topTitle: { fontSize: 15, fontWeight: '800', color: ui.darkText },

  // ── intro ──
  introContent: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },
  introSub:     { fontSize: 13, color: ui.midText, marginBottom: 16 },

  heroCard: {
    backgroundColor: ui.primaryBlue, borderRadius: 20, padding: 24,
    alignItems: 'center', marginBottom: 24,
    shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  heroIcon:      { fontSize: 44, marginBottom: 10 },
  heroCardTitle: { fontSize: 20, fontWeight: '900', color: '#fff', textAlign: 'center', letterSpacing: 1, marginBottom: 12 },
  heroBadges:    { flexDirection: 'row', gap: 8, marginBottom: 14 },
  badge:         { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText:     { fontSize: 12, fontWeight: '700', color: '#fff' },
  heroDesc:      { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 20, textAlign: 'center', marginBottom: 18 },
  heroStats:     { flexDirection: 'row', alignItems: 'center' },
  heroStat:      { alignItems: 'center', flex: 1 },
  heroStatNum:   { fontSize: 22, fontWeight: '900', color: '#FFD94A' },
  heroStatLbl:   { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600', marginTop: 2 },
  heroStatDiv:   { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },

  sectionLabel: { fontSize: 11, fontWeight: '800', color: ui.midText, letterSpacing: 1.2, marginBottom: 10 },

  domainCard: {
    backgroundColor: ui.white, borderRadius: 14, padding: 14,
    marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  domainNumPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  domainNumText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  domainRow:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  domainIcon:    { fontSize: 22 },
  domainLabel:   { fontSize: 14, fontWeight: '800', color: ui.darkText },
  domainDesc:    { fontSize: 11, color: ui.midText, marginTop: 2 },

  beginBtn: {
    backgroundColor: ui.primaryBlue, borderRadius: 28, paddingVertical: 16,
    alignItems: 'center', marginTop: 20,
    shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  beginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // ── questions ──
  qTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  timerPill: {
    backgroundColor: ui.challengeBg, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  timerText:    { fontSize: 13, fontWeight: '700', color: ui.primaryBlue },
  progressText: { fontSize: 13, fontWeight: '600', color: ui.midText, minWidth: 48, textAlign: 'right' },

  progressTrack: { height: 4, backgroundColor: ui.borderGray, marginHorizontal: 20, borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: ui.primaryBlue, borderRadius: 2 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },

  frameworkRow:   { flexDirection: 'row', gap: 8, marginBottom: 10 },
  frameworkBadge: {
    backgroundColor: ui.challengeBg, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  frameworkText: { fontSize: 11, fontWeight: '700', color: ui.primaryBlue, letterSpacing: 0.5 },

  diffBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16 },
  diffEasy:  { backgroundColor: '#D1FAE5' },
  diffMid:   { backgroundColor: '#FEF3C7' },
  diffHard:  { backgroundColor: '#FEE2E2' },
  diffText:  { fontSize: 11, fontWeight: '700' },
  diffTextEasy: { color: '#065F46' },
  diffTextMid:  { color: '#92400E' },
  diffTextHard: { color: '#991B1B' },

  questionText: { fontSize: 17, fontWeight: '700', color: ui.darkText, lineHeight: 26, marginBottom: 24 },

  optionsWrap: { gap: 10, marginBottom: 8 },
  optionCard:  {
    backgroundColor: ui.white, borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  optionCardSelected: { backgroundColor: ui.primaryBlue, borderColor: ui.primaryBlue },
  optionLabel:        { fontSize: 15, fontWeight: '600', color: ui.darkText, textAlign: 'center' },
  optionLabelSelected:{ color: '#fff' },

  nextBtn: {
    backgroundColor: ui.primaryBlue, borderRadius: 28, paddingVertical: 16,
    alignItems: 'center', marginTop: 16,
    shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  nextBtnDisabled:    { backgroundColor: ui.borderGray, shadowOpacity: 0 },
  nextBtnText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
  nextBtnTextDisabled:{ color: ui.lightText },
});
