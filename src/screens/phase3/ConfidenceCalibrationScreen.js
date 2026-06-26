import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar, Alert } from 'react-native';
import { colors, ui } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';
import {
  calcPhase2Score, calcPhase3Score, calcCombinedScore,
  calcCIS, calcGPS, calcDomainPercents, calcLabReadiness, calcHII,
} from '../../utils/scoreEngine';
import { storage } from '../../utils/storage';
import { saveScoresToCloud } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const QUESTIONS = [
  { q: 'The human brain uses about 20% of the body\'s total energy despite being only 2% of body weight.', options: ['True', 'False'], correct: 0 },
  { q: 'Working memory and long-term memory are stored in exactly the same brain region.', options: ['True', 'False'], correct: 1 },
  { q: 'Cognitive biases always reduce the quality of our decisions.', options: ['True', 'False'], correct: 1 },
  { q: 'The prefrontal cortex is primarily involved in executive function and decision-making.', options: ['True', 'False'], correct: 0 },
  { q: 'Metacognition means "thinking about thinking."', options: ['True', 'False'], correct: 0 },
];

export default function ConfidenceCalibrationScreen({ route, navigation }) {
  const { phase2Answers, taskScores, taskIndex } = route.params;
  const [current, setCurrent]             = useState(0);
  const [answerPicked, setAnswerPicked]   = useState(null);
  const [confidence, setConfidence]       = useState(null);
  const [score, setScore]                 = useState(0);
  const [calibrationScore, setCalibrationScore] = useState(0);
  const { currentUser } = useAuth();

  function handleBack() {
    Alert.alert(
      'Exit Assessment?',
      'Your cognitive task progress will not be saved if you exit now.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Main') },
      ]
    );
  }

  const q = QUESTIONS[current];

  function handleNext() {
    if (answerPicked === null || confidence === null) return;
    const correct = answerPicked === q.correct;
    if (correct) setScore(s => s + 1);
    const confLevel = confidence;
    if (correct && confLevel === 3) setCalibrationScore(s => s + 2);
    else if (correct && confLevel === 2) setCalibrationScore(s => s + 1);
    else if (!correct && confLevel === 3) setCalibrationScore(s => s - 1);

    if (current + 1 >= QUESTIONS.length) {
      handleComplete(correct, confLevel);
    } else {
      setCurrent(c => c + 1);
      setAnswerPicked(null);
      setConfidence(null);
    }
  }

  async function handleComplete(lastCorrect, lastConf) {
    const finalScore = Math.min(5, Math.round(((score + (lastCorrect ? 1 : 0)) / QUESTIONS.length) * 5));
    const newScores = [...taskScores, finalScore];
    const p2 = calcPhase2Score(phase2Answers || Array(40).fill(3));
    const p3 = calcPhase3Score(newScores);
    const combined = calcCombinedScore(p2.marks, p3.marks);
    const cis = calcCIS(combined.percent);
    const gps = calcGPS(cis);
    const domainPcts = calcDomainPercents(phase2Answers || Array(40).fill(3), newScores);
    const labReadiness = calcLabReadiness(domainPcts);
    const hii = calcHII(p2.marks, p3.marks);
    const scores = { phase2: p2, phase3: p3, combined, cis, gps, domainPercents: domainPcts, labReadiness, hii };
    await storage.saveScores(scores);
    await storage.savePhase3Scores(newScores, 8);
    if (currentUser) {
      saveScoresToCloud(currentUser.uid, scores).catch(() => {});
    }
    if (combined.isHighPerformance) navigation.replace('HighPerformance', { scores });
    else navigation.replace('DevelopmentPathway', { scores });
  }

  const canNext = answerPicked !== null && confidence !== null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />
      <PhaseHeader phase={3} title="Confidence Calibration" subtitle={`Metacognitive · ${current + 1}/${QUESTIONS.length}`} progress={(taskIndex + 1) / 8} onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qCard}>
          <Text style={styles.qLabel}>STATEMENT</Text>
          <Text style={styles.qText}>{q.q}</Text>
        </View>

        <Text style={styles.sectionLabel}>Is this statement True or False?</Text>
        <View style={styles.answerRow}>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.answerBtn, answerPicked === i && styles.answerSelected]}
              onPress={() => setAnswerPicked(i)}
              activeOpacity={0.8}
            >
              <Text style={[styles.answerText, answerPicked === i && styles.answerTextSelected]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>How confident are you?</Text>
        <View style={styles.confRow}>
          {[
            { val: 1, label: 'Guessing',   color: colors.danger  },
            { val: 2, label: 'Fairly Sure', color: colors.warning },
            { val: 3, label: 'Very Sure',   color: colors.success },
          ].map(c => (
            <TouchableOpacity
              key={c.val}
              style={[styles.confBtn, confidence === c.val && { borderColor: c.color, backgroundColor: c.color + '18' }]}
              onPress={() => setConfidence(c.val)}
              activeOpacity={0.8}
            >
              <Text style={[styles.confText, confidence === c.val && { color: c.color, fontWeight: '800' }]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.nextBtn, !canNext && styles.nextDisabled]}
          onPress={handleNext}
          activeOpacity={0.8}
          disabled={!canNext}
        >
          <Text style={[styles.nextText, !canNext && styles.nextTextDisabled]}>
            {current + 1 < QUESTIONS.length ? 'Next Question →' : 'Complete Assessment →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: ui.offWhite },
  content: { padding: 20, paddingBottom: 40 },
  qCard: {
    backgroundColor: ui.white, borderRadius: 16, padding: 18, marginBottom: 20,
    borderLeftWidth: 3, borderLeftColor: ui.primaryBlue,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  qLabel:      { color: ui.primaryBlue, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  qText:       { fontSize: 15, color: ui.darkText, lineHeight: 22, fontWeight: '500' },
  sectionLabel:{ fontSize: 12, color: ui.midText, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  answerRow:   { flexDirection: 'row', gap: 12, marginBottom: 24 },
  answerBtn: {
    flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center',
    backgroundColor: ui.white, borderWidth: 1.5, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  answerSelected:     { borderColor: ui.primaryBlue, backgroundColor: ui.challengeBg },
  answerText:         { color: ui.darkText, fontWeight: '700', fontSize: 16 },
  answerTextSelected: { color: ui.primaryBlue },
  confRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  confBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    backgroundColor: ui.white, borderWidth: 1.5, borderColor: ui.borderGray,
  },
  confText: { color: ui.midText, fontWeight: '600', fontSize: 13 },
  nextBtn: {
    backgroundColor: ui.primaryBlue, borderRadius: 28, paddingVertical: 16, alignItems: 'center',
    shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  nextDisabled:     { backgroundColor: ui.borderGray, shadowOpacity: 0 },
  nextText:         { fontSize: 16, fontWeight: '700', color: '#fff' },
  nextTextDisabled: { color: ui.lightText },
});
