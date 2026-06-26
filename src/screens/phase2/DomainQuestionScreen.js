import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';
import { DOMAINS, phase2Questions, LIKERT_LABELS } from '../../data/phase2Questions';
import PhaseHeader from '../../components/PhaseHeader';
import { storage } from '../../utils/storage';
import { savePhase2DataToCloud } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';

export default function DomainQuestionScreen({ route, navigation }) {
  const { domainIndex, answers: prevAnswers } = route.params;
  const questions = phase2Questions[domainIndex];
  const [ratings, setRatings] = useState(Array(5).fill(0));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { currentUser } = useAuth();

  function handleBack() {
    Alert.alert(
      'Exit Assessment?',
      'Your progress so far is saved locally. You can resume later.',
      [
        { text: 'Stay', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Main') },
      ]
    );
  }

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [domainIndex]);

  function setRating(qIdx, val) {
    setRatings(r => { const n = [...r]; n[qIdx] = val; return n; });
  }

  const allAnswered = ratings.every(r => r > 0);
  const totalDomains = DOMAINS.length;
  const progress = (domainIndex + 1) / totalDomains;

  async function handleNext() {
    if (!allAnswered) return;
    const newAnswers = [...prevAnswers, ...ratings];
    await storage.savePhase2Answers(newAnswers, domainIndex + 1);

    if (domainIndex + 1 < totalDomains) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        navigation.replace('Phase2Questions', { domainIndex: domainIndex + 1, answers: newAnswers });
      });
    } else {
      if (currentUser) {
        savePhase2DataToCloud(currentUser.uid, newAnswers, domainIndex + 1).catch(() => {});
      }
      navigation.replace('Phase3Intro', { phase2Answers: newAnswers });
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PhaseHeader
          phase={2}
          title={DOMAINS[domainIndex]}
          subtitle={`Domain ${domainIndex + 1} of ${totalDomains}`}
          progress={progress}
          onBack={handleBack}
        />

        <Animated.View style={{ opacity: fadeAnim, padding: 20 }}>
          {questions.map((q, qi) => (
            <View key={qi} style={styles.qCard}>
              <Text style={styles.qNum}>Q{qi + 1}</Text>
              <Text style={styles.qText}>{q}</Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map(val => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.ratingBtn, ratings[qi] === val && styles.ratingSelected]}
                    onPress={() => setRating(qi, val)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.ratingNum, ratings[qi] === val && styles.ratingNumSelected]}>
                      {val}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.labelRow}>
                <Text style={styles.labelText}>{LIKERT_LABELS[0]}</Text>
                <Text style={styles.labelText}>{LIKERT_LABELS[4]}</Text>
              </View>
              {ratings[qi] > 0 && (
                <Text style={styles.selectedLabel}>
                  → {LIKERT_LABELS[ratings[qi] - 1]}
                </Text>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, !allAnswered && styles.btnDisabled]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <View style={[styles.btnInner, !allAnswered && styles.btnInnerDisabled]}>
              <Text style={[styles.btnText, !allAnswered && styles.btnTextDisabled]}>
                {domainIndex + 1 < totalDomains
                  ? `Next Domain: ${DOMAINS[domainIndex + 1]} →`
                  : 'Complete Phase 2 →'}
              </Text>
            </View>
          </TouchableOpacity>

          {!allAnswered && (
            <Text style={styles.hint}>Please answer all {5 - ratings.filter(r => r > 0).length} remaining questions</Text>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ui.offWhite },
  qCard: {
    backgroundColor: ui.white, borderRadius: 16,
    padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  qNum: { fontSize: 11, color: colors.phase2, fontWeight: '700', marginBottom: 6, letterSpacing: 0.5 },
  qText: { fontSize: 14, color: ui.darkText, lineHeight: 20, fontWeight: '500', marginBottom: 14 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  ratingBtn: {
    flex: 1, height: 40, borderRadius: 10,
    backgroundColor: ui.inputBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: ui.borderGray,
  },
  ratingSelected: { backgroundColor: colors.phase2 + '20', borderColor: colors.phase2 },
  ratingNum: { fontSize: 16, fontWeight: '700', color: ui.midText },
  ratingNumSelected: { color: colors.phase2 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  labelText: { fontSize: 10, color: ui.lightText },
  selectedLabel: { fontSize: 11, color: colors.phase2, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  btnDisabled: { opacity: 0.5 },
  btnInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: ui.primaryBlue, borderRadius: 14 },
  btnInnerDisabled: { backgroundColor: ui.borderGray },
  btnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  btnTextDisabled: { color: ui.lightText },
  hint: { textAlign: 'center', color: ui.lightText, fontSize: 12, marginTop: 8 },
});
