import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';
import { DOMAINS } from '../../data/phase2Questions';

export default function Phase2IntroScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color={ui.primaryBlue} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
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
            <Text style={styles.infoEmoji}>📊</Text>
            <Text style={styles.infoVal}>8</Text>
            <Text style={styles.infoLbl}>Domains</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoEmoji}>📝</Text>
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
  container: { flex: 1, backgroundColor: ui.offWhite },
  content: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 24 },
  phaseBadge: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
    backgroundColor: colors.phase2 + '18', borderWidth: 1, borderColor: colors.phase2,
    marginBottom: 12, marginTop: 20,
  },
  phaseText: { color: colors.phase2, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title: { fontSize: 26, fontWeight: '900', color: ui.darkText, textAlign: 'center', lineHeight: 32 },
  sub: { fontSize: 13, color: ui.midText, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  infoCard: {
    flex: 1, backgroundColor: ui.white, borderRadius: 14,
    padding: 14, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  infoEmoji: { fontSize: 22 },
  infoVal: { fontSize: 20, fontWeight: '800', color: ui.primaryBlue },
  infoLbl: { fontSize: 11, color: ui.midText, fontWeight: '600' },
  sectionTitle: { fontSize: 14, color: ui.midText, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  domainRow: {
    backgroundColor: ui.white, borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8,
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  domainNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.phase2 + '20', alignItems: 'center', justifyContent: 'center',
  },
  domainNumText: { color: colors.phase2, fontWeight: '800', fontSize: 13 },
  domainName: { flex: 1, color: ui.darkText, fontSize: 13, fontWeight: '600' },
  domainQ: { color: ui.lightText, fontSize: 11, fontWeight: '600' },
  scaleInfo: {
    backgroundColor: ui.challengeBg, borderRadius: 12, padding: 14, marginVertical: 16, alignItems: 'center',
  },
  scaleTitle: { color: ui.primaryBlue, fontWeight: '700', fontSize: 13, marginBottom: 4 },
  scaleDesc: { color: ui.midText, fontSize: 11 },
  btn: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  btnInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: ui.primaryBlue, borderRadius: 14 },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backText: { fontSize: 15, fontWeight: '600', color: ui.primaryBlue, marginLeft: 2 },
});
