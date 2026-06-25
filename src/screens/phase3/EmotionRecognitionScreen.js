import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';

const EMOTION_TRIALS = [
  { face: '😄', correct: 'Happy', options: ['Happy', 'Surprised', 'Excited', 'Proud'] },
  { face: '😢', correct: 'Sad', options: ['Sad', 'Tired', 'Hurt', 'Scared'] },
  { face: '😡', correct: 'Angry', options: ['Angry', 'Annoyed', 'Frustrated', 'Disgusted'] },
  { face: '😨', correct: 'Scared', options: ['Shocked', 'Surprised', 'Scared', 'Nervous'] },
  { face: '🤢', correct: 'Disgusted', options: ['Sick', 'Disgusted', 'Upset', 'Annoyed'] },
  { face: '😮', correct: 'Surprised', options: ['Surprised', 'Happy', 'Shocked', 'Curious'] },
  { face: '😌', correct: 'Calm', options: ['Bored', 'Calm', 'Content', 'Relieved'] },
  { face: '🥳', correct: 'Celebrating', options: ['Happy', 'Excited', 'Celebrating', 'Proud'] },
  { face: '😔', correct: 'Disappointed', options: ['Disappointed', 'Sad', 'Hurt', 'Ashamed'] },
  { face: '🤩', correct: 'Awed', options: ['Excited', 'Awed', 'Happy', 'Surprised'] },
];

export default function EmotionRecognitionScreen({ route, navigation }) {
  const { phase2Answers, taskScores, taskIndex } = route.params;
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);

  const trial = EMOTION_TRIALS[current];

  function handleSelect(opt) {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === trial.correct) setScore(s => s + 1);
    setTimeout(() => {
      const next = current + 1;
      if (next >= EMOTION_TRIALS.length) {
        const taskScore = Math.round(((score + (opt === trial.correct ? 1 : 0)) / EMOTION_TRIALS.length) * 5);
        const newScores = [...taskScores, taskScore];
        navigation.replace('Task_AlternativeUses', { phase2Answers, taskScores: newScores, taskIndex: taskIndex + 1 });
      } else {
        setCurrent(next);
        setSelected(null);
      }
    }, 700);
  }

  return (
    <View style={styles.container}>
      <PhaseHeader phase={3} title="Emotion Recognition" subtitle={`Emotional · ${current + 1}/${EMOTION_TRIALS.length}`} progress={(taskIndex + 1) / 8} />

      <View style={styles.arena}>
        <Text style={styles.instruction}>What emotion does this face express?</Text>
        <View style={styles.faceBox}>
          <Text style={styles.face}>{trial.face}</Text>
        </View>

        <View style={styles.options}>
          {trial.options.map(opt => {
            let extra = {};
            if (selected !== null) {
              if (opt === trial.correct) extra = { borderColor: colors.success, backgroundColor: colors.success + '15' };
              else if (opt === selected) extra = { borderColor: colors.danger, backgroundColor: colors.danger + '10' };
            }
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.optBtn, extra]}
                onPress={() => handleSelect(opt)}
                activeOpacity={0.8}
              >
                <Text style={styles.optText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Text style={styles.scoreInfo}>Score: {score}/{current}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ui.offWhite },
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  instruction: { fontSize: 14, color: ui.midText, marginBottom: 24, textAlign: 'center' },
  faceBox: {
    width: 150, height: 150, backgroundColor: ui.white,
    borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    marginBottom: 32, borderWidth: 2, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  face: { fontSize: 80 },
  options: { width: '100%', gap: 10 },
  optBtn: {
    backgroundColor: ui.white, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  optText: { color: ui.darkText, fontSize: 15, fontWeight: '600' },
  scoreInfo: { textAlign: 'center', color: ui.lightText, fontSize: 12, paddingBottom: 16 },
});
