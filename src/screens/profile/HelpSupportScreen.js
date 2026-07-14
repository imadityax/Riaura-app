import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ui, dark } from '../../theme/colors';

const FAQS = [
  {
    q: 'What is the RHIMS assessment?',
    a: 'RHIMS (RiAura Human Intelligence Mapping System) measures your intelligence across 8 science-backed domains using validated frameworks. It combines a mindfulness self-assessment, the WHO psychometric, 8 cognitive tasks and an expert interview into one Human Intelligence Index.',
  },
  {
    q: 'How long does the full assessment take?',
    a: 'The mindfulness domains take a few minutes each, the WHO psychometric about 20 minutes, and the cognitive tasks 30–35 minutes. You can complete everything at your own pace — progress is saved after every step.',
  },
  {
    q: 'Are my answers private?',
    a: 'Yes. Your responses are stored securely against your account and are never shared with third parties. See Privacy & Security in your profile for full details.',
  },
  {
    q: 'Can I retake an assessment?',
    a: 'Yes. You can retake any mindfulness domain from the Assess tab, and cognitive tasks from the Brain Challenge card on Home. Your latest result replaces the previous one.',
  },
  {
    q: 'Why do questions change with my age group?',
    a: 'Each age group uses a clinically validated instrument appropriate for that stage of development — for example FFMQ for adults and C-OMM for young children — so your score is compared against the right framework.',
  },
  {
    q: 'What is the streak flame on the Home screen?',
    a: 'It counts consecutive days you have opened RHIMS. Daily engagement builds the habit loop that mindfulness training depends on — keep it alive!',
  },
  {
    q: 'How do I book my expert interview?',
    a: 'Phase 4 unlocks once you finish the earlier phases. You will then be able to pick an interviewer, day and time slot from the booking screen, and the video-call link arrives by email.',
  },
  {
    q: 'I found a bug or wrong score. What do I do?',
    a: 'Email us using the Contact Support button below with a short description and a screenshot if possible. We usually respond within 24 hours.',
  },
];

const SUPPORT_EMAIL = 'hi@aaruchudar.com';

export default function HelpSupportScreen({ navigation }) {
  const [open, setOpen] = useState(null);

  function contactSupport() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=RHIMS%20Support%20Request`).catch(() => {});
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={'#1E1B33'} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.heroCard}>
          <MaterialCommunityIcons name="lifebuoy" size={34} color={dark.neon} />
          <Text style={styles.heroTitle}>How can we help?</Text>
          <Text style={styles.heroSub}>Browse common questions below, or reach us directly — we reply within 24 hours.</Text>
        </View>

        <Text style={styles.sectionLabel}>FREQUENTLY ASKED</Text>
        {FAQS.map((f, i) => (
          <TouchableOpacity
            key={i}
            style={styles.faqCard}
            onPress={() => setOpen(open === i ? null : i)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHead}>
              <Text style={styles.faqQ}>{f.q}</Text>
              <Ionicons
                name={open === i ? 'chevron-up' : 'chevron-down'}
                size={17}
                color={dark.textSub}
              />
            </View>
            {open === i && <Text style={styles.faqA}>{f.a}</Text>}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionLabel}>STILL STUCK?</Text>
        <TouchableOpacity style={styles.contactBtn} onPress={contactSupport} activeOpacity={0.85}>
          <MaterialCommunityIcons name="email-outline" size={19} color="#fff" />
          <Text style={styles.contactText}>Contact Support</Text>
        </TouchableOpacity>
        <Text style={styles.contactHint}>{SUPPORT_EMAIL}</Text>

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

  heroCard: {
    backgroundColor: dark.glass, borderRadius: 20, padding: 22, alignItems: 'center',
    marginTop: 8, marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: '#1E1B33', marginTop: 10 },
  heroSub:   { fontSize: 13, color: dark.textSub, textAlign: 'center', marginTop: 6, lineHeight: 19 },

  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: dark.textMute,
    letterSpacing: 1.5, marginTop: 22, marginBottom: 10,
  },
  faqCard: {
    backgroundColor: dark.glass, borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: dark.glassBorder,
  },
  faqHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  faqQ:    { flex: 1, fontSize: 14, fontWeight: '700', color: '#1E1B33' },
  faqA:    { fontSize: 13, color: dark.textSub, lineHeight: 20, marginTop: 10 },

  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: dark.neon, borderRadius: 28, paddingVertical: 15,
    shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  contactText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  contactHint: { fontSize: 12, color: dark.textMute, textAlign: 'center', marginTop: 10 },
});
