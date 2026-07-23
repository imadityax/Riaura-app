import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Animated, Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { PressableScale, FadeInUp, Pulse, Float, Breathe, Typewriter } from '../../components/anim';
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
import { ClayCard, ClayBubble, ClaySurface } from '../../components/Clay';

const MOTIVATION_LINES = [
  'Every answer improves your intelligence map.',
  'Building your cognitive fingerprint…',
];

// One-line hint under an answer, keyed by the cleaned frequency-scale label.
const FREQUENCY_HINTS = {
  'Never': 'This almost never happens to you',
  'Never/ Rarely': 'This rarely or never happens to you',
  'Rarely': 'This happens only occasionally',
  'Sometimes': 'This happens some of the time',
  'Often': 'This happens fairly often',
  'Very Often': 'This happens most of the time',
  'Always': 'This is true almost all the time',
  'Almost Always': 'This is true almost all the time',
  'Almost Never': 'This is rarely true for you',
  'Somewhat Often': 'This happens somewhat often',
  'Somewhat Rarely': 'This happens somewhat rarely',
};

const DIFF_TONE  = { Easy: 'correct', Moderate: 'warning', Hard: 'incorrect' };
const DIFF_COLOR = { Easy: '#065F46', Moderate: '#92400E', Hard: '#991B1B' };
const DIFF_ICON  = { Easy: 'leaf-outline', Moderate: 'trending-up', Hard: 'flash' };

