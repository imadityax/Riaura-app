import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, ui, dark } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';
import {
  calcPhase2Score, calcPhase3Score, calcCombinedScore,
  calcCIS, calcGPS, calcDomainPercents, calcLabReadiness, calcHII,
} from '../../utils/scoreEngine';
import { storage } from '../../utils/storage';
import { saveScoresToCloud } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import NeuralLinesBg from '../../components/NeuralLinesBg';
import { Ionicons } from '@expo/vector-icons';
import { ClayCard } from '../../components/Clay';

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
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <NeuralLinesBg />
      <StatusBar barStyle="dark-content" />
      <PhaseHeader phase={3} title="Confidence Calibration" subtitle={`Metacognitive · ${current + 1}/${QUESTIONS.length}`} progress={(taskIndex + 1) / 8} onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qCard}>
          <Text style={styles.qLabel}>STATEMENT</Text>
          <Text style={styles.qText}>{q.q}</Text>
        </View>

        <Text style={styles.sectionLabel}>Is this statement True or False?</Text>
        <View style={styles.answerRow}>
          {q.options.map((opt, i) => (
            <ClayCard
              key={i}
              tone={answerPicked === i ? 'selected' : 'default'}
              radius={16}
              style={styles.answerBtn}
              onPress={() => setAnswerPicked(i)}
            >
              <Ionicons
                name={opt === 'True' ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={answerPicked === i ? '#fff' : dark.textSub}
              />
              <Text style={[styles.answerText, answerPicked === i && styles.answerTextSelected]}>{opt}</Text>
            </ClayCard>
          ))}
        </View>

        <Text style={styles.sectionLabel}>How confident are you?</Text>
        <View style={styles.confRow}>
          {[
            { val: 1, label: 'Guessing',    icon: 'help-circle-outline', color: colors.danger  },
            { val: 2, label: 'Fairly Sure', icon: 'eye-outline',         color: colors.warning },
            { val: 3, label: 'Very Sure',   icon: 'flash-outline',       color: colors.success },
          ].map(c => {
            const isSel = confidence === c.val;
            return (
              <ClayCard
                key={c.val}
                tone="default"
                radius={16}
                style={[styles.confBtn, isSel && { backgroundColor: c.color + '20', borderRightColor: c.color + '55', borderBottomColor: c.color + '55' }]}
                onPress={() => setConfidence(c.val)}
              >
                <Ionicons name={c.icon} size={18} color={isSel ? c.color : dark.textSub} />
                <Text style={[styles.confText, isSel && { color: c.color, fontWeight: '800' }]}>{c.label}</Text>
              </ClayCard>
            );
          })}
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
  safe:    { flex: 1, backgroundColor: dark.bgSolid },
  content: { padding: 20, paddingBottom: 40 },
  qCard: {
    backgroundColor: dark.glass, borderRadius: 16, padding: 18, marginBottom: 20,
    borderLeftWidth: 3, borderLeftColor: dark.neon,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  qLabel:      { color: dark.neon, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  qText:       { fontSize: 15, color: '#1E1B33', lineHeight: 22, fontWeight: '500' },
  sectionLabel:{ fontSize: 12, color: dark.textSub, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  answerRow:   { flexDirection: 'row', gap: 12, marginBottom: 24 },
  answerBtn: { flex: 1, paddingVertical: 16, alignItems: 'center', gap: 6 },
  answerText:         { color: '#1E1B33', fontWeight: '700', fontSize: 16 },
  answerTextSelected: { color: '#fff' },
  confRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  confBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', gap: 6 },
  confText: { color: dark.textSub, fontWeight: '600', fontSize: 13 },
  nextBtn: {
    backgroundColor: dark.neon, borderRadius: 28, paddingVertical: 16, alignItems: 'center',
    shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  nextDisabled:     { backgroundColor: dark.glassBorder, shadowOpacity: 0 },
  nextText:         { fontSize: 16, fontWeight: '700', color: '#fff' },
  nextTextDisabled: { color: dark.textMute },
});
