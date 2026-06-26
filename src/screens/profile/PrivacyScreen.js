import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ui } from '../../theme/colors';

const SECTIONS = [
  {
    icon: '📊',
    title: 'Data We Collect',
    body: 'We collect your registration information (name, email, age, gender), assessment responses, cognitive task scores, and mindfulness scores. No biometric data or sensitive payment information is stored locally.',
  },
  {
    icon: '🔍',
    title: 'How We Use Your Data',
    body: 'Your data powers your intelligence profile, personalized career recommendations, and growth tracking. We never sell your data to third parties or use it for advertising.',
  },
  {
    icon: '☁️',
    title: 'Data Storage & Security',
    body: 'Assessment scores are stored locally on your device. Your account credentials are secured through Firebase Authentication using industry-standard AES-256 encryption and TLS in transit.',
  },
  {
    icon: '⚖️',
    title: 'Your Rights',
    body: 'You may access, correct, or delete your data at any time. Use "Reset All Assessment Data" in Settings to erase scores. To fully delete your account, contact us at privacy@riaura.app.',
  },
  {
    icon: '🍪',
    title: 'Cookies & Analytics',
    body: 'The app uses anonymous crash reporting to improve stability. No third-party advertising cookies or cross-app trackers are used.',
  },
  {
    icon: '✉️',
    title: 'Contact Us',
    body: 'For privacy concerns, data requests, or to exercise your rights, email us at privacy@riaura.app. We aim to respond within 48 business hours.',
  },
];

export default function PrivacyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={ui.darkText} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Privacy & Security</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <View style={styles.heroBanner}>
          <Text style={styles.heroIcon}>🛡️</Text>
          <Text style={styles.heroTitle}>Your Privacy Matters</Text>
          <Text style={styles.heroSub}>
            RiAura is built on transparency. Here's exactly what we collect, how we use it, and the control you have.
          </Text>
        </View>

        {SECTIONS.map((s, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.cardIcon}>{s.icon}</Text>
              <Text style={styles.cardTitle}>{s.title}</Text>
            </View>
            <Text style={styles.cardBody}>{s.body}</Text>
          </View>
        ))}

        <Text style={styles.footer}>Last updated: June 2025 · RiAura RHIMS v1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: ui.offWhite },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: ui.white, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  pageTitle: { fontSize: 17, fontWeight: '800', color: ui.darkText },

  heroBanner: {
    backgroundColor: '#EFF6FF', borderRadius: 20, padding: 24,
    alignItems: 'center', marginTop: 4, marginBottom: 20,
  },
  heroIcon:  { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 18, fontWeight: '900', color: ui.darkText, marginBottom: 8 },
  heroSub:   { fontSize: 13, color: ui.midText, textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: ui.white, borderRadius: 18, padding: 18, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  cardHead:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardIcon:  { fontSize: 20 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: ui.darkText },
  cardBody:  { fontSize: 13, color: ui.midText, lineHeight: 20 },

  footer: { fontSize: 11, color: ui.lightText, textAlign: 'center', marginTop: 8, marginBottom: 10 },
});
