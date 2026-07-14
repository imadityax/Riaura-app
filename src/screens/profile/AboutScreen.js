import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ui, dark } from '../../theme/colors';
import BrainIcon from '../../components/BrainIcon';

const PHASES = [
  { icon: 'account-check-outline', title: 'Phase 1 · Registration & Consent', desc: 'Create your profile and consent to the research-grade assessment protocol.' },
  { icon: 'meditation',            title: 'Mindfulness Assessment',            desc: 'Eight intelligence domains measured with validated instruments (FFMQ, PRMQ, GDMS, MAI and more), adapted to your age group.' },
  { icon: 'clipboard-text-outline', title: 'Phase 2 · WHO Psychometric',       desc: '40 Likert items covering psychological functioning across 8 domains.' },
  { icon: 'gamepad-variant-outline', title: 'Phase 3 · Cognitive Tasks',       desc: 'Eight interactive brain tasks — Stroop, N-Back, matrix reasoning, emotion recognition and more — measuring live cognitive performance.' },
  { icon: 'account-tie-voice-outline', title: 'Phase 4 · Expert Interview',    desc: 'A 1-on-1 video interview with a cognitive assessment specialist completes your profile.' },
  { icon: 'chart-box-outline',     title: 'Human Intelligence Index',          desc: 'All phases combine into one HII score with a personalised development roadmap.' },
];

export default function AboutScreen({ navigation }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={'#1E1B33'} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>About RHIMS</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <LinearGradient colors={[ui.blueGradStart, ui.blueGradEnd]} style={styles.hero}>
          <View style={styles.heroIconBg}>
            <BrainIcon size={34} color="#fff" strokeWidth={2} />
          </View>
          <Text style={styles.brand}>RiAura RHIMS™</Text>
          <Text style={styles.heroSub}>Human Intelligence Mapping System</Text>
          <Text style={styles.heroTag}>Beyond Awakening</Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our Mission</Text>
          <Text style={styles.cardBody}>
            Intelligence is not one number. RHIMS maps the full landscape of your mind — attention,
            memory, processing, reasoning, decision-making, emotional intelligence, originality and
            metacognition — using clinically validated science, so you can grow the mind you actually have.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>THE JOURNEY</Text>
        {PHASES.map((p, i) => (
          <View key={i} style={styles.phaseCard}>
            <View style={styles.phaseIconBg}>
              <MaterialCommunityIcons name={p.icon} size={20} color={dark.neon} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.phaseTitle}>{p.title}</Text>
              <Text style={styles.phaseDesc}>{p.desc}</Text>
            </View>
          </View>
        ))}

        <View style={styles.footerCard}>
          <Text style={styles.footerLine}>Version 1.0.0 · Build 2025.06</Text>
          <Text style={styles.footerLine}>Class 1 Operational Architecture</Text>
          <Text style={styles.footerCopy}>© 2026 RiAura. All rights reserved.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: dark.bgSolid },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: dark.glass, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  pageTitle: { fontSize: 17, fontWeight: '800', color: '#1E1B33' },

  hero: {
    borderRadius: 22, alignItems: 'center', paddingVertical: 28, paddingHorizontal: 20,
    marginTop: 8,
  },
  heroIconBg: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },
  brand:   { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  heroTag: { fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.6)', marginTop: 10, fontWeight: '700' },

  card: {
    backgroundColor: dark.glass, borderRadius: 18, padding: 18, marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#1E1B33', marginBottom: 8 },
  cardBody:  { fontSize: 13.5, color: dark.textSub, lineHeight: 21 },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: dark.textMute,
    letterSpacing: 1.5, marginTop: 24, marginBottom: 10,
  },
  phaseCard: {
    flexDirection: 'row', gap: 12, backgroundColor: dark.glass,
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: dark.glassBorder,
  },
  phaseIconBg: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: dark.glass,
    alignItems: 'center', justifyContent: 'center',
  },
  phaseTitle: { fontSize: 13.5, fontWeight: '800', color: '#1E1B33' },
  phaseDesc:  { fontSize: 12.5, color: dark.textSub, lineHeight: 18, marginTop: 3 },

  footerCard: { alignItems: 'center', marginTop: 24 },
  footerLine: { fontSize: 12, color: dark.textSub, marginBottom: 3 },
  footerCopy: { fontSize: 11, color: dark.textMute, marginTop: 6 },
});