// A single answer card — owns its own persistent "lifted" animation so
// selecting it feels like it physically rises off the page, distinct from
// ClayCard's transient press-scale.
function AnswerOption({ opt, selected, onSelect }) {
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(lift, { toValue: selected ? 1 : 0, useNativeDriver: true, speed: 18, bounciness: 8 }).start();
  }, [selected]);

  const hint = FREQUENCY_HINTS[opt.label] || '';

  return (
    <Animated.View
      style={{
        transform: [
          { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] }) },
          { translateY: lift.interpolate({ inputRange: [0, 1], outputRange: [0, -2] }) },
        ],
      }}
    >
      <ClayCard
        tone={selected ? 'selected' : 'default'}
        radius={18}
        style={s.optionCard}
        scaleTo={0.97}
        onPress={onSelect}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`Option ${opt.value}: ${opt.label}${hint ? `. ${hint}` : ''}`}
      >
        <View style={s.optionRow}>
          <ClayBubble size={32} tone={selected ? 'selected' : 'default'} style={selected && s.optionNumOnSelected}>
            <Text style={[s.optionNumText, selected && s.optionNumTextSelected]}>{opt.value}</Text>
          </ClayBubble>
          <View style={{ flex: 1 }}>
            <Text style={[s.optionLabel, selected && s.optionLabelSelected]}>{opt.label}</Text>
            {!!hint && <Text style={[s.optionHint, selected && s.optionHintSelected]}>{hint}</Text>}
          </View>
        </View>
        {selected && (
          <View style={s.optionCheck}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
          </View>
        )}
      </ClayCard>
    </Animated.View>
  );
}

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
  const progressAnim = useRef(new Animated.Value(0)).current;
  const { currentUser } = useAuth();

  const progress    = questions.length ? (current + 1) / questions.length : 0;
  const remainingQ  = questions.length - current - 1;
  const estMinutes  = Math.ceil((remainingQ * 12) / 60);

  useFocusEffect(useCallback(() => {
    storage.getMindfulnessDomainScores().then(setDoneMap);
  }, []));

  useEffect(() => {
    if (phase !== 'questions') return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [progress]);

  function handleSelectOption(value) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelected(value);
  }

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
            <LinearGradient colors={[dark.neon, '#4F8CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.heroTop}>
              <View pointerEvents="none" style={s.heroGlowWrap}>
                <Breathe size={130} color="rgba(255,255,255,0.18)" duration={2800} />
              </View>
              <Float distance={6} duration={3200}>
                <View style={s.heroIconBg}>
                  <BrainIcon size={28} color="#fff" strokeWidth={2} />
                </View>
              </Float>
              <Text style={s.heroCardTitle}>MINDFULNESS MEASUREMENT SCALE</Text>
            </LinearGradient>
            <View style={s.heroBottom}>
              <View style={s.heroBadges}>
                <ClaySurface tone="correct" radius={20} style={s.clayBadge}>
                  <Text style={[s.badgeText, s.badgeTextGreen]}>Validated Scale</Text>
                </ClaySurface>
                <ClaySurface tone="default" radius={20} style={s.clayBadge}>
                  <Text style={[s.badgeText, s.badgeTextBlue]}>Age-Adaptive</Text>
                </ClaySurface>
              </View>
              <Text style={s.heroDesc}>
                Pick a domain below, choose your age group, and answer a short set of
                clinically validated questions (C-OMM, S-CAMM, MAAS-A, FFMQ). You'll
                receive a score report after each domain.
              </Text>
              <ClaySurface tone="default" radius={12} style={s.progressPill}>
                <Ionicons name="checkmark-circle" size={15} color={doneCount ? '#059669' : dark.textSub} />
                <Text style={s.progressPillText}>{doneCount} of 8 domains completed</Text>
              </ClaySurface>
            </View>
          </View>

          <Text style={s.sectionLabel}>CHOOSE A DOMAIN TO BEGIN</Text>

          {MINDFULNESS_DOMAINS.map((d, di) => {
            const done = doneMap[d.num];
            return (
              <FadeInUp key={d.num} delay={di * 60}>
              <ClayCard
                tone={done ? 'correct' : 'default'}
                radius={18}
                style={s.domainCard}
                scaleTo={0.97}
                onPress={() => openDomain(d)}
                accessibilityRole="button"
                accessibilityLabel={`Domain ${d.num} of 8: ${d.label}${done ? `, completed with score ${done.score}` : ''}`}
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
              </ClayCard>
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
          <ClaySurface tone="default" radius={16} style={[s.selectedDomainCard, { borderLeftWidth: 4, borderLeftColor: domain.color }]}>
            <Icon name={domain.icon} size={24} color={domain.color} />
            <View style={{ flex: 1 }}>
              <Text style={s.selectedDomainKicker}>DOMAIN {domain.num} OF 8</Text>
              <Text style={s.selectedDomainLabel}>{domain.label}</Text>
            </View>
          </ClaySurface>

          {AGE_GROUPS.map((g) => {
            const meta = AGE_GROUP_META[g.key] || { icon: 'person-outline', color: dark.neon };
            const bank = getMindfulnessQuestions(domain.num, g.key);
            return (
              <FadeInUp key={g.key} delay={AGE_GROUPS.indexOf(g) * 50}>
              <ClayCard
                tone="default"
                radius={18}
                style={s.ageCard}
                scaleTo={0.97}
                onPress={() => startAssessment(g)}
                accessibilityRole="button"
                accessibilityLabel={`${g.label} years, ${bank.framework}, ${bank.questions.length} items`}
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
              </ClayCard>
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
  const isLast   = current + 1 === questions.length;

  const diffTone  = DIFF_TONE[q.difficulty]  || 'default';
  const diffColor = DIFF_COLOR[q.difficulty] || dark.textSub;
  const diffIcon  = DIFF_ICON[q.difficulty]  || 'help-circle-outline';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
      <NeuralLinesBg />
      <StatusBar barStyle="dark-content" />

      <View pointerEvents="none" style={s.heroBrainFlourish}>
        <Breathe size={150} color="rgba(139,92,246,0.16)" duration={3000} />
        <Float distance={8} duration={4200}>
          <BrainIcon size={104} color={dark.violet} strokeWidth={1.3} style={{ opacity: 0.14 }} />
        </Float>
      </View>

      <View style={s.qTopBar}>
        <TouchableOpacity onPress={() => setPhase('age')} accessibilityRole="button" accessibilityLabel="Go back to age selection" hitSlop={8}>
          <ClayBubble size={38} tone="default">
            <Ionicons name="chevron-back" size={20} color={dark.neon} />
          </ClayBubble>
        </TouchableOpacity>
        <ClaySurface tone="default" radius={20} style={s.timerPill}>
          <View style={s.timerRow}>
            <Pulse to={1.15} duration={650}>
              <Ionicons name="time-outline" size={14} color={dark.neon} />
            </Pulse>
            <Text style={s.timerText}>{formatTime(seconds)}</Text>
          </View>
        </ClaySurface>
        <ClaySurface tone="default" radius={16} style={s.counterPill}>
          <Text style={s.progressText}>{current + 1} / {questions.length}</Text>
        </ClaySurface>
      </View>

      <View style={s.progressTrack}>
        <Animated.View
          style={{
            height: '100%', borderRadius: 3, overflow: 'hidden',
            width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          }}
        >
          <LinearGradient colors={[dark.violet, '#4F8CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
        </Animated.View>
      </View>
      <Text style={s.progressCaption}>
        {remainingQ <= 0 ? 'Last question' : `~${Math.max(estMinutes, 1)} min remaining`}
      </Text>

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
          <ClaySurface tone="default" radius={14} style={s.chip}>
            <View style={s.chipRow}>
              <Icon name={domain.icon} size={13} color={domain.color} />
              <Text style={[s.chipText, { color: domain.color }]}>{domain.label}</Text>
            </View>
          </ClaySurface>
          <ClaySurface tone="default" radius={14} style={s.chip}>
            <View style={s.chipRow}>
              <MaterialCommunityIcons name="flask-outline" size={13} color={dark.neon} />
              <Text style={s.chipText}>{framework}</Text>
            </View>
          </ClaySurface>
          <ClaySurface tone={diffTone} radius={14} style={s.chip}>
            <View style={s.chipRow}>
              <Ionicons name={diffIcon} size={13} color={diffColor} />
              <Text style={[s.chipText, { color: diffColor }]}>{q.difficulty}</Text>
            </View>
          </ClaySurface>
        </View>

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }],
          }}
        >
          <ClaySurface tone="default" radius={20} style={s.questionCard}>
            <Text style={s.questionText}>{q.text}</Text>
            <Text style={s.questionCaption}>Choose the option that best describes you.</Text>
          </ClaySurface>

          <View style={s.optionsWrap}>
            {opts.map((opt) => (
              <AnswerOption
                key={opt.value}
                opt={opt}
                selected={selected === opt.value}
                onSelect={() => handleSelectOption(opt.value)}
              />
            ))}
          </View>
        </Animated.View>

        <Typewriter key={current} text={MOTIVATION_LINES[current % MOTIVATION_LINES.length]} style={s.motivationText} />

        <PressableScale
          style={[s.nextBtn, selected === null && s.nextBtnDisabled]}
          scaleTo={0.95}
          onPress={handleNext}
          disabled={selected === null}
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Complete assessment' : 'Continue to next question'}
        >
          {selected === null ? (
            <Text style={[s.nextBtnText, s.nextBtnTextDisabled]}>
              {isLast ? 'Complete Assessment' : 'Continue Assessment'}
            </Text>
          ) : (
            <LinearGradient colors={[dark.neon, '#4F8CFF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.nextBtnGradient}>
              <Text style={s.nextBtnText}>{isLast ? 'Complete Assessment' : 'Continue Assessment'}</Text>
              <Pulse to={1.25} duration={550}>
                <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={16} color="#fff" />
              </Pulse>
            </LinearGradient>
          )}
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
    borderRadius: 20, overflow: 'hidden', marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  heroTop: {
    alignItems: 'center', paddingVertical: 22, paddingHorizontal: 20,
  },
  heroGlowWrap: { position: 'absolute', top: -20, alignItems: 'center', justifyContent: 'center' },
  heroIconBg: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  heroCardTitle: { fontSize: 13, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: 1.5 },

  heroBottom: { padding: 18 },
  heroBadges: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  clayBadge:  { paddingHorizontal: 12, paddingVertical: 5 },
  badgeText:      { fontSize: 12, fontWeight: '700' },
  badgeTextGreen: { color: '#065F46' },
  badgeTextBlue:  { color: dark.neon },
  heroDesc: { fontSize: 13, color: dark.textSub, lineHeight: 20, marginBottom: 14 },

  progressPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, alignSelf: 'flex-start',
  },
  progressPillText: { fontSize: 12, fontWeight: '700', color: dark.text },

  sectionLabel: { fontSize: 11, fontWeight: '800', color: dark.textSub, letterSpacing: 1.2, marginBottom: 10 },

  domainCard: { padding: 14, marginBottom: 10 },
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
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 16,
  },
  selectedDomainKicker: { fontSize: 10, fontWeight: '800', color: dark.textSub, letterSpacing: 0.6 },
  selectedDomainLabel:  { fontSize: 15, fontWeight: '800', color: '#1E1B33', marginTop: 2 },

  ageCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, marginBottom: 10 },
  ageIconBg: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ageLabel:  { fontSize: 16, fontWeight: '800', color: '#1E1B33' },
  ageMeta:   { fontSize: 12, color: dark.textSub, marginTop: 3 },

  // ── questions step ──
  heroBrainFlourish: { position: 'absolute', top: 0, right: -16, alignItems: 'center', justifyContent: 'center' },

  qTopBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, gap: 10,
  },
  timerPill:  { paddingHorizontal: 14, paddingVertical: 6 },
  timerRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timerText:  { fontSize: 13, fontWeight: '700', color: dark.neon },
  counterPill:  { paddingHorizontal: 12, paddingVertical: 6 },
  progressText: { fontSize: 13, fontWeight: '600', color: dark.textSub },

  progressTrack:   { height: 6, backgroundColor: dark.glassBorder, marginHorizontal: 20, borderRadius: 3, overflow: 'hidden' },
  progressCaption: { fontSize: 11, color: dark.textSub, marginHorizontal: 20, marginTop: 6, fontWeight: '600' },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },

  checkpointBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#D1FAE5', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12,
  },
  checkpointText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#065F46' },
  frameworkRow:   { flexDirection: 'row', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  chip:           { paddingHorizontal: 12, paddingVertical: 6 },
  chipRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipText:       { fontSize: 11, fontWeight: '700', color: dark.neon, letterSpacing: 0.3 },

  questionCard: { padding: 18, marginBottom: 16 },
  questionText: { fontSize: 17, fontWeight: '700', color: '#1E1B33', lineHeight: 26 },
  questionCaption: { fontSize: 12, color: dark.textSub, marginTop: 8 },

  optionsWrap: { gap: 12, marginBottom: 4 },
  optionCard:  { paddingVertical: 13, paddingHorizontal: 14 },
  optionRow:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 30 },
  optionNumOnSelected: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderTopColor: 'rgba(255,255,255,0.6)', borderLeftColor: 'rgba(255,255,255,0.6)',
    borderRightColor: 'rgba(255,255,255,0.15)', borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  optionNumText:         { fontSize: 13, fontWeight: '800', color: dark.textSub },
  optionNumTextSelected: { color: '#fff' },
  optionLabel:        { fontSize: 15, fontWeight: '600', color: '#1E1B33' },
  optionLabelSelected:{ color: '#fff' },
  optionHint:         { fontSize: 12, color: dark.textSub, marginTop: 2 },
  optionHintSelected: { color: 'rgba(255,255,255,0.85)' },
  optionCheck:        { position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' },

  motivationText: { fontSize: 12.5, fontWeight: '600', color: dark.textSub, textAlign: 'center', marginTop: 18, marginBottom: 4 },

  nextBtn: {
    borderRadius: 28, overflow: 'hidden', marginTop: 10,
    shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  nextBtnDisabled: { backgroundColor: dark.glassBorder, shadowOpacity: 0, paddingVertical: 16, alignItems: 'center' },
  nextBtnGradient: { paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextBtnText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
  nextBtnTextDisabled:{ color: dark.textMute },
});
