import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { ui, dark } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';
import NeuralLinesBg from '../../components/NeuralLinesBg';
import { ClayCard } from '../../components/Clay';

const EMOJI_MAP = {
  Happy: '😄', Surprised: '😮', Excited: '🤩', Proud: '😌',
  Sad: '😢', Tired: '😪', Hurt: '🥺', Scared: '😨',
  Angry: '😡', Annoyed: '😒', Frustrated: '😤', Disgusted: '🤢',
  Shocked: '😲', Nervous: '😬', Sick: '🤒', Upset: '😞',
  Curious: '🤔', Bored: '😑', Calm: '😌', Content: '🙂', Relieved: '😌',
  Celebrating: '🥳', Disappointed: '😔', Ashamed: '😳', Awed: '😍',
};

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

function handleBack(navigation) {
  Alert.alert('Exit Assessment?', 'Your cognitive task progress will not be saved if you exit now.', [
    { text: 'Stay', style: 'cancel' },
    { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Main') },
  ]);
}

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
      <NeuralLinesBg />
      <PhaseHeader phase={3} title="Emotion Recognition" subtitle={`Emotional · ${current + 1}/${EMOTION_TRIALS.length}`} progress={(taskIndex + 1) / 8} onBack={() => handleBack(navigation)} />

      <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
      <View style={styles.arena}>
        <Text style={styles.instruction}>What emotion does this face express?</Text>
        <View style={styles.faceBox}>
          <Text style={styles.face}>{trial.face}</Text>
        </View>

        <View style={styles.options}>
          {trial.options.map(opt => {
            let tone = 'default';
            if (selected !== null) {
              if (opt === trial.correct) tone = 'correct';
              else if (opt === selected) tone = 'incorrect';
            }
            return (
              <ClayCard
                key={opt}
                tone={tone}
                radius={14}
                style={styles.optBtn}
                onPress={() => handleSelect(opt)}
              >
                <Text style={styles.optEmoji}>{EMOJI_MAP[opt] || '🙂'}</Text>
                <Text style={styles.optText}>{opt}</Text>
              </ClayCard>
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
  arena: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  instruction: { fontSize: 14, color: dark.textSub, marginBottom: 24, textAlign: 'center' },
  faceBox: {
    width: 150, height: 150, backgroundColor: dark.glass,
    borderRadius: 30, alignItems: 'center', justifyContent: 'center',
    marginBottom: 32, borderWidth: 2, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
  },
  face: { fontSize: 80 },
  options: { width: '100%', gap: 12 },
  optBtn: {
    paddingVertical: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
  },
  optEmoji: { fontSize: 20 },
  optText: { color: '#1E1B33', fontSize: 15, fontWeight: '600' },
  scoreInfo: { textAlign: 'center', color: dark.textMute, fontSize: 12, paddingBottom: 16 },
});
