import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { FadeInUp, Pulse } from '../../components/anim';
import { ui, dark } from '../../theme/colors';
import { storage } from '../../utils/storage';

function LevelCard({ item }) {
  const isDone   = item.status === 'done';
  const isActive = item.status === 'active';
  const isLocked = item.status === 'locked';

  return (
    <View style={[styles.card, isActive && styles.cardActive, isLocked && styles.cardLocked]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, isDone && styles.iconDone, isActive && styles.iconActive, isLocked && styles.iconLocked]}>
          {isActive ? (
            <Pulse>
              <MaterialCommunityIcons name={item.icon} size={22} color={dark.neon} />
            </Pulse>
          ) : (
            <MaterialCommunityIcons
              name={item.icon}
              size={22}
              color={isDone ? '#059669' : dark.textMute}
            />
          )}
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
        <MaterialCommunityIcons name="medal-outline" size={15} color={dark.textSub} />
        <Text style={[styles.badgeText, isDone && styles.badgeTextDone, isActive && styles.badgeTextActive, isLocked && styles.textLocked]}>
          {item.badge}
        </Text>
      </View>
    </View>
  );
}

export default function GrowthScreen({ navigation }) {
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
        { level: 1, xp: '+500 XP',  title: 'Foundation',  tasks: l1Tasks, badge: 'Self-Awareness Unlocked', status: l1Status, icon: l1Done ? 'trophy-outline' : 'lightning-bolt-outline' },
        { level: 2, xp: '+800 XP',  title: 'Development', tasks: l2Tasks, badge: 'Skill Builder Badge',     status: l2Status, icon: l2Done ? 'trophy-outline' : l2Status === 'active' ? 'lightning-bolt-outline' : 'lock-outline' },
        { level: 3, xp: '+1200 XP', title: 'Mastery',     tasks: l3Tasks, badge: 'Elite Certificate',       status: l3Status, icon: l3Status === 'active' ? 'lightning-bolt-outline' : 'lock-outline' },
        { level: 4, xp: '+2000 XP', title: 'Legacy',      tasks: l4Tasks, badge: 'Master Intelligence Award', status: 'locked', icon: 'lock-outline' },
      ]);
    })();
  }, []);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBar}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={'#1E1B33'} />
          </TouchableOpacity>
        )}
        <Text style={styles.topTitle}>Growth Path</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20, gap: 16 }}
      >
        {levels
          ? levels.map((item, i) => (
              <FadeInUp key={item.level} delay={i * 90}>
                <LevelCard item={item} />
              </FadeInUp>
            ))
          : <Text style={{ color: dark.textSub, textAlign: 'center', marginTop: 40 }}>Loading...</Text>
        }
        <View style={{ height: 10 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: dark.bgSolid },
  scroll:    { flex: 1 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#1E1B33', marginBottom: 4 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: dark.glass, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  topTitle: { fontSize: 17, fontWeight: '800', color: '#1E1B33' },

  card: {
    backgroundColor: dark.glass, borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  cardActive: { borderColor: dark.neon },
  cardLocked: { opacity: 0.6 },

  cardTop:    { flexDirection: 'row', gap: 14, alignItems: 'flex-start', marginBottom: 16 },
  iconCircle: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconDone:   { backgroundColor: '#D1FAE5' },
  iconActive: { backgroundColor: dark.glass, borderWidth: 1.5, borderColor: dark.neon },
  iconLocked: { backgroundColor: dark.glass },

  levelRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  levelLabel: { fontSize: 10, fontWeight: '800', color: dark.neon, letterSpacing: 1 },
  levelTitle: { fontSize: 18, fontWeight: '900', color: '#1E1B33' },

  doneBadge:       { backgroundColor: '#D1FAE5', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  doneBadgeText:   { fontSize: 11, fontWeight: '700', color: '#065F46' },
  activeBadge:     { backgroundColor: dark.glass, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: dark.neon },

  taskList: { gap: 10, marginBottom: 16 },
  taskRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskCheck: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: dark.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  taskCheckDone:   { backgroundColor: dark.neon, borderColor: dark.neon },
  taskCheckLocked: { borderColor: '#D1D5DB' },
  checkMark:  { color: '#fff', fontSize: 11, fontWeight: '800' },
  taskLabel:  { fontSize: 13, color: '#1E1B33', flex: 1 },

  badgeRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: dark.glass, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  badgeRowDone:   { backgroundColor: '#D1FAE5' },
  badgeRowActive: { backgroundColor: dark.glass },
  badgeText:      { fontSize: 12, fontWeight: '700', color: dark.textSub },
  badgeTextDone:  { color: '#065F46' },
  badgeTextActive:{ color: dark.neon },
  textLocked:     { color: '#9CA3AF' },
});
