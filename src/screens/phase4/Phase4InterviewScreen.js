import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { colors, ui } from '../../theme/colors';
import { calcHII } from '../../utils/scoreEngine';
import { storage } from '../../utils/storage';

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

  function handleRate(val) {
    const nr = [...ratings]; nr[current] = val; setRatings(nr);
  }

  async function handleNext() {
    if (ratings[current] === 0) return;
    if (current + 1 >= INTERVIEW_QUESTIONS.length) {
      const phase4Marks = Math.round(ratings.reduce((s, v) => s + (v / 5) * 2.5, 0));
      await storage.savePhase4Marks(phase4Marks);
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
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />

      <View style={styles.topBar}>
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
            <Text style={styles.videoFaceEmoji}>👤</Text>
            <Text style={styles.videoFaceName}>Your Response</Text>
          </View>
          <View style={styles.videoBadge}>
            <View style={styles.recDot} />
            <Text style={styles.recText}>RESPONDING</Text>
          </View>
        </View>

        <Text style={styles.tipsTitle}>💡 Response Tips</Text>
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
  safe:    { flex: 1, backgroundColor: ui.offWhite },
  topBar:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  phaseBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: ui.challengeBg, borderWidth: 1, borderColor: ui.primaryBlue + '60' },
  phaseText:  { color: ui.primaryBlue, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  progress:   { color: ui.midText, fontWeight: '700', fontSize: 13 },
  progressTrack: { height: 4, backgroundColor: ui.borderGray, marginHorizontal: 20, borderRadius: 2, overflow: 'hidden', marginBottom: 10 },
  progressFill:  { height: '100%', backgroundColor: ui.primaryBlue, borderRadius: 2 },
  content:    { padding: 20, paddingBottom: 40 },
  domainBadge:{ alignSelf: 'flex-start', backgroundColor: ui.inputBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: ui.borderGray, marginBottom: 12 },
  domainText: { color: ui.primaryBlue, fontSize: 12, fontWeight: '700' },
  questionCard: { backgroundColor: ui.white, borderRadius: 16, padding: 18, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: ui.primaryBlue, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  interviewerLabel: { color: ui.primaryBlue, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  questionText:     { color: ui.darkText, fontSize: 15, lineHeight: 24, fontWeight: '500' },
  videoArea:  { backgroundColor: ui.inputBg, borderRadius: 16, height: 150, marginBottom: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ui.borderGray },
  videoFace:  { alignItems: 'center' },
  videoFaceEmoji: { fontSize: 44 },
  videoFaceName:  { color: ui.midText, fontSize: 12, marginTop: 6 },
  videoBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.danger + '18', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  recDot:     { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.danger },
  recText:    { color: colors.danger, fontSize: 10, fontWeight: '800' },
  tipsTitle:  { fontSize: 13, fontWeight: '700', color: ui.primaryBlue, marginBottom: 6 },
  tipsText:   { fontSize: 12, color: ui.midText, lineHeight: 20, marginBottom: 20 },
  rateLabel:  { fontSize: 13, color: ui.midText, fontWeight: '700', marginBottom: 12 },
  ratingRow:  { flexDirection: 'row', gap: 8, marginBottom: 24 },
  ratingBtn:  { flex: 1, backgroundColor: ui.white, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: ui.borderGray, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  ratingSelected:  { borderColor: ui.primaryBlue, backgroundColor: ui.challengeBg },
  ratingNum:       { fontSize: 18, fontWeight: '800', color: ui.midText },
  ratingNumSelected: { color: ui.primaryBlue },
  ratingLbl:         { fontSize: 9, color: ui.lightText, marginTop: 2, fontWeight: '600', textAlign: 'center' },
  ratingLblSelected: { color: ui.primaryBlue },
  nextBtn:      { backgroundColor: ui.primaryBlue, borderRadius: 28, paddingVertical: 16, alignItems: 'center', shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  nextDisabled: { backgroundColor: ui.borderGray, shadowOpacity: 0 },
  nextText:     { fontSize: 15, fontWeight: '700', color: '#fff' },
  nextTextDisabled: { color: ui.lightText },
});
