import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';

const ASSESSMENTS = [
  {
    id: 'mindfulness',
    num: 1,
    title: 'Mindfulness Assessment',
    desc: 'Age-calibrated mindfulness & attention awareness questionnaire (C-OMM / S-CAMM / MAAS-A / FFMQ)',
    duration: '5–10 min',
    questions: 'Up to 15 questions',
    color: '#7C3AED',
    icon: '🧘',
    route: 'MindfulnessAssess',
  },
  {
    id: 'cognitive',
    num: 2,
    title: 'Cognitive Tasks',
    desc: 'Eight interactive cognitive challenges measuring working memory, reasoning, processing speed, and more.',
    duration: '20–30 min',
    questions: '8 tasks',
    color: ui.primaryBlue,
    icon: '⚡',
    route: 'Phase3Intro',
  },
  {
    id: 'psychometric',
    num: 3,
    title: 'WHO Psychometric',
    desc: 'Eight-domain psychometric scale measuring key aspects of human intelligence and behavior.',
    duration: '10–15 min',
    questions: '40 questions',
    color: '#059669',
    icon: '🔬',
    route: 'Phase2Intro',
  },
];

export default function AssessScreen({ navigation }) {
  const [doneMap, setDoneMap] = useState({});

  useEffect(() => {
    (async () => {
      const ms  = await storage.getMindfulnessScore();
      const p3  = await storage.getPhase3Scores();
      const p2  = await storage.getPhase2Answers();
      setDoneMap({
        mindfulness:  !!ms,
        cognitive:    p3.scores.length > 0,
        psychometric: p2.answers.length >= 40,
      });
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 20, gap: 16 }}
      >
        <Text style={styles.pageTitle}>Assessments</Text>
        <Text style={styles.pageSub}>Complete all assessments to unlock your full intelligence profile.</Text>

        {ASSESSMENTS.map(a => {
          const done = doneMap[a.id];
          return (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.iconBg, { backgroundColor: a.color + '18' }]}>
                  <Text style={styles.iconEmoji}>{a.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <View style={[styles.numBadge, { backgroundColor: a.color + '18' }]}>
                      <Text style={[styles.numText, { color: a.color }]}>#{a.num}</Text>
                    </View>
                    {done && (
                      <View style={styles.doneBadge}>
                        <Text style={styles.doneBadgeText}>✓ Done</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardTitle}>{a.title}</Text>
                </View>
              </View>

              <Text style={styles.cardDesc}>{a.desc}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>⏱ {a.duration}</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>📋 {a.questions}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.startBtn, done && styles.retakeBtn, { borderColor: a.color }]}
                onPress={() => navigation.navigate(a.route, {})}
                activeOpacity={0.85}
              >
                <View style={[styles.startBtnInner, done ? { backgroundColor: 'transparent' } : { backgroundColor: a.color }]}>
                  <Text style={[styles.startBtnText, done && { color: a.color }]}>
                    {done ? 'Retake Assessment →' : 'Start Assessment →'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={{ height: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: ui.offWhite },
  scroll:   { flex: 1 },
  pageTitle:{ fontSize: 22, fontWeight: '900', color: ui.darkText },
  pageSub:  { fontSize: 13, color: ui.midText, lineHeight: 18, marginTop: 4 },

  card: {
    backgroundColor: ui.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTop:  { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 12 },
  iconBg:   { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconEmoji:{ fontSize: 22 },
  titleRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 6 },
  numBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  numText:  { fontSize: 11, fontWeight: '800' },
  doneBadge: { backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  doneBadgeText: { fontSize: 11, fontWeight: '700', color: '#065F46' },
  cardTitle:{ fontSize: 16, fontWeight: '800', color: ui.darkText, lineHeight: 20 },
  cardDesc: { fontSize: 13, color: ui.midText, lineHeight: 18, marginBottom: 14 },

  metaRow:  { flexDirection: 'row', gap: 8, marginBottom: 16 },
  metaChip: { backgroundColor: ui.inputBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  metaText: { fontSize: 12, color: ui.midText, fontWeight: '500' },

  startBtn:      { borderRadius: 24, overflow: 'hidden', borderWidth: 1.5 },
  retakeBtn:     { },
  startBtnInner: { paddingVertical: 13, alignItems: 'center', borderRadius: 22 },
  startBtnText:  { fontSize: 14, fontWeight: '700', color: '#fff' },
});
