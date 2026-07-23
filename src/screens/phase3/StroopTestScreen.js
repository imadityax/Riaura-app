import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Alert, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { ui, dark } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';
import GameBackButton from '../../components/GameBackButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NeuralLinesBg from '../../components/NeuralLinesBg';
import { ClayCard } from '../../components/Clay';

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
      <NeuralLinesBg />
        <GameBackButton onPress={() => handleBack(navigation)} />
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.resultBox}>
          <MaterialCommunityIcons name="palette-outline" size={60} color={dark.neon} style={styles.resultEmoji} />
          <Text style={styles.resultTitle}>Stroop Test Complete</Text>
          <Text style={styles.resultScore}>{score}/{TOTAL_TRIALS} correct</Text>
          <Text style={styles.resultSub}>Task Score: {taskScore}/5</Text>
          <TouchableOpacity style={styles.btn} onPress={handleFinish} activeOpacity={0.8}>
            <View style={styles.btnInner}>
              <Text style={styles.btnText}>Next Task: N-Back →</Text>
            </View>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NeuralLinesBg />
      <PhaseHeader phase={3} title="Stroop Test" subtitle={`Attention · Trial ${current + 1}/${TOTAL_TRIALS}`} progress={(taskIndex + 1) / 8} onBack={() => handleBack(navigation)} />
      <View style={styles.timerBar}>
        <Animated.View style={[styles.timerFill, { width: barWidth }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.arena}>
        <Text style={styles.instruction}>Tap the COLOR of the ink — not what the word says</Text>
        <View style={styles.wordCard}>
          <Text style={[styles.word, { color: trial.inkColor }]}>{trial.word}</Text>
        </View>
        {feedback && <Text style={[styles.feedback, { color: feedback.startsWith('✓') ? colors.success : colors.danger }]}>{feedback}</Text>}
      </View>

      <View style={styles.options}>
        {COLOR_OPTIONS.map(opt => (
          <ClayCard
            key={opt.name}
            tone="default"
            radius={14}
            style={[styles.colorBtn, { backgroundColor: opt.hex + '14' }]}
            onPress={() => handleTap(opt.name)}
          >
            <View style={[styles.colorDot, { backgroundColor: opt.hex }]} />
            <Text style={styles.colorLabel}>{opt.name}</Text>
          </ClayCard>
        ))}
      </View>

      <Text style={styles.scoreInfo}>Score: {score} pts</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: dark.bgSolid },
  scrollBody: { flexGrow: 1, paddingBottom: 28 },
  resultScroll: { flexGrow: 1, justifyContent: 'center' },
  timerBar: { height: 6, backgroundColor: dark.glassBorder, marginHorizontal: 20, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  timerFill: { height: '100%', backgroundColor: colors.phase3, borderRadius: 3 },
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  instruction: { fontSize: 13, color: dark.textSub, textAlign: 'center', marginBottom: 30 },
  wordCard: {
    backgroundColor: dark.glass, borderRadius: 20, padding: 40,
    alignItems: 'center', justifyContent: 'center', minWidth: 200,
    borderWidth: 1, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  word: { fontSize: 40, fontWeight: '900', letterSpacing: 2 },
  feedback: { fontSize: 16, fontWeight: '700', marginTop: 20 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, padding: 20 },
  colorBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, minWidth: 130,
  },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  colorLabel: { color: '#1E1B33', fontWeight: '700', fontSize: 14 },
  scoreInfo: { textAlign: 'center', color: dark.textMute, fontSize: 12, paddingBottom: 20 },
  resultBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  resultEmoji: { marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#1E1B33', marginBottom: 8 },
  resultScore: { fontSize: 36, fontWeight: '900', color: dark.neon },
  resultSub: { fontSize: 14, color: dark.textSub, marginTop: 4, marginBottom: 32 },
  btn: { borderRadius: 14, overflow: 'hidden', width: '100%' },
  btnInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: dark.neon, borderRadius: 14 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
