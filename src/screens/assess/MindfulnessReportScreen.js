import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ui } from '../../theme/colors';
import { BRAIN_FACTS } from '../../data/brainFacts';


function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function getTier(score) {
  if (score >= 80) return { label: 'Excellent', emoji: '🏆', color: '#4CAF50', desc: 'Outstanding mindfulness awareness. You demonstrate strong present-moment attention and non-judgmental observation.' };
  if (score >= 60) return { label: 'Good',      emoji: '⭐', color: ui.primaryBlue, desc: 'Above-average mindfulness. You have solid attentional skills with room to deepen present-moment awareness.' };
  if (score >= 40) return { label: 'Developing', emoji: '📈', color: '#FF9800', desc: 'Emerging mindfulness skills. Regular practice will significantly enhance your attention and awareness capacities.' };
  return { label: 'Beginner', emoji: '🌱', color: '#9C27B0', desc: 'Early stage of mindfulness development. This is a great starting point — consistent practice yields rapid improvement.' };
}


export default function MindfulnessReportScreen({ route, navigation }) {
  const { score = 0, timeTaken = 0, framework = '', totalQuestions = 0 } = route.params || {};
  const [factIdx, setFactIdx] = useState(0);
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

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ui.primaryBlue} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero gradient */}
        <LinearGradient colors={[ui.blueGradStart, ui.blueGradEnd]} style={s.hero}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.navigate('Main')} activeOpacity={0.7}>
            <Text style={s.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.heroLabel}>MINDFULNESS REPORT</Text>
          <Text style={s.tierEmoji}>{tier.emoji}</Text>
          <Text style={s.scoreNum}>{score}</Text>
          <Text style={s.scoreOut}>out of 100</Text>
          <View style={[s.tierBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={s.tierLabel}>{tier.label} Mindfulness</Text>
          </View>
        </LinearGradient>

        <View style={s.content}>

          {/* Tier description */}
          <View style={[s.tierCard, { borderLeftColor: tier.color }]}>
            <Text style={s.tierDesc}>{tier.desc}</Text>
          </View>

          {/* Stats row */}
          <View style={s.statsRow}>
            <View style={s.statCard}>
              <Text style={s.statVal}>{totalQuestions}</Text>
              <Text style={s.statLbl}>Questions</Text>
            </View>
            <View style={s.statCard}>
              <Text style={s.statVal}>{formatTime(timeTaken)}</Text>
              <Text style={s.statLbl}>Time Taken</Text>
            </View>
            <View style={s.statCard}>
              <Text style={[s.statVal, { color: ui.primaryBlue }]}>{score}%</Text>
              <Text style={s.statLbl}>Score</Text>
            </View>
          </View>

          {/* Framework used */}
          {framework ? (
            <View style={s.frameworkCard}>
              <Text style={s.frameworkLabel}>Framework Used</Text>
              <Text style={s.frameworkVal}>{framework}</Text>
            </View>
          ) : null}

          {/* Report placeholder */}
          <View style={s.reportPlaceholder}>
            <Text style={s.reportIcon}>📊</Text>
            <Text style={s.reportTitle}>Full Detailed Report</Text>
            <Text style={s.reportDesc}>
              Comprehensive domain-level analysis, percentile ranking, and personalised
              development recommendations will be available here.
            </Text>
            <View style={s.reportTag}>
              <Text style={s.reportTagText}>Coming from Kishore</Text>
            </View>
          </View>

          {/* Brain Facts */}
          <Text style={s.sectionTitle}>🧠 BRAIN FACTS</Text>
          <Animated.View style={[s.factCard, { opacity: fadeAnim }]}>
            <Text style={s.factIcon}>{currentFact.icon}</Text>
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
          <Text style={s.sectionTitle}>🔬 BRAIN INTELLIGENCE</Text>
          {[
            { title: 'Neuroplasticity', icon: '🔄', text: 'Your brain can rewire itself at any age. Every new skill or mindfulness practice physically changes your neural architecture.' },
            { title: 'Mindfulness & Brain Structure', icon: '🧘', text: '8 weeks of consistent mindfulness practice measurably increases the thickness of the prefrontal cortex — your planning and decision hub.' },
            { title: 'Attention as a Muscle', icon: '💪', text: 'Attention is trainable. Just like physical exercise builds muscle, mental focus exercises strengthen attentional networks in the brain.' },
            { title: 'Sleep & Memory', icon: '🌙', text: 'During deep sleep, the brain replays memories and transfers them from short-term to long-term storage — skipping sleep literally erases what you learned.' },
          ].map((card, i) => (
            <View key={i} style={s.infoCard}>
              <Text style={s.infoIcon}>{card.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.infoTitle}>{card.title}</Text>
                <Text style={s.infoText}>{card.text}</Text>
              </View>
            </View>
          ))}

          {/* Actions */}
          <TouchableOpacity
            style={s.primaryBtn}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.85}
          >
            <Text style={s.primaryBtnText}>Go to Dashboard →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => navigation.replace('MindfulnessAssess')}
            activeOpacity={0.85}
          >
            <Text style={s.secondaryBtnText}>Retake Assessment</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: ui.offWhite },

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
  heroLabel:  { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, marginBottom: 16 },
  tierEmoji:  { fontSize: 48, marginBottom: 8 },
  scoreNum:   { fontSize: 64, fontWeight: '900', color: '#FFD94A', lineHeight: 72 },
  scoreOut:   { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 14 },
  tierBadge:  { borderRadius: 20, paddingHorizontal: 18, paddingVertical: 8 },
  tierLabel:  { fontSize: 14, fontWeight: '700', color: '#fff' },

  content:    { padding: 20, paddingTop: 20 },

  tierCard: {
    backgroundColor: ui.white, borderRadius: 14, padding: 16,
    borderLeftWidth: 4, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  tierDesc: { fontSize: 13, color: ui.midText, lineHeight: 20 },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  statCard: {
    flex: 1, backgroundColor: ui.white, borderRadius: 14, padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statVal: { fontSize: 16, fontWeight: '800', color: ui.darkText, marginBottom: 4 },
  statLbl: { fontSize: 10, color: ui.midText, fontWeight: '600' },

  frameworkCard: {
    backgroundColor: ui.white, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  frameworkLabel: { fontSize: 12, color: ui.midText, fontWeight: '600' },
  frameworkVal:   { fontSize: 13, fontWeight: '800', color: ui.darkText },

  reportPlaceholder: {
    backgroundColor: ui.white, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 20, borderWidth: 1.5, borderStyle: 'dashed', borderColor: ui.borderGray,
  },
  reportIcon:  { fontSize: 32, marginBottom: 10 },
  reportTitle: { fontSize: 15, fontWeight: '800', color: ui.darkText, marginBottom: 8 },
  reportDesc:  { fontSize: 13, color: ui.midText, lineHeight: 20, textAlign: 'center', marginBottom: 12 },
  reportTag:   { backgroundColor: ui.challengeBg, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  reportTagText: { fontSize: 12, fontWeight: '700', color: ui.primaryBlue },

  sectionTitle: { fontSize: 11, fontWeight: '800', color: ui.midText, letterSpacing: 1.2, marginBottom: 12, marginTop: 8 },

  factCard: {
    backgroundColor: ui.primaryBlue, borderRadius: 18, padding: 20,
    alignItems: 'center',
    shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
  },
  factIcon: { fontSize: 36, marginBottom: 12 },
  factText: { fontSize: 14, color: '#fff', lineHeight: 22, textAlign: 'center', fontWeight: '500' },
  factNav:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, marginVertical: 12 },
  factNavBtn:  { backgroundColor: ui.white, borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ui.borderGray },
  factNavArrow:{ fontSize: 22, fontWeight: '700', color: ui.primaryBlue, lineHeight: 26 },
  factCounter: { fontSize: 13, fontWeight: '600', color: ui.midText, minWidth: 48, textAlign: 'center' },

  infoCard: {
    backgroundColor: ui.white, borderRadius: 14, padding: 16,
    flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  infoIcon:  { fontSize: 28, marginTop: 2 },
  infoTitle: { fontSize: 14, fontWeight: '800', color: ui.darkText, marginBottom: 6 },
  infoText:  { fontSize: 12, color: ui.midText, lineHeight: 18 },

  primaryBtn: {
    backgroundColor: ui.primaryBlue, borderRadius: 28, paddingVertical: 16,
    alignItems: 'center', marginTop: 20,
    shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  secondaryBtn: {
    backgroundColor: ui.white, borderRadius: 28, paddingVertical: 14,
    alignItems: 'center', marginTop: 10, borderWidth: 1.5, borderColor: ui.borderGray,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '700', color: ui.midText },
});
