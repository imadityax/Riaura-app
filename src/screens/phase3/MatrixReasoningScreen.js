import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { ui, dark } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';
import NeuralLinesBg from '../../components/NeuralLinesBg';

const MATRICES = [
  {
    grid: ['🔵', '🔴', '🔵', '🔴', '🔵', '🔴', '🔵', '🔴', '?'],
    options: ['🔵', '🟢', '🟡', '🔴'],
    answer: 0,
  },
  {
    grid: ['⬛', '⬜', '⬛', '⬜', '⬛', '⬜', '⬜', '⬛', '?'],
    options: ['⬛', '⬜', '🟥', '🟦'],
    answer: 1,
  },
  {
    grid: ['1️⃣', '2️⃣', '3️⃣', '2️⃣', '3️⃣', '4️⃣', '3️⃣', '4️⃣', '?'],
    options: ['3️⃣', '4️⃣', '5️⃣', '6️⃣'],
    answer: 2,
  },
  {
    grid: ['🔺', '🔺', '🔻', '🔺', '🔻', '🔻', '🔻', '🔻', '?'],
    options: ['🔺', '🔻', '🔷', '🔸'],
    answer: 1,
  },
  {
    grid: ['🌑', '🌒', '🌓', '🌓', '🌔', '🌕', '🌕', '🌖', '?'],
    options: ['🌑', '🌒', '🌗', '🌕'],
    answer: 2,
  },
];

function handleBack(navigation) {
  Alert.alert('Exit Assessment?', 'Your cognitive task progress will not be saved if you exit now.', [
    { text: 'Stay', style: 'cancel' },
    { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Main') },
  ]);
}

export default function MatrixReasoningScreen({ route, navigation }) {
  const { phase2Answers, taskScores, taskIndex } = route.params;
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const matrix = MATRICES[current];

  function handleSelect(idx) {
    if (showFeedback) return;
    setSelected(idx);
    setShowFeedback(true);
    if (idx === matrix.answer) setScore(s => s + 1);
    setTimeout(() => {
      setShowFeedback(false);
      setSelected(null);
      if (current + 1 >= MATRICES.length) {
        const taskScore = Math.round((score + (idx === matrix.answer ? 1 : 0)) / MATRICES.length * 5);
        const newScores = [...taskScores, taskScore];
        navigation.replace('Task_SituationalJudgement', { phase2Answers, taskScores: newScores, taskIndex: taskIndex + 1 });
      } else {
        setCurrent(c => c + 1);
      }
    }, 800);
  }

  return (
    <View style={styles.container}>
      <NeuralLinesBg />
      <PhaseHeader phase={3} title="Matrix Reasoning" subtitle={`Reasoning · ${current + 1}/${MATRICES.length}`} progress={(taskIndex + 1) / 8} onBack={() => handleBack(navigation)} />

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.arena}>
        <Text style={styles.instruction}>Find the pattern. Which option replaces the <Text style={{ color: dark.neon, fontWeight: '800' }}>?</Text></Text>

        <View style={styles.grid}>
          {matrix.grid.map((cell, i) => (
            <View key={i} style={[styles.cell, cell === '?' && styles.cellMissing]}>
              <Text style={styles.cellText}>{cell}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.optionLabel}>Choose the missing piece:</Text>
        <View style={styles.options}>
          {matrix.options.map((opt, i) => {
            let borderColor = dark.glassBorder;
            if (showFeedback && i === selected) {
              borderColor = i === matrix.answer ? colors.success : colors.danger;
            }
            if (showFeedback && i === matrix.answer) borderColor = colors.success;
            return (
              <TouchableOpacity
                key={i}
                style={[styles.optBtn, { borderColor }]}
                onPress={() => handleSelect(i)}
                activeOpacity={0.8}
              >
                <Text style={styles.optText}>{opt}</Text>
                {showFeedback && i === matrix.answer && <Text style={styles.correctTag}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={styles.scoreInfo}>Score: {score}/{current}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: dark.bgSolid },
  scrollBody: { flexGrow: 1, paddingBottom: 28 },
  resultScroll: { flexGrow: 1, justifyContent: 'center' },
  arena: { flex: 1, alignItems: 'center', padding: 20, justifyContent: 'center' },
  instruction: { fontSize: 13, color: dark.textSub, textAlign: 'center', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 240, gap: 6, marginBottom: 24 },
  cell: {
    width: 72, height: 72, backgroundColor: dark.glass,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cellMissing: { borderColor: dark.neon, borderWidth: 2, backgroundColor: dark.glass },
  cellText: { fontSize: 28 },
  optionLabel: { color: dark.textSub, fontSize: 12, fontWeight: '600', marginBottom: 12 },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  optBtn: {
    width: 90, height: 90, backgroundColor: dark.glass,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  optText: { fontSize: 32 },
  correctTag: { position: 'absolute', top: 4, right: 6, color: colors.success, fontSize: 14, fontWeight: '900' },
  scoreInfo: { textAlign: 'center', color: dark.textMute, fontSize: 12, paddingBottom: 16 },
});
