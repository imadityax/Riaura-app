import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadows } from '../theme/colors';
import CircularProgress from './CircularProgress';

export default function ScoreCard({ title, acronym, value, description, color = colors.gold }) {
  return (
    <View style={[styles.card, shadows.card]}>
      <CircularProgress percent={value} size={80} color={color} />
      <View style={styles.info}>
        <Text style={[styles.acronym, { color }]}>{acronym}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 6,
  },
  info: { flex: 1 },
  acronym: { fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 13, color: '#1E1B33', fontWeight: '700', marginTop: 2 },
  desc: { fontSize: 11, color: '#6E6A80', marginTop: 4, lineHeight: 16 },
});
