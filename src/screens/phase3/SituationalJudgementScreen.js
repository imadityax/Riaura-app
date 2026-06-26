import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';

const SCENARIOS = [
  {
    scenario: 'Your team misses an important deadline because a colleague didn\'t deliver their part. Your manager asks what happened. What do you do?',
    options: [
      'Explain the situation honestly and focus on next steps to recover.',
      'Blame the colleague directly to protect your own reputation.',
      'Say nothing and hope the manager doesn\'t investigate further.',
      'Defend the team as a whole without disclosing what happened.',
    ],
    best: 0,
  },
  {
    scenario: 'You\'re in a group project and notice that the approach the team chose will likely fail. You had previously suggested a better approach that was rejected.',
    options: [
      'Stay quiet — your idea was already rejected, it\'s not your problem.',
      'Bring up your concern again calmly with supporting reasoning.',
      'Undermine the current approach so the team listens to you.',
      'Work on your portion and let the outcome speak for itself.',
    ],
    best: 1,
  },
  {
    scenario: 'You receive two job offers simultaneously. One pays more but involves tasks you dislike. The other pays less but aligns with your passions.',
    options: [
      'Always choose the higher salary — security matters most.',
      'Accept both offers and decide later.',
      'Weigh long-term fulfillment, growth, and financial needs together.',
      'Flip a coin — both options seem equal.',
    ],
    best: 2,
  },
  {
    scenario: 'During an exam you realize you know the answer to a question your study partner is stuck on. Sharing would violate exam rules.',
    options: [
      'Discreetly help them — they need the support.',
      'Focus on your own work and help them study after the exam.',
      'Report the situation to the invigilator immediately.',
      'Ignore the situation — it\'s not your concern.',
    ],
    best: 1,
  },
  {
    scenario: 'You discover a bug in software you released that could potentially affect 1,000 users, but fixing it will delay the next release by two weeks.',
    options: [
      'Release the next update on time and fix the bug silently later.',
      'Immediately disclose and patch the bug, delaying the release.',
      'Wait to see if any users complain before acting.',
      'Ask users to work around the bug via a support page.',
    ],
    best: 1,
  },
];

function handleBack(navigation) {
  Alert.alert('Exit Assessment?', 'Your cognitive task progress will not be saved if you exit now.', [
    { text: 'Stay', style: 'cancel' },
    { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Main') },
  ]);
}

export default function SituationalJudgementScreen({ route, navigation }) {
  const { phase2Answers, taskScores, taskIndex } = route.params;
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const s = SCENARIOS[current];

  function handleSelect(idx) {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    if (idx === s.best) setScore(sc => sc + 1);
  }

  function handleNext() {
    const next = current + 1;
    if (next >= SCENARIOS.length) {
      const taskScore = Math.round((score / SCENARIOS.length) * 5);
      const newScores = [...taskScores, taskScore];
      navigation.replace('Task_EmotionRecognition', { phase2Answers, taskScores: newScores, taskIndex: taskIndex + 1 });
    } else {
      setCurrent(next);
      setSelected(null);
      setRevealed(false);
    }
  }

  return (
    <View style={styles.container}>
      <PhaseHeader phase={3} title="Situational Judgement" subtitle={`Decision · ${current + 1}/${SCENARIOS.length}`} progress={(taskIndex + 1) / 8} onBack={() => handleBack(navigation)} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioLabel}>SCENARIO</Text>
          <Text style={styles.scenarioText}>{s.scenario}</Text>
        </View>

        <Text style={styles.chooseLabel}>What is the BEST response?</Text>
        {s.options.map((opt, i) => {
          let extra = {};
          if (revealed) {
            if (i === s.best) extra = { borderColor: colors.success, backgroundColor: colors.success + '15' };
            else if (i === selected) extra = { borderColor: colors.danger, backgroundColor: colors.danger + '10' };
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optBtn, extra]}
              onPress={() => handleSelect(i)}
              activeOpacity={0.8}
            >
              <View style={styles.optLetter}>
                <Text style={styles.optLetterText}>{String.fromCharCode(65 + i)}</Text>
              </View>
              <Text style={styles.optText}>{opt}</Text>
              {revealed && i === s.best && <Text style={styles.bestTag}>✓ Best</Text>}
            </TouchableOpacity>
          );
        })}

        {revealed && (
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.8}>
            <View style={styles.nextInner}>
              <Text style={styles.nextText}>
                {current + 1 < SCENARIOS.length ? 'Next Scenario →' : 'Complete Task →'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Text style={styles.scoreInfo}>Score: {score}/{current + (revealed ? 1 : 0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ui.offWhite },
  content: { padding: 20, paddingBottom: 30 },
  scenarioCard: {
    backgroundColor: ui.white, borderRadius: 14, padding: 16, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: colors.phase4,
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  scenarioLabel: { color: colors.phase4, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  scenarioText: { color: ui.darkText, fontSize: 14, lineHeight: 22, fontWeight: '500' },
  chooseLabel: { color: ui.midText, fontSize: 12, fontWeight: '600', marginBottom: 10 },
  optBtn: {
    backgroundColor: ui.white, borderRadius: 12, padding: 12, marginBottom: 8,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  optLetter: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: ui.inputBg, alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  optLetterText: { color: ui.midText, fontSize: 11, fontWeight: '800' },
  optText: { flex: 1, color: ui.darkText, fontSize: 13, lineHeight: 20 },
  bestTag: { color: colors.success, fontSize: 11, fontWeight: '800', marginTop: 2 },
  nextBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  nextInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: ui.primaryBlue, borderRadius: 14 },
  nextText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  scoreInfo: { textAlign: 'center', color: ui.lightText, fontSize: 12, paddingBottom: 12 },
});
