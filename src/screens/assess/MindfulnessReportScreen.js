import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { PressableScale, FadeInUp, CountUp, PopIn } from '../../components/anim';
import { ui, dark } from '../../theme/colors';
import Icon from '../../components/Icon';
import { RingStat } from '../../components/VisualKit';
import { BRAIN_FACTS } from '../../data/brainFacts';
import { rf } from '../../utils/responsive';
import { storage } from '../../utils/storage';
import { auth } from '../../firebase/config';
import { saveReflectionsToCloud } from '../../firebase/firestore';

const REFLECTION_CHOICES = [
  { icon: 'lightbulb-outline',      label: 'An insight surprised me' },
  { icon: 'check-circle-outline',   label: 'Matched how I see myself' },
  { icon: 'trending-up',            label: 'I know what to improve' },
  { icon: 'head-question-outline',  label: 'Left me curious for more' },
];


function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function getTier(score) {
  if (score >= 80) return { label: 'Excellent', icon: 'trophy-outline', color: '#4CAF50', desc: 'Outstanding mindfulness awareness. You demonstrate strong present-moment attention and non-judgmental observation.' };
  if (score >= 60) return { label: 'Good',      icon: 'star-outline', color: dark.neon, desc: 'Above-average mindfulness. You have solid attentional skills with room to deepen present-moment awareness.' };
  if (score >= 40) return { label: 'Developing', icon: 'trending-up', color: '#FF9800', desc: 'Emerging mindfulness skills. Regular practice will significantly enhance your attention and awareness capacities.' };
  return { label: 'Beginner', icon: 'sprout-outline', color: '#9C27B0', desc: 'Early stage of mindfulness development. This is a great starting point — consistent practice yields rapid improvement.' };
}


