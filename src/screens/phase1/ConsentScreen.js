import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';
import PhaseHeader from '../../components/PhaseHeader';

const CONSENT_ITEMS = [
  {
    id: 'voluntary',
    title: 'Voluntary Participation',
    desc: 'I understand that my participation is entirely voluntary and I may withdraw at any time without consequence.',
  },
  {
    id: 'privacy',
    title: 'Data Privacy',
    desc: 'I agree that my personal information will be handled with strict confidentiality and will not be shared with third parties.',
  },
  {
    id: 'storage',
    title: 'Secure Data Storage',
    desc: 'I consent to my data being stored securely using encrypted storage protocols.',
  },
  {
    id: 'nonClinical',
    title: 'Non-Clinical Usage',
    desc: 'I understand that RHIMS™ is not a clinical diagnostic tool and the results are for personal development purposes only.',
  },
  {
    id: 'research',
    title: 'Anonymous Research Usage',
    desc: 'I consent to my anonymised data being used for research to improve human intelligence mapping systems.',
  },
];

export default function ConsentScreen({ navigation }) {
  const [checked, setChecked] = useState({});

  function toggle(id) {
    setChecked(c => ({ ...c, [id]: !c[id] }));
  }

  const allChecked = CONSENT_ITEMS.every(item => checked[item.id]);

  async function handleAgree() {
    if (!allChecked) {
      Alert.alert('All Required', 'Please agree to all consent items to proceed.');
      return;
    }
    await storage.saveConsent(checked);
    navigation.replace('Phase2Intro');
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PhaseHeader phase={1} title="Informed Consent" subtitle="Please read and agree to all items" progress={0.5} />

        <View style={styles.secureBox}>
          <Text style={styles.secureEmoji}>🔒</Text>
          <Text style={styles.secureText}>Your data is safe, secure and confidential.</Text>
        </View>

        <View style={styles.items}>
          {CONSENT_ITEMS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, checked[item.id] && styles.itemChecked]}
              onPress={() => toggle(item.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, checked[item.id] && styles.checkboxChecked]}>
                {checked[item.id] && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <View style={styles.itemContent}>
                <Text style={[styles.itemTitle, checked[item.id] && styles.itemTitleChecked]}>
                  {item.title}
                </Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressLabel}>
              {Object.values(checked).filter(Boolean).length} / {CONSENT_ITEMS.length} agreed
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, {
                width: `${(Object.values(checked).filter(Boolean).length / CONSENT_ITEMS.length) * 100}%`
              }]} />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, !allChecked && styles.btnDisabled]}
            onPress={handleAgree}
            activeOpacity={0.8}
          >
            <View style={[styles.btnInner, !allChecked && styles.btnInnerDisabled]}>
              <Text style={[styles.btnText, !allChecked && styles.btnTextDisabled]}>
                I Agree – Start Assessment →
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ui.offWhite },
  secureBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.success + '15', borderColor: colors.success + '40',
    borderWidth: 1, borderRadius: 12, marginHorizontal: 20, padding: 14, marginBottom: 16,
  },
  secureEmoji: { fontSize: 20 },
  secureText: { fontSize: 13, color: colors.success, fontWeight: '600', flex: 1 },
  items: { paddingHorizontal: 20, gap: 10, paddingBottom: 10 },
  item: {
    backgroundColor: ui.white, borderRadius: 14,
    padding: 14, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    borderWidth: 1, borderColor: ui.borderGray,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  itemChecked: { borderColor: colors.success + '60', backgroundColor: colors.success + '08' },
  checkbox: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 2,
    borderColor: ui.borderGray, alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '800' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: ui.darkText, marginBottom: 4 },
  itemTitleChecked: { color: colors.success },
  itemDesc: { fontSize: 12, color: ui.midText, lineHeight: 18 },
  bottomArea: { padding: 20 },
  progressIndicator: { marginBottom: 16 },
  progressLabel: { fontSize: 12, color: ui.midText, marginBottom: 6, fontWeight: '600' },
  progressTrack: { height: 4, backgroundColor: ui.borderGray, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 2 },
  btn: { borderRadius: 14, overflow: 'hidden' },
  btnDisabled: { opacity: 0.6 },
  btnInner: { paddingVertical: 16, alignItems: 'center', borderRadius: 14, backgroundColor: ui.primaryBlue },
  btnInnerDisabled: { backgroundColor: ui.borderGray },
  btnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  btnTextDisabled: { color: ui.lightText },
});
