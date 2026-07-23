import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, ui, dark } from '../../theme/colors';
import { calcHII } from '../../utils/scoreEngine';
import { storage } from '../../utils/storage';
import { auth } from '../../firebase/config';
import { savePhase4ToCloud } from '../../firebase/firestore';

const INTERVIEW_QUESTIONS = [
  { domain: 'Attention',      q: 'Describe a time when you had to maintain focus on a tedious task. What strategies did you use?' },
  { domain: 'Memory',         q: 'How do you retain complex information when studying or working on a project?' },
  { domain: 'Processing',     q: 'Tell me about a situation where you had to quickly understand and act on large amounts of information.' },
  { domain: 'Reasoning',      q: 'Walk me through how you approach a complex problem that you\'ve never encountered before.' },
  { domain: 'Decision',       q: 'Describe a difficult decision you made under time pressure. What was your process?' },
  { domain: 'Emotional',      q: 'How do you manage your emotions when facing unexpected setbacks or criticism?' },
  { domain: 'Social',         q: 'Share an example of a creative solution you developed that others hadn\'t considered.' },
  { domain: 'Metacognitive',  q: 'How do you know when you truly understand something versus when you only think you understand it?' },
];

const RATING_LABELS = ['Poor', 'Below Avg', 'Average', 'Good', 'Excellent'];

