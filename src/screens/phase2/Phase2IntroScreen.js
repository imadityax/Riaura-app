import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, dark } from '../../theme/colors';
import { ui } from '../../theme/colors';
import { Emblem } from '../../components/VisualKit';
import { DOMAINS } from '../../data/phase2Questions';

export default function Phase2IntroScreen({ navigation }) {
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={dark.neon} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Emblem icon="clipboard-text-outline" size={68} style={{ marginBottom: 14 }} />
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseText}>PHASE 2</Text>
          </View>
          <Text style={styles.title}>WHO Psychometric{'\n'}Assessment</Text>
          <Text style={styles.sub}>
            Measure your psychological tendencies and self-reported intelligence behaviours.
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>⏱</Text>
            <Text style={styles.infoVal}>40 min</Text>
            <Text style={styles.infoLbl}>Duration</Text>
          </View>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="chart-box-outline" size={22} color={dark.neon} style={styles.infoEmoji} />
            <Text style={styles.infoVal}>8</Text>
            <Text style={styles.infoLbl}>Domains</Text>
          </View>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={22} color={dark.neon} style={styles.infoEmoji} />
            <Text style={styles.infoVal}>40</Text>
            <Text style={styles.infoLbl}>Questions</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Domains Covered</Text>
        {DOMAINS.map((d, i) => (
          <View key={i} style={styles.domainRow}>
            <View style={styles.domainNum}>
              <Text style={styles.domainNumText}>{i + 1}</Text>
            </View>
            <Text style={styles.domainName}>{d}</Text>
            <Text style={styles.domainQ}>5 Q</Text>
          </View>
        ))}

        <View style={styles.scaleInfo}>
          <Text style={styles.scaleTitle}>Likert Scale: 1 – 5</Text>
          <Text style={styles.scaleDesc}>Never  →  Rarely  →  Sometimes  →  Often  →  Always</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.replace('Phase2Questions', { domainIndex: 0, answers: [] })} activeOpacity={0.8}>
          <View style={styles.btnInner}>
            <Text style={styles.btnText}>Begin Assessment →</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: dark.bgSolid },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  phaseBadge: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: colors.phase2 + '18', borderWidth: 1, borderColor: colors.phase2,
    marginBottom: 12, marginTop: 20,
  },
  phaseText: { color: colors.phase2, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '900', color: '#1E1B33', textAlign: 'center', lineHeight: 32 },
  sub: { fontSize: 13, color: dark.textSub, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  infoCard: {
    flex: 1, backgroundColor: dark.glass, borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  infoEmoji: {},
  infoVal: { fontSize: 20, fontWeight: '800', color: dark.neon },
  infoLbl: { fontSize: 11, color: dark.textSub, fontWeight: '600' },
  sectionTitle: { fontSize: 14, color: dark.textSub, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  domainRow: {
    backgroundColor: dark.glass, borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    borderWidth: 1, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  domainNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.phase2 + '20', alignItems: 'center', justifyContent: 'center',
  },
  domainNumText: { color: colors.phase2, fontWeight: '800', fontSize: 13 },
  domainName: { flex: 1, color: '#1E1B33', fontSize: 13, fontWeight: '600' },
  domainQ: { color: dark.textMute, fontSize: 11, fontWeight: '600' },
  scaleInfo: {
    backgroundColor: dark.glass, borderRadius: 12, padding: 14, marginVertical: 16, alignItems: 'center',
  },
  scaleTitle: { color: dark.neon, fontWeight: '700', fontSize: 13, marginBottom: 4 },
  scaleDesc: { color: dark.textSub, fontSize: 11 },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  btnInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: dark.neon, borderRadius: 14 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backText: { fontSize: 15, fontWeight: '600', color: dark.neon, marginLeft: 2 },
});
