import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

export default function LabCard({ lab, rank, locked = false }) {
  const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32'];

  return (
    <View style={[styles.card, shadows.card, locked && styles.locked]}>
      <View style={[styles.iconBox, { backgroundColor: lab.color + '20' }]}>
        <MaterialCommunityIcons name={lab.icon} size={24} color={lab.color} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, locked && styles.grayText]}>{lab.name}</Text>
          {rank !== undefined && rank < 3 && (
            <View style={[styles.rankBadge, { backgroundColor: rankColors[rank] + '30', borderColor: rankColors[rank] }]}>
              <Text style={[styles.rankText, { color: rankColors[rank] }]}>#{rank + 1}</Text>
            </View>
          )}
          {locked && (
            <View style={styles.lockBadge}>
              <MaterialCommunityIcons name="lock" size={10} color={colors.danger} />
              <Text style={styles.lockText}>Locked</Text>
            </View>
          )}
        </View>
        <Text style={[styles.focus, locked && styles.grayText]}>{lab.focus}</Text>
        {!locked && lab.readiness !== undefined && (
          <View style={styles.readinessRow}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${lab.readiness}%`, backgroundColor: lab.color }]} />
            </View>
            <Text style={[styles.readinessVal, { color: lab.color }]}>{lab.readiness}%</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 5,
  },
  locked: { opacity: 0.5 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 14, fontWeight: '700', color: '#1E1B33' },
  grayText: { color: '#A8A5B5' },
  rankBadge: {
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1,
  },
  rankText: { fontSize: 10, fontWeight: '800' },
  lockBadge: { backgroundColor: colors.danger + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 3 },
  lockText: { fontSize: 10, color: colors.danger, fontWeight: '600' },
  focus: { fontSize: 11, color: '#6E6A80', marginTop: 2 },
  readinessRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  barTrack: { flex: 1, height: 4, backgroundColor: '#ECE8F5', borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },
  readinessVal: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
});
