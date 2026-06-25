import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Animated,
} from 'react-native';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';
import { getAgeGroup, MINDFULNESS_QUESTIONS, calcMindfulnessScore } from '../../data/mindfulnessQuestions';

export default function MindfulnessAssessScreen({ navigation }) {
  const [groupKey, setGroupKey]   = useState(null);
  const [questions, setQuestions] = useState([]);
  const [scaleLabels, setScaleLabels] = useState([]);
  const [scale, setScale]         = useState(5);
  const [framework, setFramework] = useState('');
  const [current, setCurrent]     = useState(0);
  const [answers, setAnswers]     = useState([]);
  const [selected, setSelected]   = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    storage.getRegistration().then(reg => {
      const age  = parseInt(reg?.age || '25', 10);
      const grp  = getAgeGroup(age);
      const data = MINDFULNESS_QUESTIONS[grp.key];
      setGroupKey(grp.key);
      setQuestions(data.questions);
      setScaleLabels(data.scaleLabels);
      setScale(data.scale);
      setFramework(data.framework);
    });
  }, []);

  function animateFade(callback) {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  }

  function handleNext() {
    if (!selected) return;
    const newAnswers = [...answers, selected];

    if (current + 1 < questions.length) {
      animateFade(() => {
        setAnswers(newAnswers);
        setCurrent(c => c + 1);
        setSelected(0);
      });
    } else {
      const score = calcMindfulnessScore(groupKey, newAnswers);
      storage.saveMindfulnessScore(score).then(() => {
        navigation.replace('Main');
      });
    }
  }

  if (!questions.length) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading your assessment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const q        = questions[current];
  const progress = (current + 1) / questions.length;
  const isLast   = current + 1 === questions.length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.progressText}>{current + 1} / {questions.length}</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Framework badge */}
        <View style={styles.frameworkBadge}>
          <Text style={styles.frameworkText}>{framework}</Text>
        </View>

        {/* Difficulty pill */}
        <View style={[styles.diffBadge,
          q.difficulty === 'Easy'     && styles.diffEasy,
          q.difficulty === 'Moderate' && styles.diffMid,
          q.difficulty === 'Hard'     && styles.diffHard,
        ]}>
          <Text style={[styles.diffText,
            q.difficulty === 'Easy'     && styles.diffTextEasy,
            q.difficulty === 'Moderate' && styles.diffTextMid,
            q.difficulty === 'Hard'     && styles.diffTextHard,
          ]}>{q.difficulty}</Text>
        </View>

        {/* Question */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.questionText}>{q.text}</Text>

          {/* Scale buttons */}
          <View style={styles.scaleWrap}>
            {Array.from({ length: scale }, (_, i) => i + 1).map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.scaleBtn, selected === val && styles.scaleBtnSelected]}
                onPress={() => setSelected(val)}
                activeOpacity={0.7}
              >
                <Text style={[styles.scaleNum, selected === val && styles.scaleNumSelected]}>
                  {val}
                </Text>
                {scaleLabels[val - 1] && (
                  <Text style={[styles.scaleLabel, selected === val && styles.scaleLabelSelected]}>
                    {scaleLabels[val - 1].replace('\n', '\n')}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Scale end labels for wide scales */}
          {scale >= 5 && (
            <View style={styles.endLabels}>
              <Text style={styles.endLabel}>{scaleLabels[0]?.split('\n')[1] || 'Never'}</Text>
              <Text style={styles.endLabel}>{scaleLabels[scale - 1]?.split('\n')[1] || 'Always'}</Text>
            </View>
          )}
        </Animated.View>

        {/* Next button */}
        <TouchableOpacity
          style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={!selected}
        >
          <Text style={[styles.nextBtnText, !selected && styles.nextBtnTextDisabled]}>
            {isLast ? 'Submit  ✓' : 'Next  →'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: ui.offWhite },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15, color: ui.midText },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn:  { paddingVertical: 4, paddingRight: 16 },
  backText: { fontSize: 16, fontWeight: '600', color: ui.primaryBlue },
  progressText: { fontSize: 13, fontWeight: '600', color: ui.midText },

  progressTrack: { height: 4, backgroundColor: ui.borderGray, marginHorizontal: 20, borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: ui.primaryBlue, borderRadius: 2 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  frameworkBadge: {
    backgroundColor: ui.challengeBg,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5,
    alignSelf: 'flex-start', marginBottom: 10,
  },
  frameworkText: { fontSize: 11, fontWeight: '700', color: ui.primaryBlue, letterSpacing: 0.5 },

  diffBadge:   { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 16 },
  diffEasy:    { backgroundColor: '#D1FAE5' },
  diffMid:     { backgroundColor: '#FEF3C7' },
  diffHard:    { backgroundColor: '#FEE2E2' },
  diffText:    { fontSize: 11, fontWeight: '700' },
  diffTextEasy:{ color: '#065F46' },
  diffTextMid: { color: '#92400E' },
  diffTextHard:{ color: '#991B1B' },

  questionText: {
    fontSize: 17, fontWeight: '700', color: ui.darkText,
    lineHeight: 26, marginBottom: 28,
  },

  scaleWrap: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 10 },
  scaleBtn: {
    flex: 1, minWidth: 42, minHeight: 54,
    backgroundColor: ui.white,
    borderRadius: 12, borderWidth: 1.5, borderColor: ui.borderGray,
    alignItems: 'center', justifyContent: 'center', padding: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  scaleBtnSelected: { backgroundColor: ui.primaryBlue, borderColor: ui.primaryBlue },
  scaleNum:         { fontSize: 18, fontWeight: '800', color: ui.midText },
  scaleNumSelected: { color: '#fff' },
  scaleLabel:       { fontSize: 8, color: ui.lightText, textAlign: 'center', marginTop: 2, lineHeight: 11 },
  scaleLabelSelected: { color: 'rgba(255,255,255,0.8)' },

  endLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  endLabel:  { fontSize: 11, color: ui.lightText },

  nextBtn: {
    backgroundColor: ui.primaryBlue,
    borderRadius: 28, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  nextBtnDisabled: { backgroundColor: ui.borderGray, shadowOpacity: 0 },
  nextBtnText:     { fontSize: 16, fontWeight: '700', color: '#fff' },
  nextBtnTextDisabled: { color: ui.lightText },
});
