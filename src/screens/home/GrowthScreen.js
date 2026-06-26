import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';

function LevelCard({ item }) {
  const isDone   = item.status === 'done';
  const isActive = item.status === 'active';
  const isLocked = item.status === 'locked';

  return (
    <View style={[styles.card, isActive && styles.cardActive, isLocked && styles.cardLocked]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, isDone && styles.iconDone, isActive && styles.iconActive, isLocked && styles.iconLocked]}>
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.levelRow}>
            <Text style={[styles.levelLabel, isLocked && styles.textLocked]}>
              LEVEL {item.level} · {item.xp}
            </Text>
            {isDone && <View style={styles.doneBadge}><Text style={styles.doneBadgeText}>Done ✓</Text></View>}
            {isActive && <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>Active</Text></View>}
          </View>
          <Text style={[styles.levelTitle, isLocked && styles.textLocked]}>{item.title}</Text>
        </View>
      </View>

      <View style={styles.taskList}>
        {item.tasks.map((t, i) => (
          <View key={i} style={styles.taskRow}>
            <View style={[styles.taskCheck, t.done && styles.taskCheckDone, isLocked && styles.taskCheckLocked]}>
              {t.done && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={[styles.taskLabel, isLocked && styles.textLocked]}>{t.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.badgeRow, isDone && styles.badgeRowDone, isActive && styles.badgeRowActive]}>
        <Text style={styles.badgeEmoji}>🏅</Text>
        <Text style={[styles.badgeText, isDone && styles.badgeTextDone, isActive && styles.badgeTextActive, isLocked && styles.textLocked]}>
          {item.badge}
        </Text>
      </View>
    </View>
  );
}

export default function GrowthScreen() {
  const [levels, setLevels] = useState(null);

  useEffect(() => {
    (async () => {
      const reg              = await storage.getRegistration();
      const ms               = await storage.getMindfulnessScore();
      const { answers }      = await storage.getPhase2Answers();
      const { scores }       = await storage.getPhase3Scores();
      const p4Marks          = await storage.getPhase4Marks();
      const savedScores      = await storage.getScores();

      const registered    = !!reg;
      const mindfulDone   = ms != null;
      const phase2Done    = answers.length >= 40;
      const phase3Done    = scores.length >= 8;
      const phase4Done    = p4Marks !== null;
      const anyAssessDone = mindfulDone || phase2Done || phase3Done;
      const allAssessDone = mindfulDone && phase2Done && phase3Done;
      const cogPercent    = savedScores?.phase3?.percent ?? 0;

      const l1Tasks = [
        { label: 'Create your account',            done: registered  },
        { label: 'Complete Mindfulness Assessment', done: mindfulDone },
        { label: 'Start a cognitive task',          done: phase3Done  },
      ];
      const l1Done = l1Tasks.every(t => t.done);
      const l1Status = l1Done ? 'done' : 'active';

      const l2Tasks = [
        { label: 'Complete WHO Psychometric', done: phase2Done    },
        { label: 'Complete all Cognitive Tasks', done: phase3Done },
        { label: 'Complete Mindfulness Assessment', done: mindfulDone },
      ];
      const l2Done = l2Tasks.every(t => t.done);
      const l2Status = l1Done ? (l2Done ? 'done' : 'active') : 'locked';

      const l3Tasks = [
        { label: 'All 3 assessments completed', done: allAssessDone      },
        { label: 'Score 80%+ in Cognitive',     done: cogPercent >= 80   },
        { label: 'Complete Phase 4 Interview',  done: phase4Done         },
      ];
      const l3Status = l2Done ? 'active' : 'locked';

      const l4Tasks = [
        { label: 'Reach High Performance tier', done: savedScores?.combined?.isHighPerformance ?? false },
        { label: 'Complete Phase 4 Interview',  done: phase4Done },
        { label: 'Top 10% globally',            done: false },
      ];

      setLevels([
        { level: 1, xp: '+500 XP',  title: 'Foundation',  tasks: l1Tasks, badge: 'Self-Awareness Unlocked', status: l1Status, icon: l1Done ? '🏆' : '⚡' },
        { level: 2, xp: '+800 XP',  title: 'Development', tasks: l2Tasks, badge: 'Skill Builder Badge',     status: l2Status, icon: l2Done ? '🏆' : l2Status === 'active' ? '⚡' : '🔒' },
        { level: 3, xp: '+1200 XP', title: 'Mastery',     tasks: l3Tasks, badge: 'Elite Certificate',       status: l3Status, icon: l3Status === 'active' ? '⚡' : '🔒' },
        { level: 4, xp: '+2000 XP', title: 'Legacy',      tasks: l4Tasks, badge: 'Master Intelligence Award', status: 'locked', icon: '🔒' },
      ]);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20, gap: 16 }}
      >
        <Text style={styles.pageTitle}>Your Growth Path</Text>
        {levels
          ? levels.map(item => <LevelCard key={item.level} item={item} />)
          : <Text style={{ color: ui.midText, textAlign: 'center', marginTop: 40 }}>Loading...</Text>
        }
        <View style={{ height: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: ui.offWhite },
  scroll:    { flex: 1 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: ui.darkText, marginBottom: 4 },

  card: {
    backgroundColor: ui.white, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  cardActive: { borderColor: ui.primaryBlue },
  cardLocked: { opacity: 0.6 },

  cardTop:    { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 16 },
  iconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconDone:   { backgroundColor: '#D1FAE5' },
  iconActive: { backgroundColor: ui.challengeBg, borderWidth: 1.5, borderColor: ui.primaryBlue },
  iconLocked: { backgroundColor: ui.inputBg },
  iconEmoji:  { fontSize: 22 },

  levelRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  levelLabel: { fontSize: 10, fontWeight: '800', color: ui.primaryBlue, letterSpacing: 1 },
  levelTitle: { fontSize: 18, fontWeight: '900', color: ui.darkText },

  doneBadge:       { backgroundColor: '#D1FAE5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  doneBadgeText:   { fontSize: 11, fontWeight: '700', color: '#065F46' },
  activeBadge:     { backgroundColor: ui.challengeBg, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: ui.primaryBlue },

  taskList: { gap: 10, marginBottom: 16 },
  taskRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskCheck: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: ui.borderGray,
    alignItems: 'center', justifyContent: 'center',
  },
  taskCheckDone:   { backgroundColor: ui.primaryBlue, borderColor: ui.primaryBlue },
  taskCheckLocked: { borderColor: '#D1D5DB' },
  checkMark:  { color: '#fff', fontSize: 11, fontWeight: '800' },
  taskLabel:  { fontSize: 13, color: ui.darkText, flex: 1 },

  badgeRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: ui.inputBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  badgeRowDone:   { backgroundColor: '#D1FAE5' },
  badgeRowActive: { backgroundColor: ui.challengeBg },
  badgeEmoji:     { fontSize: 14 },
  badgeText:      { fontSize: 12, fontWeight: '700', color: ui.midText },
  badgeTextDone:  { color: '#065F46' },
  badgeTextActive:{ color: ui.primaryBlue },
  textLocked:     { color: '#9CA3AF' },
});
