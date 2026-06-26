import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const N = 2;
const SEQUENCE_LENGTH = 12;
const DISPLAY_TIME = 2000;
const RESPONSE_WINDOW = 1500;

function generateSequence() {
  const seq = LETTERS.map(() => LETTERS[Math.floor(Math.random() * LETTERS.length)]);
  for (let i = N; i < seq.length; i++) {
    if (Math.random() < 0.35) seq[i] = seq[i - N];
  }
  return seq;
}

function handleBack(navigation) {
  Alert.alert('Exit Assessment?', 'Your cognitive task progress will not be saved if you exit now.', [
    { text: 'Stay', style: 'cancel' },
    { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Main') },
  ]);
}

export default function NBackScreen({ route, navigation }) {
  const { phase2Answers, taskScores, taskIndex } = route.params;
  const [sequence] = useState(generateSequence);
  const [position, setPosition] = useState(-1);
  const [phase, setPhase] = useState('showing');
  const [responses, setResponses] = useState([]);
  const [responded, setResponded] = useState(false);
  const [correct, setCorrect] = useState(0);
  const total = SEQUENCE_LENGTH - N;

  useEffect(() => {
    if (position < SEQUENCE_LENGTH) {
      const t = setTimeout(() => {
        if (position >= N - 1) {
          setPhase('respond');
          setResponded(false);
          const t2 = setTimeout(() => {
            if (position >= N - 1) {
              setResponses(r => [...r, false]);
            }
            setPosition(p => p + 1);
            setPhase('showing');
          }, RESPONSE_WINDOW);
          return () => clearTimeout(t2);
        } else {
          setPosition(p => p + 1);
        }
      }, DISPLAY_TIME);
      return () => clearTimeout(t);
    } else {
      setPhase('done');
    }
  }, [position]);

  useEffect(() => {
    if (position === -1) {
      const t = setTimeout(() => setPosition(0), 500);
      return () => clearTimeout(t);
    }
  }, []);

  function handleResponse(isMatch) {
    if (responded || position < N) return;
    setResponded(true);
    const actualMatch = sequence[position] === sequence[position - N];
    const hit = isMatch === actualMatch;
    if (hit) setCorrect(c => c + 1);
    setResponses(r => [...r, hit]);
  }

  const taskScore = Math.round((correct / Math.max(total, 1)) * 5);

  function handleFinish() {
    const newScores = [...taskScores, taskScore];
    navigation.replace('Task_SymbolDigit', { phase2Answers, taskScores: newScores, taskIndex: taskIndex + 1 });
  }

  if (phase === 'done') {
    return (
      <View style={styles.container}>
        <View style={styles.resultBox}>
          <Text style={styles.resultEmoji}>🔢</Text>
          <Text style={styles.resultTitle}>N-Back Complete</Text>
          <Text style={styles.resultScore}>{correct}/{total}</Text>
          <Text style={styles.resultSub}>Task Score: {taskScore}/5</Text>
          <TouchableOpacity style={styles.btn} onPress={handleFinish} activeOpacity={0.8}>
            <View style={styles.btnInner}>
              <Text style={styles.btnText}>Next Task: Symbol Digit →</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const showLetter = position >= 0 && position < SEQUENCE_LENGTH;
  const isMatchRound = position >= N;

  return (
    <View style={styles.container}>
      <PhaseHeader phase={3} title="N-Back Task" subtitle={`Memory · N=2 · Item ${Math.max(0, position + 1)}/${SEQUENCE_LENGTH}`} progress={(taskIndex + 1) / 8} onBack={() => handleBack(navigation)} />

      <View style={styles.arena}>
        <Text style={styles.instruction}>
          Does the current letter match the one from <Text style={{ color: ui.primaryBlue, fontWeight: '700' }}>2 steps back</Text>?
        </Text>
        <View style={styles.letterBox}>
          <Text style={styles.letter}>{showLetter ? sequence[Math.max(0, position)] : '?'}</Text>
        </View>
        {position >= 1 && (
          <Text style={styles.prevText}>Previous: {sequence[Math.max(0, position - 1)]}</Text>
        )}
      </View>

      <View style={styles.btns}>
        <TouchableOpacity
          style={[styles.responseBtn, styles.noBtn, responded && styles.responseDone]}
          onPress={() => handleResponse(false)}
          disabled={!isMatchRound || responded || phase !== 'respond'}
        >
          <Text style={styles.responseBtnText}>✗ No Match</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.responseBtn, styles.yesBtn, responded && styles.responseDone]}
          onPress={() => handleResponse(true)}
          disabled={!isMatchRound || responded || phase !== 'respond'}
        >
          <Text style={styles.responseBtnText}>✓ Match!</Text>
        </TouchableOpacity>
      </View>

      {!isMatchRound && (
        <Text style={styles.waitText}>Memorizing pattern… ({N - position} more to go)</Text>
      )}
      <Text style={styles.scoreInfo}>Score: {correct}/{responses.length}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ui.offWhite },
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  instruction: { fontSize: 13, color: ui.midText, textAlign: 'center', marginBottom: 30, lineHeight: 20 },
  letterBox: {
    width: 140, height: 140, backgroundColor: ui.white,
    borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  letter: { fontSize: 72, fontWeight: '900', color: ui.primaryBlue },
  prevText: { fontSize: 13, color: ui.lightText, marginTop: 16 },
  btns: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingBottom: 20 },
  responseBtn: {
    flex: 1, paddingVertical: 18, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  noBtn: { backgroundColor: colors.danger + '18', borderWidth: 1.5, borderColor: colors.danger },
  yesBtn: { backgroundColor: colors.success + '18', borderWidth: 1.5, borderColor: colors.success },
  responseDone: { opacity: 0.4 },
  responseBtnText: { color: ui.darkText, fontWeight: '800', fontSize: 15 },
  waitText: { textAlign: 'center', color: ui.lightText, fontSize: 12, marginBottom: 10 },
  scoreInfo: { textAlign: 'center', color: ui.lightText, fontSize: 12, paddingBottom: 16 },
  resultBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  resultEmoji: { fontSize: 60, marginBottom: 16 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: ui.darkText, marginBottom: 8 },
  resultScore: { fontSize: 36, fontWeight: '900', color: ui.primaryBlue },
  resultSub: { fontSize: 14, color: ui.midText, marginTop: 4, marginBottom: 32 },
  btn: { borderRadius: 14, overflow: 'hidden', width: '100%' },
  btnInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: ui.primaryBlue, borderRadius: 14 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
