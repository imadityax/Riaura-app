import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ui, dark } from '../../theme/colors';
import Icon from '../../components/Icon';
import { storage } from '../../utils/storage';

export default function NotificationsScreen({ navigation }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const streak = await storage.touchStreak();
      const scores = await storage.getScores();
      const mindfulnessDone = !!(await storage.getMindfulnessScore());

      const list = [{
        icon: 'party-popper', color: '#7C3AED',
        title: 'Welcome to RHIMS',
        body: 'Start your intelligence journey by completing your first assessment.',
        time: 'Today',
      }];

      if (streak > 1) {
        list.unshift({
          icon: 'fire', color: '#F59E0B',
          title: `${streak}-day streak!`,
          body: `You've opened RHIMS ${streak} days in a row. Keep it going.`,
          time: 'Today',
        });
      }

      if (scores?.combined?.percent != null) {
        list.unshift({
          icon: 'brain', color: dark.neon,
          title: 'Your Intelligence Score is ready',
          body: `You scored ${Math.round(scores.combined.percent)} on your latest assessment.`,
          time: 'Today',
        });
      }

      if (!mindfulnessDone) {
        list.push({
          icon: 'meditation', color: '#059669',
          title: 'Try the Mindfulness Assessment',
          body: 'A quick, science-backed check-in on present-moment awareness.',
          time: 'Suggested',
        });
      }

      setItems(list);
    })();
  }, []);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={'#1E1B33'} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Notifications</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {items.map((n, i) => (
          <View key={i} style={styles.card}>
            <View style={[styles.iconBg, { backgroundColor: n.color + '18' }]}>
              <Icon name={n.icon} size={20} color={n.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.cardHead}>
                <Text style={styles.cardTitle}>{n.title}</Text>
                <Text style={styles.cardTime}>{n.time}</Text>
              </View>
              <Text style={styles.cardBody}>{n.body}</Text>
            </View>
          </View>
        ))}

        {items.length === 0 && (
          <View style={styles.emptyWrap}>
            <MaterialCommunityIcons name="bell-outline" size={40} color={dark.textMute} style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySub}>No new notifications right now.</Text>
          </View>
        )}
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

  card: {
    flexDirection: 'row', gap: 12,
    backgroundColor: dark.glass, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  iconBg:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle:{ fontSize: 14, fontWeight: '800', color: '#1E1B33', flex: 1, marginRight: 8 },
  cardTime: { fontSize: 11, color: dark.textMute },
  cardBody: { fontSize: 13, color: dark.textSub, lineHeight: 18 },

  emptyWrap: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { marginBottom: 10 },
  emptyTitle:{ fontSize: 16, fontWeight: '800', color: '#1E1B33', marginBottom: 4 },
  emptySub:  { fontSize: 13, color: dark.textSub },
});