export default function Phase4InterviewScreen({ route, navigation }) {
  const { scores } = route.params;
  const [current, setCurrent]   = useState(0);
  const [ratings, setRatings]   = useState(Array(8).fill(0));
  const q = INTERVIEW_QUESTIONS[current];

  function handleExit() {
    Alert.alert(
      'Exit Interview?',
      'Your progress will not be saved. You can view your current results instead.',
      [
        { text: 'Continue', style: 'cancel' },
        { text: 'Exit to Report', style: 'destructive', onPress: () => navigation.replace('FinalReport', { scores }) },
      ]
    );
  }

  function handleRate(val) {
    const nr = [...ratings]; nr[current] = val; setRatings(nr);
  }

  async function handleNext() {
    if (ratings[current] === 0) return;
    if (current + 1 >= INTERVIEW_QUESTIONS.length) {
      const phase4Marks = Math.round(ratings.reduce((s, v) => s + (v / 5) * 2.5, 0));
      await storage.savePhase4Marks(phase4Marks);
      if (auth.currentUser) {
        savePhase4ToCloud(auth.currentUser.uid, phase4Marks).catch(() => {});
      }
      const hii = calcHII(scores.phase2.marks, scores.phase3.marks, phase4Marks);
      const finalScores = { ...scores, phase4Marks, hii };
      await storage.saveScores(finalScores);
      navigation.replace('FinalReport', { scores: finalScores });
    } else {
      setCurrent(c => c + 1);
    }
  }

  const progress = (current + 1) / INTERVIEW_QUESTIONS.length;
  const canNext  = ratings[current] > 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleExit} activeOpacity={0.7}>
          <Text style={styles.exitBtn}>✕ Exit</Text>
        </TouchableOpacity>
        <View style={styles.phaseBadge}>
          <Text style={styles.phaseText}>PHASE 4 INTERVIEW</Text>
        </View>
        <Text style={styles.progress}>{current + 1} / {INTERVIEW_QUESTIONS.length}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.domainBadge}>
          <Text style={styles.domainText}>{q.domain} Intelligence</Text>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.interviewerLabel}>Interviewer asks:</Text>
          <Text style={styles.questionText}>{q.q}</Text>
        </View>

        <View style={styles.videoArea}>
          <View style={styles.videoFace}>
            <MaterialCommunityIcons name="account" size={44} color="#fff" style={styles.videoFaceEmoji} />
            <Text style={styles.videoFaceName}>Your Response</Text>
          </View>
          <View style={styles.videoBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>RESPONDING</Text>
          </View>
        </View>

        <Text style={styles.tipsTitle}>Response Tips</Text>
        <Text style={styles.tipsText}>• Use specific examples (STAR method){'\n'}• Be concise but detailed{'\n'}• Show self-awareness and reflection</Text>

        <Text style={styles.rateLabel}>Rate your own response:</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map(v => (
            <TouchableOpacity
              key={v}
              style={[styles.ratingBtn, ratings[current] === v && styles.ratingSelected]}
              onPress={() => handleRate(v)}
              activeOpacity={0.8}
            >
              <Text style={[styles.ratingNum, ratings[current] === v && styles.ratingNumSelected]}>{v}</Text>
              <Text style={[styles.ratingLbl, ratings[current] === v && styles.ratingLblSelected]}>{RATING_LABELS[v - 1]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.nextBtn, !canNext && styles.nextDisabled]} onPress={handleNext} activeOpacity={0.8} disabled={!canNext}>
          <Text style={[styles.nextText, !canNext && styles.nextTextDisabled]}>
            {current + 1 < INTERVIEW_QUESTIONS.length ? 'Next Question →' : 'Complete Interview →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: dark.bgSolid },
  topBar:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  exitBtn: { color: '#F44336', fontWeight: '700', fontSize: 13 },
  phaseBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: dark.glass, borderWidth: 1, borderColor: dark.neon + '60' },
  phaseText:  { color: dark.neon, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  progress:   { color: dark.textSub, fontWeight: '700', fontSize: 13 },
  progressTrack: { height: 4, backgroundColor: dark.glassBorder, marginHorizontal: 20, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  progressFill:  { height: '100%', backgroundColor: dark.neon, borderRadius: 2 },
  content:    { padding: 20, paddingBottom: 40 },
  domainBadge:{ alignSelf: 'flex-start', backgroundColor: dark.glass, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: dark.glassBorder, marginBottom: 12 },
  domainText: { color: dark.neon, fontSize: 12, fontWeight: '700' },
  questionCard: { backgroundColor: dark.glass, borderRadius: 16, padding: 18, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: dark.neon, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  interviewerLabel: { color: dark.neon, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  questionText:     { color: dark.text, fontSize: 15, lineHeight: 24, fontWeight: '500' },
  videoArea:  { backgroundColor: dark.glass, borderRadius: 16, height: 150, marginBottom: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: dark.glassBorder },
  videoFace:  { alignItems: 'center' },
  videoFaceEmoji: {},
  videoFaceName:  { color: dark.textSub, fontSize: 12, marginTop: 6 },
  videoBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.danger + '18', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  recDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger },
  recText:    { color: colors.danger, fontSize: 10, fontWeight: '800' },
  tipsTitle:  { fontSize: 13, fontWeight: '700', color: dark.neon, marginBottom: 6 },
  tipsText:   { fontSize: 12, color: dark.textSub, lineHeight: 20, marginBottom: 20 },
  rateLabel:  { fontSize: 13, color: dark.textSub, fontWeight: '700', marginBottom: 12 },
  ratingRow:  { flexDirection: 'row', gap: 8, marginBottom: 24 },
  ratingBtn:  { flex: 1, backgroundColor: dark.glass, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: dark.glassBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  ratingSelected:  { borderColor: dark.neon, backgroundColor: dark.glass },
  ratingNum:       { fontSize: 18, fontWeight: '800', color: dark.textSub },
  ratingNumSelected: { color: dark.neon },
  ratingLbl:         { fontSize: 9, color: dark.textMute, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  ratingLblSelected: { color: dark.neon },
  nextBtn:      { backgroundColor: dark.neon, borderRadius: 28, paddingVertical: 16, alignItems: 'center', shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  nextDisabled: { backgroundColor: dark.glassBorder, shadowOpacity: 0 },
  nextText:     { fontSize: 15, fontWeight: '700', color: '#fff' },
  nextTextDisabled: { color: dark.textMute },
});
