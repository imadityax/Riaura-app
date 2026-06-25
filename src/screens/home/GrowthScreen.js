import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';

const LEVELS = [
  {
    level: 1,
    xp: '+500 XP',
    title: 'Foundation',
    tasks: [
      { label: 'Complete Cognitive Assessment', done: true },
      { label: 'Set your goals',                done: true },
      { label: 'Read 5 articles',               done: true },
    ],
    badge: 'Self-Awareness Unlocked',
    status: 'done',
    icon: '🏆',
  },
  {
    level: 2,
    xp: '+800 XP',
    title: 'Development',
    tasks: [
      { label: 'Complete Psychometric Assessment', done: false },
      { label: 'Finish 2 courses',                  done: false },
      { label: '7-day streak',                       done: false },
    ],
    badge: 'Skill Builder Badge',
    status: 'active',
    icon: '⚡',
  },
  {
    level: 3,
    xp: '+1200 XP',
    title: 'Mastery',
    tasks: [
      { label: 'All 5 assessments done',    done: false },
      { label: 'Score 90+ in Cognitive',    done: false },
      { label: 'Reach Level 10',            done: false },
    ],
    badge: 'Elite Certificate',
    status: 'locked',
    icon: '🔒',
  },
  {
    level: 4,
    xp: '+2000 XP',
    title: 'Legacy',
    tasks: [
      { label: 'Mentor 3 others',      done: false },
      { label: 'Create a case study',  done: false },
      { label: 'Top 5% globally',      done: false },
    ],
    badge: 'Master Intelligence Award',
    status: 'locked',
    icon: '🔒',
  },
];

function LevelCard({ item }) {
  const isDone   = item.status === 'done';
  const isActive = item.status === 'active';
  const isLocked = item.status === 'locked';

  return (
    <View style={[
      styles.card,
      isActive && styles.cardActive,
      isLocked && styles.cardLocked,
    ]}>
      <View style={styles.cardTop}>
        <View style={[styles.iconCircle, isDone && styles.iconDone, isActive && styles.iconActive, isLocked && styles.iconLocked]}>
          <Text style={styles.iconEmoji}>{item.icon}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.levelRow}>
            <Text style={[styles.levelLabel, isLocked && styles.textLocked]}>
              LEVEL {item.level} · {item.xp}
            </Text>
            {isDone && (
              <View style={styles.doneBadge}>
                <Text style={styles.doneBadgeText}>Done ✓</Text>
              </View>
            )}
            {isActive && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
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
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 20, gap: 16 }}
      >
        <Text style={styles.pageTitle}>Your Growth Path</Text>
        {LEVELS.map(item => <LevelCard key={item.level} item={item} />)}
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
    backgroundColor: ui.white,
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: 'transparent',
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

  doneBadge: {
    backgroundColor: '#D1FAE5', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  doneBadgeText:   { fontSize: 11, fontWeight: '700', color: '#065F46' },
  activeBadge: {
    backgroundColor: ui.challengeBg, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: ui.primaryBlue },

  taskList: { gap: 10, marginBottom: 16 },
  taskRow:  { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskCheck: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 2, borderColor: ui.borderGray,
    alignItems: 'center', justifyContent: 'center',
  },
  taskCheckDone:   { backgroundColor: ui.primaryBlue, borderColor: ui.primaryBlue },
  taskCheckLocked: { borderColor: '#D1D5DB' },
  checkMark:  { color: '#fff', fontSize: 11, fontWeight: '800' },
  taskLabel:  { fontSize: 13, color: ui.darkText, flex: 1 },

  badgeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: ui.inputBg, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  badgeRowDone:   { backgroundColor: '#D1FAE5' },
  badgeRowActive: { backgroundColor: ui.challengeBg },
  badgeEmoji:     { fontSize: 14 },
  badgeText:      { fontSize: 12, fontWeight: '700', color: ui.midText },
  badgeTextDone:  { color: '#065F46' },
  badgeTextActive:{ color: ui.primaryBlue },

  textLocked: { color: '#9CA3AF' },
});
