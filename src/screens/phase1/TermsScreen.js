import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ui, dark } from '../../theme/colors';
import { rf, scale, ms } from '../../utils/responsive';

const SECTIONS = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account and using the RiAura / RHIMS™ application, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the app.',
  },
  {
    title: '2. Eligibility & Minors',
    body: 'You must be at least 18 years old to register on your own. If you are under 18, a parent or legal guardian must provide their details and give explicit consent for your participation. By continuing, the parent/guardian confirms they have the legal authority to consent on the minor\'s behalf.',
  },
  {
    title: '3. Nature of the Assessment',
    body: 'RHIMS™ is a self-development and human-intelligence mapping tool. It is NOT a medical or clinical diagnostic instrument. Results are provided for personal insight and growth only and should not be treated as professional psychological or medical advice.',
  },
  {
    title: '4. Data Privacy & Security',
    body: 'We collect the personal information you provide (including a minor\'s parent/guardian details where applicable) to deliver and personalise the assessment. Your data is stored securely using encrypted protocols and is never sold to third parties. Anonymised data may be used to improve our systems.',
  },
  {
    title: '5. Your Responsibilities',
    body: 'You agree to provide accurate and truthful information, including an accurate date of birth. You are responsible for keeping your account credentials confidential and for all activity under your account.',
  },
  {
    title: '6. Voluntary Participation',
    body: 'Participation is entirely voluntary. You may stop the assessment or request deletion of your data at any time without penalty.',
  },
  {
    title: '7. Intellectual Property',
    body: 'All content, methodology, scoring models and branding within RHIMS™ / RiAura are the intellectual property of their respective owners and may not be copied or redistributed without permission.',
  },
  {
    title: '8. Limitation of Liability',
    body: 'To the maximum extent permitted by law, we are not liable for any decisions made based on assessment results. The service is provided "as is" without warranties of any kind.',
  },
  {
    title: '9. Changes to These Terms',
    body: 'We may update these Terms from time to time. Continued use of the app after changes take effect constitutes acceptance of the revised Terms.',
  },
  {
    title: '10. Contact',
    body: 'For any questions about these Terms, your data, or to exercise your privacy rights, please reach out to our support team through the Help & Support section of the app.',
  },
];

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="chevron-back" size={scale(24)} color={dark.neon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms &amp; Conditions</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.intro}>
          Please read these terms carefully before using the RiAura / RHIMS™ assessment.
        </Text>

        {SECTIONS.map(s => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

        <Text style={styles.updated}>Last updated: July 2026</Text>

        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Text style={styles.doneText}>Got it</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: dark.bgSolid },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: scale(16), paddingVertical: ms(12),
    backgroundColor: dark.glass, borderBottomWidth: 1, borderBottomColor: dark.glassBorder,
  },
  backBtn: { width: scale(40), height: scale(32), justifyContent: 'center' },
  headerTitle: { fontSize: rf(17), fontWeight: '800', color: '#1E1B33' },
  content: { paddingHorizontal: scale(20), paddingVertical: ms(20), paddingBottom: scale(48) },
  intro: { fontSize: rf(13), color: dark.textSub, lineHeight: rf(20), marginBottom: ms(20) },
  section: { marginBottom: ms(18) },
  sectionTitle: { fontSize: rf(14.5), fontWeight: '800', color: '#1E1B33', marginBottom: ms(6) },
  sectionBody: { fontSize: rf(13), color: dark.textSub, lineHeight: rf(21) },
  updated: { fontSize: rf(11.5), color: dark.textMute, fontStyle: 'italic', marginTop: ms(4), marginBottom: ms(24) },
  doneBtn: {
    backgroundColor: dark.neon, borderRadius: 14, paddingVertical: ms(15), alignItems: 'center',
  },
  doneText: { fontSize: rf(15), fontWeight: '800', color: '#fff' },
});
