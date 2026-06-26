import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';

const COLOR_OPTIONS = [
  { name: 'Red', hex: '#FF4444' },
  { name: 'Blue', hex: '#4488FF' },
  { name: 'Green', hex: '#44BB44' },
  { name: 'Yellow', hex: '#DDAA00' },
];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateTrial() {
  const word = randomItem(COLOR_OPTIONS);
  let inkColor = randomItem(COLOR_OPTIONS);
  if (Math.random() < 0.3) inkColor = word;
  return { word: word.name, inkColor: inkColor.hex, correct: inkColor };
}

const TOTAL_TRIALS = 10;
const TIME_PER_TRIAL = 3000;

function handleBack(navigation) {
  Alert.alert('Exit Assessment?', 'Your cognitive task progress will not be saved if you exit now.', [
    { text: 'Stay', style: 'cancel' },
    { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Main') },
  ]);
}

export default function StroopTestScreen({ route, navigation }) {
  const { phase2Answers, taskScores, taskIndex } = route.params;
  const [trial, setTrial] = useState(generateTrial());
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);

  useEffect(() => { startTimer(); return () => clearTimer(); }, [current]);

  function startTimer() {
    timerAnim.setValue(1);
    Animated.timing(timerAnim, { toValue: 0, duration: TIME_PER_TRIAL, useNativeDriver: false }).start(({ finished }) => {
      if (finished) advance(false);
    });
  }

  function clearTimer() {
    timerAnim.stopAnimation();
  }

  function handleTap(colorName) {
    clearTimer();
    const correct = colorName === trial.correct.name;
    if (correct) setScore(s => s + 1);
    setFeedback(correct ? '✓ Correct!' : `✗ Ink was ${trial.correct.name}`);
    setTimeout(() => advance(true), 700);
  }

  function advance(fromTap) {
    setFeedback(null);
    const next = current + 1;
    if (next >= TOTAL_TRIALS) {
      setDone(true);
    } else {
      setCurrent(next);
      setTrial(generateTrial());
    }
  }

  const taskScore = Math.round((score / TOTAL_TRIALS) * 5);

  function handleFinish() {
    const newScores = [...taskScores, taskScore];
    navigation.replace('Task_NBack', { phase2Answers, taskScores: newScores, taskIndex: taskIndex + 1 });
  }

  const barWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  if (done) {
    return (
      <View style={styles.container}>
        <View style={styles.resultBox}>
          <Text style={styles.resultEmoji}>🎨</Text>
          <Text style={styles.resultTitle}>Stroop Test Complete</Text>
          <Text style={styles.resultScore}>{score}/{TOTAL_TRIALS} correct</Text>
          <Text style={styles.resultSub}>Task Score: {taskScore}/5</Text>
          <TouchableOpacity style={styles.btn} onPress={handleFinish} activeOpacity={0.8}>
            <View style={styles.btnInner}>
              <Text style={styles.btnText}>Next Task: N-Back →</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PhaseHeader phase={3} title="Stroop Test" subtitle={`Attention · Trial ${current + 1}/${TOTAL_TRIALS}`} progress={(taskIndex + 1) / 8} onBack={() => handleBack(navigation)} />
      <View style={styles.timerBar}>
        <Animated.View style={[styles.timerFill, { width: barWidth }]} />
      </View>

      <View style={styles.arena}>
        <Text style={styles.instruction}>Tap the COLOR of the ink — not what the word says</Text>
        <View style={styles.wordCard}>
          <Text style={[styles.word, { color: trial.inkColor }]}>{trial.word}</Text>
        </View>
        {feedback && <Text style={[styles.feedback, { color: feedback.startsWith('✓') ? colors.success : colors.danger }]}>{feedback}</Text>}
      </View>

      <View style={styles.options}>
        {COLOR_OPTIONS.map(opt => (
          <TouchableOpacity key={opt.name} style={[styles.colorBtn, { borderColor: opt.hex }]} onPress={() => handleTap(opt.name)} activeOpacity={0.8}>
            <View style={[styles.colorDot, { backgroundColor: opt.hex }]} />
            <Text style={styles.colorLabel}>{opt.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.scoreInfo}>Score: {score} pts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ui.offWhite },
  timerBar: { height: 6, backgroundColor: ui.borderGray, marginHorizontal: 20, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  timerFill: { height: '100%', backgroundColor: colors.phase3, borderRadius: 3 },
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  instruction: { fontSize: 13, color: ui.midText, textAlign: 'center', marginBottom: 30 },
  wordCard: {
    backgroundColor: ui.white, borderRadius: 20, padding: 40,
    alignItems: 'center', justifyContent: 'center', minWidth: 200,
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  word: { fontSize: 40, fontWeight: '900', letterSpacing: 2 },
  feedback: { fontSize: 16, fontWeight: '700', marginTop: 20 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, padding: 20 },
  colorBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: ui.white, borderRadius: 12, borderWidth: 2,
    paddingHorizontal: 16, paddingVertical: 12, minWidth: 130,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  colorLabel: { color: ui.darkText, fontWeight: '700', fontSize: 14 },
  scoreInfo: { textAlign: 'center', color: ui.lightText, fontSize: 12, paddingBottom: 20 },
  resultBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  resultEmoji: { fontSize: 60, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: ui.darkText, marginBottom: 8 },
  resultScore: { fontSize: 36, fontWeight: '900', color: ui.primaryBlue },
  resultSub: { fontSize: 14, color: ui.midText, marginTop: 4, marginBottom: 32 },
  btn: { borderRadius: 14, overflow: 'hidden', width: '100%' },
  btnInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: ui.primaryBlue, borderRadius: 14 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
