import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { ui, dark } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';
import GameBackButton from '../../components/GameBackButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NeuralLinesBg from '../../components/NeuralLinesBg';

const SYMBOL_MAP = { '★': 1, '●': 2, '▲': 3, '♦': 4, '■': 5, '✦': 6, '⬟': 7, '⬡': 8 };
const SYMBOLS = Object.keys(SYMBOL_MAP);
const TIME_LIMIT = 60;
const TRIALS = 15;

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function generateTrials() {
  return Array.from({ length: TRIALS }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
}

function handleBack(navigation) {
  Alert.alert('Exit Assessment?', 'Your cognitive task progress will not be saved if you exit now.', [
    { text: 'Stay', style: 'cancel' },
    { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Main') },
  ]);
}

export default function SymbolDigitScreen({ route, navigation }) {
  const { phase2Answers, taskScores, taskIndex } = route.params;
  const [trials] = useState(generateTrials);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setDone(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [done]);

  function handleTap(digit) {
    if (done) return;
    const correct = SYMBOL_MAP[trials[current]] === digit;
    if (correct) setScore(s => s + 1);
    setFeedback(correct ? '✓' : '✗');
    setTimeout(() => {
      setFeedback(null);
      const next = current + 1;
      if (next >= TRIALS) setDone(true);
      else setCurrent(next);
    }, 300);
  }

  const taskScore = Math.round((score / Math.max(current, 1)) * 5);
  const accuracyPct = current > 0 ? Math.round((score / current) * 100) : 0;

  function handleFinish() {
    const finalScore = Math.round((score / TRIALS) * 5);
    const newScores = [...taskScores, finalScore];
    navigation.replace('Task_Matrix', { phase2Answers, taskScores: newScores, taskIndex: taskIndex + 1 });
  }

  if (done) {
    return (
      <View style={styles.container}>
      <NeuralLinesBg />
        <GameBackButton onPress={() => handleBack(navigation)} />
        <ScrollView contentContainerStyle={styles.resultScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.resultBox}>
          <MaterialCommunityIcons name="lightning-bolt-outline" size={60} color={dark.neon} style={styles.resultEmoji} />
          <Text style={styles.resultTitle}>Symbol Digit Complete</Text>
          <Text style={styles.resultScore}>{score}/{Math.min(current + 1, TRIALS)} correct</Text>
          <Text style={styles.resultSub}>Accuracy: {accuracyPct}% · Score: {taskScore}/5</Text>
          <TouchableOpacity style={styles.btn} onPress={handleFinish} activeOpacity={0.8}>
            <View style={styles.btnInner}>
              <Text style={styles.btnText}>Next Task: Matrix Reasoning →</Text>
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
      <PhaseHeader phase={3} title="Symbol Digit Matching" subtitle={`Processing · ${timeLeft}s left`} progress={(taskIndex + 1) / 8} onBack={() => handleBack(navigation)} />

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.keyRow}>
        {SYMBOLS.slice(0, 4).map(sym => (
          <View key={sym} style={styles.keyItem}>
            <Text style={styles.keySym}>{sym}</Text>
            <Text style={styles.keyNum}>{SYMBOL_MAP[sym]}</Text>
          </View>
        ))}
      </View>
      <View style={styles.keyRow}>
        {SYMBOLS.slice(4).map(sym => (
          <View key={sym} style={styles.keyItem}>
            <Text style={styles.keySym}>{sym}</Text>
            <Text style={styles.keyNum}>{SYMBOL_MAP[sym]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.arena}>
        <View style={styles.symBox}>
          <Text style={styles.bigSym}>{trials[current]}</Text>
        </View>
        {feedback && (
          <Text style={{ fontSize: 28, fontWeight: '900', color: feedback === '✓' ? colors.success : colors.danger }}>
            {feedback}
          </Text>
        )}
      </View>

      <View style={styles.digitGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(d => (
          <TouchableOpacity key={d} style={styles.digitBtn} onPress={() => handleTap(d)} activeOpacity={0.7}>
            <Text style={styles.digitText}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.scoreInfo}>Score: {score} | Q: {current + 1}/{TRIALS}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: dark.bgSolid },
  scrollBody: { flexGrow: 1, paddingBottom: 28 },
  resultScroll: { flexGrow: 1, justifyContent: 'center' },
  keyRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginTop: 8 },
  keyItem: { alignItems: 'center', backgroundColor: dark.glass, borderRadius: 8, padding: 6, width: 56, borderWidth: 1, borderColor: dark.glassBorder },
  keySym: { fontSize: 18, color: dark.neon },
  keyNum: { fontSize: 12, color: dark.textSub, fontWeight: '700', marginTop: 2 },
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  symBox: {
    width: 120, height: 120, backgroundColor: dark.glass,
    borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  bigSym: { fontSize: 60, color: '#1E1B33' },
  digitGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, padding: 16 },
  digitBtn: {
    width: 64, height: 64, backgroundColor: dark.glass, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  digitText: { fontSize: 24, fontWeight: '800', color: '#1E1B33' },
  scoreInfo: { textAlign: 'center', color: dark.textMute, fontSize: 12, paddingBottom: 16 },
  resultBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  resultEmoji: { marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#1E1B33', marginBottom: 8 },
  resultScore: { fontSize: 36, fontWeight: '900', color: dark.neon },
  resultSub: { fontSize: 14, color: dark.textSub, marginTop: 4, marginBottom: 32 },
  btn: { borderRadius: 14, overflow: 'hidden', width: '100%' },
  btnInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: dark.neon, borderRadius: 14 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
