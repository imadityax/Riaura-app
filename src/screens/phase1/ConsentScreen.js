import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, ui, dark } from '../../theme/colors';
import { storage } from '../../utils/storage';
import { rf, scale, ms } from '../../utils/responsive';
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

export default function ConsentScreen({ navigation, route }) {
  const isMinor = route?.params?.isMinor ?? false;
  const parentName = route?.params?.parentName;

  // For minors, add a dedicated parent/guardian consent item on top of the
  // standard informed-consent list.
  const items = isMinor
    ? [
        {
          id: 'guardian',
          title: 'Parent / Guardian Consent',
          desc: parentName
            ? `As parent/guardian (${parentName}), I confirm my consent for this minor to participate in the RHIMS™ assessment.`
            : 'As the parent/guardian, I confirm my consent for this minor to participate in the RHIMS™ assessment.',
        },
        ...CONSENT_ITEMS,
      ]
    : CONSENT_ITEMS;

  const [checked, setChecked] = useState({});

  function handleBack() {
    navigation.goBack();
  }

  function toggle(id) {
    setChecked(c => ({ ...c, [id]: !c[id] }));
  }

  const agreedCount = items.filter(item => checked[item.id]).length;
  const allChecked = agreedCount === items.length;

  async function handleAgree() {
    if (!allChecked) {
      Alert.alert('All Required', 'Please agree to all consent items to proceed.');
      return;
    }
    await storage.saveConsent({ ...checked, isMinor });
    navigation.replace('Phase2Intro');
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <PhaseHeader phase={1} title="Informed Consent" subtitle="Please read and agree to all items" progress={0.5} onBack={handleBack} />

        <View style={styles.secureBox}>
          <MaterialCommunityIcons name="lock-outline" size={scale(20)} color={dark.neon} />
          <Text style={styles.secureText}>Your data is safe, secure and confidential.</Text>
        </View>

        <View style={styles.items}>
          {items.map(item => {
            const on = !!checked[item.id];
            const guardian = item.id === 'guardian';
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.item, on && styles.itemChecked, guardian && styles.itemGuardian]}
                onPress={() => toggle(item.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, on && styles.checkboxChecked]}>
                  {on && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={styles.itemContent}>
                  <Text style={[styles.itemTitle, on && styles.itemTitleChecked]}>
                    {item.title}
                  </Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomArea}>
          <View style={styles.progressIndicator}>
            <Text style={styles.progressLabel}>
              {agreedCount} / {items.length} agreed
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(agreedCount / items.length) * 100}%` }]} />
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
  container: { flex: 1, backgroundColor: dark.bgSolid },
  scrollContent: { paddingBottom: scale(20) },
  secureBox: {
    flexDirection: 'row', alignItems: 'center', gap: scale(10),
    backgroundColor: colors.success + '15', borderColor: colors.success + '40',
    borderWidth: 1, borderRadius: 12, marginHorizontal: scale(20), padding: scale(14), marginBottom: ms(16),
  },
  secureText: { fontSize: rf(13), color: colors.success, fontWeight: '600', flex: 1 },
  items: { paddingHorizontal: scale(20), gap: scale(10), paddingBottom: ms(10) },
  item: {
    backgroundColor: dark.glass, borderRadius: 14,
    padding: scale(14), flexDirection: 'row', gap: scale(12), alignItems: 'flex-start',
    borderWidth: 1, borderColor: dark.glassBorder,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  itemChecked: { borderColor: colors.success + '60', backgroundColor: colors.success + '08' },
  itemGuardian: { borderColor: dark.neon + '55', backgroundColor: dark.neon + '08' },
  checkbox: {
    width: scale(24), height: scale(24), borderRadius: 7, borderWidth: 2,
    borderColor: dark.glassBorder, alignItems: 'center', justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  checkMark: { color: '#fff', fontSize: rf(14), fontWeight: '800' },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: rf(14), fontWeight: '700', color: '#1E1B33', marginBottom: ms(4) },
  itemTitleChecked: { color: colors.success },
  itemDesc: { fontSize: rf(12), color: dark.textSub, lineHeight: rf(18) },
  bottomArea: { padding: scale(20) },
  progressIndicator: { marginBottom: ms(16) },
  progressLabel: { fontSize: rf(12), color: dark.textSub, marginBottom: ms(6), fontWeight: '600' },
  progressTrack: { height: 4, backgroundColor: dark.glassBorder, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 2 },
  btn: { borderRadius: 14, overflow: 'hidden' },
  btnDisabled: { opacity: 0.6 },
  btnInner: { paddingVertical: ms(16), alignItems: 'center', borderRadius: 14, backgroundColor: dark.neon },
  btnInnerDisabled: { backgroundColor: dark.glassBorder },
  btnText: { fontSize: rf(16), fontWeight: '800', color: '#fff' },
  btnTextDisabled: { color: dark.textMute },
});
