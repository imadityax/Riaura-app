import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, ui } from '../theme/colors';

export default function PhaseHeader({ phase, title, subtitle, progress }) {
  const phaseColors = [colors.phase1, colors.phase2, colors.phase3, colors.phase4];
  const accent = phaseColors[(phase - 1) % 4];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.phaseBadge, { backgroundColor: accent + '18', borderColor: accent + '60' }]}>
          <Text style={[styles.phaseText, { color: accent }]}>PHASE {phase}</Text>
        </View>
        {progress !== undefined && (
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {progress !== undefined && (
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: ui.white,
    borderBottomWidth: 1, borderBottomColor: ui.borderGray,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  phaseBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20, borderWidth: 1,
  },
  phaseText:    { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  progressText: { fontSize: 12, color: ui.midText, fontWeight: '600' },
  title:        { fontSize: 20, fontWeight: '800', color: ui.darkText, marginBottom: 2 },
  subtitle:     { fontSize: 13, color: ui.midText, marginBottom: 8 },
  progressBar: {
    height: 5, backgroundColor: ui.borderGray, borderRadius: 3, marginTop: 8, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
});
