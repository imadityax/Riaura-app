import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, dark } from '../../theme/colors';
import { ui } from '../../theme/colors';
import { Emblem } from '../../components/VisualKit';
import NeuralLinesBg from '../../components/NeuralLinesBg';

const TASKS = [
  { icon: 'palette-outline', name: 'Stroop Test', domain: 'Attention', desc: 'Tap the correct ink color' },
  { icon: 'numeric', name: 'N-Back Task', domain: 'Memory', desc: 'Match items from N steps back' },
  { icon: 'lightning-bolt-outline', name: 'Symbol Digit Matching', domain: 'Processing', desc: 'Speed-match symbols to digits' },
  { icon: 'shape-outline', name: 'Matrix Reasoning', domain: 'Reasoning', desc: 'Find the missing pattern' },
  { icon: 'scale-balance', name: 'Situational Judgement', domain: 'Decision', desc: 'Choose the best response' },
  { icon: 'emoticon-happy-outline', name: 'Emotion Recognition', domain: 'Emotional', desc: 'Name the emotion shown' },
  { icon: 'lightbulb-outline', name: 'Alternative Uses Task', domain: 'Social & Originality', desc: 'Creative thinking challenge' },
  { icon: 'target', name: 'Confidence Calibration', domain: 'Metacognitive', desc: 'Answer + rate your confidence' },
];

export default function Phase3IntroScreen({ route, navigation }) {
  const { phase2Answers } = route.params || {};

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <NeuralLinesBg />
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={dark.neon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Emblem icon="brain" size={68} colors={[colors.phase3, '#C0392B']} style={{ marginBottom: 14 }} />
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
            <MaterialCommunityIcons name="timer-outline" size={22} color={dark.neon} style={styles.infoEmoji} />
            <Text style={styles.infoVal}>30–35</Text>
            <Text style={styles.infoLbl}>Minutes</Text>
          </View>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="gamepad-variant-outline" size={22} color={dark.neon} style={styles.infoEmoji} />
            <Text style={styles.infoVal}>8</Text>
            <Text style={styles.infoLbl}>Tasks</Text>
          </View>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="chart-box-outline" size={22} color={dark.neon} style={styles.infoEmoji} />
            <Text style={styles.infoVal}>40</Text>
            <Text style={styles.infoLbl}>Max Score</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Assessment Tasks</Text>
        {TASKS.map((t, i) => (
          <View key={i} style={styles.taskRow}>
            <MaterialCommunityIcons name={t.icon} size={22} color={dark.neon} style={styles.taskIcon} />
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

        <Text style={styles.sectionTitle}>Early Childhood · Ages 3–6</Text>
        <TouchableOpacity
          style={styles.gameCard}
          onPress={() => navigation.navigate('Task_FireflyFreeze', { phase2Answers, phase2Score: route.params?.phase2Score })}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="butterfly-outline" size={26} color={colors.phase3} style={styles.taskIcon} />
          <View style={styles.taskInfo}>
            <Text style={styles.gameName}>The Firefly Freeze</Text>
            <Text style={styles.taskDomain}>Attention · Response Inhibition</Text>
            <Text style={styles.taskDesc}>Catch fireflies · freeze on the owl · a playful Go/No-Go game</Text>
          </View>
          <Ionicons name="play-circle" size={30} color={colors.phase3} />
        </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: dark.bgSolid },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24, marginTop: 20 },
  phaseBadge: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: colors.phase3 + '18', borderWidth: 1, borderColor: colors.phase3, marginBottom: 12,
  },
  phaseText: { color: colors.phase3, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '900', color: dark.text, textAlign: 'center', lineHeight: 32 },
  sub: { fontSize: 13, color: dark.textSub, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  infoCard: {
    flex: 1, backgroundColor: dark.glass, borderRadius: 14, padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  infoEmoji: {},
  infoVal: { fontSize: 18, fontWeight: '800', color: colors.phase3 },
  infoLbl: { fontSize: 11, color: dark.textSub, fontWeight: '600' },
  sectionTitle: { fontSize: 14, color: dark.textSub, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  taskRow: {
    backgroundColor: dark.glass, borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    borderWidth: 1, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  taskIcon: { marginRight: 2 },
  taskInfo: { flex: 1 },
  taskName: { color: dark.text, fontWeight: '700', fontSize: 13 },
  taskDomain: { color: colors.phase3, fontSize: 10, fontWeight: '600', marginVertical: 2 },
  taskDesc: { color: dark.textSub, fontSize: 11 },
  taskNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.phase3 + '18', alignItems: 'center', justifyContent: 'center',
  },
  taskNumText: { color: colors.phase3, fontWeight: '800', fontSize: 12 },
  gameCard: {
    backgroundColor: colors.phase3 + '10', borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    borderWidth: 1.5, borderColor: colors.phase3 + '55',
  },
  gameName: { color: dark.text, fontWeight: '800', fontSize: 15 },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  btnInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: dark.neon, borderRadius: 14 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backText: { fontSize: 15, fontWeight: '600', color: dark.neon, marginLeft: 2 },
});