export default function MindfulnessReportScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const {
    score = 0, band = null, timeTaken = 0, framework = '', totalQuestions = 0,
    domainNum = null, domainLabel = '', domainIcon = '', ageLabel = '', domainsDone = 0,
  } = route.params || {};
  const [factIdx, setFactIdx] = useState(0);
  const [reflected, setReflected] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const tier = getTier(score);

  useEffect(() => {
    const shuffled = [...BRAIN_FACTS].sort(() => Math.random() - 0.5);
    // rotate fact every 8 seconds
    const id = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setFactIdx(i => (i + 1) % BRAIN_FACTS.length);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const currentFact = BRAIN_FACTS[factIdx];

  async function handleReflection(choice) {
    setReflected(choice);
    const list = await storage.addReflection({ domainNum, domainLabel, score, choice });
    if (auth.currentUser) saveReflectionsToCloud(auth.currentUser.uid, list).catch(() => {});
  }

  return (
    <SafeAreaView edges={['bottom']} style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={dark.neon} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero gradient */}
        <LinearGradient colors={[ui.blueGradStart, ui.blueGradEnd]} style={[s.hero, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('Main')} activeOpacity={0.7}>
            <Text style={s.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.heroLabel}>
            {domainNum ? `DOMAIN ${domainNum} OF 8 · REPORT` : 'MINDFULNESS REPORT'}
          </Text>
          {domainLabel ? (
            <View style={s.domainPill}>
              {domainIcon ? <Icon name={domainIcon} size={13} color="#fff" /> : null}
              <Text style={s.domainPillText}>{domainLabel}</Text>
            </View>
          ) : null}
          <PopIn delay={250} style={s.tierIcon}>
            <RingStat
              percent={score} size={148} stroke={12}
              color="#FFD94A" color2="#FFFFFF"
              trackColor="rgba(255,255,255,0.2)"
            >
              <Icon name={tier.icon} size={28} color="#fff" />
              <Text style={s.scoreNum}>{score}</Text>
              <Text style={s.scoreUnit}>out of 100</Text>
            </RingStat>
          </PopIn>
          <PopIn delay={900}>
            <View style={[s.tierBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={s.tierLabel}>{tier.label} Mindfulness</Text>
            </View>
          </PopIn>
        </LinearGradient>

        <View style={s.content}>

          {/* Tier description */}
          <FadeInUp delay={150}>
          <View style={[s.tierCard, { borderLeftColor: tier.color }]}>
            <Text style={s.tierDesc}>{tier.desc}</Text>
          </View>
          </FadeInUp>

          {/* Stats row */}
          <FadeInUp delay={300} style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statVal}>{totalQuestions}</Text>
              <Text style={s.statLbl}>Questions</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statVal}>{formatTime(timeTaken)}</Text>
              <Text style={s.statLbl}>Time Taken</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statVal, { color: dark.neon }]}>{score}%</Text>
              <Text style={s.statLbl}>Score</Text>
            </View>
          </FadeInUp>

          {/* Framework used */}
          {framework ? (
            <View style={s.frameworkCard}>
              <Text style={s.frameworkLabel}>Framework Used</Text>
              <Text style={s.frameworkVal}>{framework}</Text>
            </View>
          ) : null}

          {/* Expression band (C-OMM intensity scale) */}
          {band ? (
            <View style={s.frameworkCard}>
              <Text style={s.frameworkLabel}>Expression Level</Text>
              <Text style={s.frameworkVal}>{band}</Text>
            </View>
          ) : null}

          {/* Age group */}
          {ageLabel ? (
            <View style={s.frameworkCard}>
              <Text style={s.frameworkLabel}>Age Group</Text>
              <Text style={s.frameworkVal}>{ageLabel} years</Text>
            </View>
          ) : null}

          {/* Domain progress */}
          {domainNum ? (
            <View style={s.frameworkCard}>
              <Text style={s.frameworkLabel}>Domains Completed</Text>
              <Text style={s.frameworkVal}>{domainsDone} / 8</Text>
            </View>
          ) : null}

          {/* Report placeholder */}
          <View style={s.reportPlaceholder}>
            <MaterialCommunityIcons name="chart-box-outline" size={32} color={dark.neon} style={s.reportIcon} />
            <Text style={s.reportTitle}>Full Detailed Report</Text>
            <Text style={s.reportDesc}>
              Comprehensive domain-level analysis, percentile ranking, and personalised
              development recommendations will be available here.
            </Text>
            <View style={s.reportTag}>
              <Text style={s.reportTagText}>Coming from Kishore</Text>
            </View>
          </View>

          {/* Quick reflection */}
          <Text style={s.sectionTitle}>QUICK REFLECTION</Text>
          <View style={s.reflectCard}>
            {reflected ? (
              <View style={s.reflectDone}>
                <MaterialCommunityIcons name="notebook-check-outline" size={22} color="#059669" />
                <Text style={s.reflectDoneText}>Noted in your journey — reflections sharpen self-insight.</Text>
              </View>
            ) : (
              <>
                <Text style={s.reflectQ}>How did this assessment land for you?</Text>
                <View style={s.reflectWrap}>
                  {REFLECTION_CHOICES.map(c => (
                    <TouchableOpacity key={c.label} style={s.reflectChip} onPress={() => handleReflection(c.label)} activeOpacity={0.75}>
                      <Icon name={c.icon} size={14} color={dark.neon} />
                      <Text style={s.reflectChipText}>{c.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Brain Facts */}
          <Text style={s.sectionTitle}>BRAIN FACTS</Text>
          <Animated.View style={[s.factCard, { opacity: fadeAnim }]}>
            <Icon name={currentFact.icon} size={36} color={dark.neon} style={s.factIcon} />
            <Text style={s.factText}>{currentFact.fact}</Text>
          </Animated.View>
          <View style={s.factNav}>
            <TouchableOpacity style={s.factNavBtn} onPress={() => setFactIdx(i => (i - 1 + BRAIN_FACTS.length) % BRAIN_FACTS.length)}>
              <Text style={s.factNavArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={s.factCounter}>{factIdx + 1} / {BRAIN_FACTS.length}</Text>
            <TouchableOpacity style={s.factNavBtn} onPress={() => setFactIdx(i => (i + 1) % BRAIN_FACTS.length)}>
              <Text style={s.factNavArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Brain info cards */}
          <Text style={s.sectionTitle}>BRAIN INTELLIGENCE</Text>
          {[
            { title: 'Neuroplasticity', icon: 'sync', text: 'Your brain can rewire itself at any age. Every new skill or mindfulness practice physically changes your neural architecture.' },
            { title: 'Mindfulness & Brain Structure', icon: 'meditation', text: '8 weeks of consistent mindfulness practice measurably increases the thickness of the prefrontal cortex — your planning and decision hub.' },
            { title: 'Attention as a Muscle', icon: 'arm-flex-outline', text: 'Attention is trainable. Just like physical exercise builds muscle, mental focus exercises strengthen attentional networks in the brain.' },
            { title: 'Sleep & Memory', icon: 'weather-night', text: 'During deep sleep, the brain replays memories and transfers them from short-term to long-term storage — skipping sleep literally erases what you learned.' },
          ].map((card, i) => (
            <View key={i} style={s.infoCard}>
              <Icon name={card.icon} size={26} color={dark.neon} style={s.infoIcon} />
              <View style={{ flex: 1 }}>
                <Text style={s.infoTitle}>{card.title}</Text>
                <Text style={s.infoText}>{card.text}</Text>
              </View>
            </View>
          ))}

          {/* Actions */}
          {domainsDone < 8 ? (
            <PressableScale
              style={s.primaryBtn}
              scaleTo={0.95}
              onPress={() => navigation.replace('MindfulnessAssess')}
            >
              <Text style={s.primaryBtnText}>Next Domain →</Text>
            </PressableScale>
          ) : (
            <PressableScale
              style={s.primaryBtn}
              scaleTo={0.95}
              onPress={() => navigation.navigate('Main')}
            >
              <Text style={s.primaryBtnText}>Go to Dashboard →</Text>
            </PressableScale>
          )}

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => domainsDone < 8
              ? navigation.navigate('Main')
              : navigation.replace('MindfulnessAssess')}
            activeOpacity={0.85}
          >
            <Text style={s.secondaryBtnText}>
              {domainsDone < 8 ? 'Go to Dashboard' : 'Retake a Domain'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: dark.bgSolid },

  hero: {
    padding: 32, paddingTop: 54, paddingBottom: 36,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute', top: 54, left: 20,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
  },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  heroLabel:  { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: 12 },
  domainPill: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginBottom: 14,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  domainPillText: { fontSize: 13, fontWeight: '700', color: '#1E1B33' },
  tierIcon:   { marginBottom: 8 },
  scoreNum:   { fontSize: rf(34), fontWeight: '900', color: '#1E1B33', lineHeight: rf(38), marginTop: 2 },
  scoreUnit:  { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5 },
  scoreOut:   { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 14 },
  tierBadge:  { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  tierLabel:  { fontSize: 14, fontWeight: '700', color: '#1E1B33' },

  content:    { padding: 20, paddingTop: 20 },

  tierCard: {
    backgroundColor: dark.glass, borderRadius: 14, padding: 16,
    borderLeftWidth: 4, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  tierDesc: { fontSize: 13, color: dark.textSub, lineHeight: 20 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: dark.glass, borderRadius: 14, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statVal: { fontSize: 16, fontWeight: '800', color: '#1E1B33', marginBottom: 4 },
  statLbl: { fontSize: 10, color: dark.textSub, fontWeight: '600' },

  frameworkCard: {
    backgroundColor: dark.glass, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  frameworkLabel: { fontSize: 12, color: dark.textSub, fontWeight: '600' },
  frameworkVal:   { fontSize: 13, fontWeight: '800', color: '#1E1B33' },

  reportPlaceholder: {
    backgroundColor: dark.glass, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderStyle: 'dashed', borderColor: dark.glassBorder,
  },
  reportIcon:  { marginBottom: 10 },
  reportTitle: { fontSize: 15, fontWeight: '800', color: '#1E1B33', marginBottom: 8 },
  reportDesc:  { fontSize: 13, color: dark.textSub, lineHeight: 20, textAlign: 'center', marginBottom: 12 },
  reportTag:   { backgroundColor: dark.glass, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  reportTagText: { fontSize: 12, fontWeight: '700', color: dark.neon },

  sectionTitle: { fontSize: 11, fontWeight: '800', color: dark.textSub, letterSpacing: 1.2, marginBottom: 12, marginTop: 8 },

  factCard: {
    backgroundColor: dark.neon, borderRadius: 18, padding: 20,
    alignItems: 'center',
    shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  factIcon: { marginBottom: 12 },

  reflectCard: {
    backgroundColor: dark.glass, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: dark.glassBorder, marginBottom: 4,
  },
  reflectQ:    { fontSize: 13.5, fontWeight: '700', color: '#1E1B33', marginBottom: 12 },
  reflectWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reflectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: dark.glass, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  reflectChipText: { fontSize: 12, fontWeight: '700', color: dark.neon },
  reflectDone:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reflectDoneText: { flex: 1, fontSize: 13, color: dark.textSub, lineHeight: 18 },
  factText: { fontSize: 14, color: '#1E1B33', lineHeight: 22, textAlign: 'center', fontWeight: '500' },
  factNav:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginVertical: 12 },
  factNavBtn:  { backgroundColor: dark.glass, borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: dark.glassBorder },
  factNavArrow:{ fontSize: 22, fontWeight: '700', color: dark.neon, lineHeight: 26 },
  factCounter: { fontSize: 13, fontWeight: '600', color: dark.textSub, minWidth: 48, textAlign: 'center' },

  infoCard: {
    backgroundColor: dark.glass, borderRadius: 14, padding: 16,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  infoIcon:  { marginTop: 2 },
  infoTitle: { fontSize: 14, fontWeight: '800', color: '#1E1B33', marginBottom: 6 },
  infoText:  { fontSize: 12, color: dark.textSub, lineHeight: 18 },

  primaryBtn: {
    backgroundColor: dark.neon, borderRadius: 28, paddingVertical: 16,
    alignItems: 'center', marginTop: 20,
    shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  secondaryBtn: {
    backgroundColor: dark.glass, borderRadius: 28, paddingVertical: 14,
    alignItems: 'center', marginTop: 10, borderWidth: 1.5, borderColor: dark.glassBorder,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: dark.textSub },
});
