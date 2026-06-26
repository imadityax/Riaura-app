import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';

const TASKS = [
  { icon: '🎨', name: 'Stroop Test', domain: 'Attention', desc: 'Tap the correct ink color' },
  { icon: '🔢', name: 'N-Back Task', domain: 'Memory', desc: 'Match items from N steps back' },
  { icon: '⚡', name: 'Symbol Digit Matching', domain: 'Processing', desc: 'Speed-match symbols to digits' },
  { icon: '🔷', name: 'Matrix Reasoning', domain: 'Reasoning', desc: 'Find the missing pattern' },
  { icon: '⚖️', name: 'Situational Judgement', domain: 'Decision', desc: 'Choose the best response' },
  { icon: '😊', name: 'Emotion Recognition', domain: 'Emotional', desc: 'Name the emotion shown' },
  { icon: '💡', name: 'Alternative Uses Task', domain: 'Social & Originality', desc: 'Creative thinking challenge' },
  { icon: '🎯', name: 'Confidence Calibration', domain: 'Metacognitive', desc: 'Answer + rate your confidence' },
];

export default function Phase3IntroScreen({ route, navigation }) {
  const { phase2Answers } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={ui.primaryBlue} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseText}>PHASE 3</Text>
          </View>
          <Text style={styles.title}>RiAura Cognitive{'\n'}Performance Assessment</Text>
          <Text style={styles.sub}>
            Measure actual cognitive performance through interactive digital tasks.
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⏱</Text>
            <Text style={styles.infoVal}>30–35</Text>
            <Text style={styles.infoLbl}>Minutes</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>🎮</Text>
            <Text style={styles.infoVal}>8</Text>
            <Text style={styles.infoLbl}>Tasks</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>📊</Text>
            <Text style={styles.infoVal}>40</Text>
            <Text style={styles.infoLbl}>Max Score</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Assessment Tasks</Text>
        {TASKS.map((t, i) => (
          <View key={i} style={styles.taskRow}>
            <Text style={styles.taskIcon}>{t.icon}</Text>
            <View style={styles.taskInfo}>
              <Text style={styles.taskName}>{t.name}</Text>
              <Text style={styles.taskDomain}>{t.domain}</Text>
              <Text style={styles.taskDesc}>{t.desc}</Text>
            </View>
            <View style={styles.taskNum}>
              <Text style={styles.taskNumText}>{i + 1}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.replace('Task_Stroop', { phase2Answers, taskScores: [], taskIndex: 0 })}
          activeOpacity={0.8}
        >
          <View style={styles.btnInner}>
            <Text style={styles.btnText}>Begin Cognitive Tasks →</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ui.offWhite },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 20 },
  phaseBadge: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: colors.phase3 + '18', borderWidth: 1, borderColor: colors.phase3, marginBottom: 12,
  },
  phaseText: { color: colors.phase3, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '900', color: ui.darkText, textAlign: 'center', lineHeight: 32 },
  sub: { fontSize: 13, color: ui.midText, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  infoCard: {
    flex: 1, backgroundColor: ui.white, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  infoEmoji: { fontSize: 22 },
  infoVal: { fontSize: 18, fontWeight: '800', color: colors.phase3 },
  infoLbl: { fontSize: 11, color: ui.midText, fontWeight: '600' },
  sectionTitle: { fontSize: 14, color: ui.midText, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  taskRow: {
    backgroundColor: ui.white, borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  taskIcon: { fontSize: 24 },
  taskInfo: { flex: 1 },
  taskName: { color: ui.darkText, fontWeight: '700', fontSize: 13 },
  taskDomain: { color: colors.phase3, fontSize: 10, fontWeight: '600', marginVertical: 2 },
  taskDesc: { color: ui.midText, fontSize: 11 },
  taskNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.phase3 + '18', alignItems: 'center', justifyContent: 'center',
  },
  taskNumText: { color: colors.phase3, fontWeight: '800', fontSize: 12 },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  btnInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: ui.primaryBlue, borderRadius: 14 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backText: { fontSize: 15, fontWeight: '600', color: ui.primaryBlue, marginLeft: 2 },
});
