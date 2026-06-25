import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polygon, Line, Text as SvgText } from 'react-native-svg';
import { ui } from '../../theme/colors';
import { storage } from '../../utils/storage';

const DOMAINS = [
  { key: 'analytical', label: 'Analytical', color: ui.primaryBlue, score: 88 },
  { key: 'creative',   label: 'Creative',   color: '#7C3AED',       score: 72 },
  { key: 'leadership', label: 'Leadership', color: '#059669',       score: 80 },
  { key: 'execution',  label: 'Execution',  color: ui.primaryBlue, score: 85 },
  { key: 'agility',    label: 'Agility',    color: '#EC4899',       score: 77 },
  { key: 'comms',      label: 'Comms',      color: '#F59E0B',       score: 83 },
  { key: 'decision',   label: 'Decision',   color: '#DC2626',       score: 79 },
];

const ARCHETYPES = [
  { minScore: 85, name: 'Systems Architect',    desc: 'You see patterns where others see chaos. A rare combination of analytical precision and strategic thinking makes you exceptional at building systems.' },
  { minScore: 75, name: 'Cognitive Explorer',   desc: 'You thrive on discovering new ideas and connecting dots across domains. Your curiosity drives breakthrough thinking.' },
  { minScore: 65, name: 'Strategic Thinker',    desc: 'You excel at long-range planning and turning complex challenges into clear action plans.' },
  { minScore: 0,  name: 'Rising Intellect',     desc: 'Your intelligence profile is developing. Every assessment sharpens the picture of your unique cognitive strengths.' },
];

const CAREER_PATHS = ['Data Scientist', 'Product Manager', 'Systems Architect', 'UX Researcher', 'Strategy Consultant'];

function RadarChart7({ scores, size = 240 }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.34;
  const n = 7;
  const labels = ['Analytical', 'Creative', 'Leadership', 'Execution', 'Agility', 'Comms', 'Decision'];

  function getPoint(i, r) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1].map(f => {
    return Array.from({ length: n }, (_, i) => getPoint(i, maxR * f))
      .map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  });

  const dataPoints = scores.map((s, i) => getPoint(i, (s / 100) * maxR));
  const dataPolygon = dataPoints.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <Svg width={size} height={size}>
      {gridLevels.map((pts, l) => (
        <Polygon key={l} points={pts} fill="none" stroke={ui.borderGray} strokeWidth={1} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const outer = getPoint(i, maxR);
        return <Line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke={ui.borderGray} strokeWidth={1} />;
      })}
      <Polygon points={dataPolygon} fill={`${ui.primaryBlue}25`} stroke={ui.primaryBlue} strokeWidth={2} />
      {Array.from({ length: n }, (_, i) => {
        const lp = getPoint(i, maxR + 24);
        return (
          <SvgText key={i} x={lp.x} y={lp.y} textAnchor="middle" alignmentBaseline="middle"
            fill={ui.midText} fontSize={9} fontWeight="600">
            {labels[i]}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function DNAScreen({ navigation }) {
  const [scores, setScores] = useState(DOMAINS.map(d => d.score));
  const [archetype, setArchetype] = useState(ARCHETYPES[0]);

  useEffect(() => {
    storage.getScores().then(stored => {
      if (stored?.domainPercents?.length >= 7) {
        setScores(stored.domainPercents.slice(0, 7));
      }
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const at = ARCHETYPES.find(a => avg >= a.minScore) || ARCHETYPES[ARCHETYPES.length - 1];
      setArchetype(at);
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={ui.offWhite} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>

        {/* Archetype card */}
        <LinearGradient
          colors={[ui.blueGradStart, ui.blueGradEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.archetypeCard}
        >
          <Text style={styles.archetypeLabel}>YOUR INTELLIGENCE ARCHETYPE</Text>
          <Text style={styles.archetypeName}>{archetype.name}</Text>
          <Text style={styles.archetypeDesc}>{archetype.desc}</Text>
        </LinearGradient>

        {/* Radar chart */}
        <View style={styles.radarCard}>
          <Text style={styles.radarTitle}>Full Intelligence Profile</Text>
          <View style={{ alignItems: 'center', marginVertical: 8 }}>
            <RadarChart7 scores={scores} size={240} />
          </View>
        </View>

        {/* Domain bars */}
        <View style={styles.barsCard}>
          {DOMAINS.map((d, i) => (
            <View key={d.key} style={styles.barRow}>
              <Text style={styles.barLabel}>{d.label}</Text>
              <Text style={[styles.barPct, { color: ui.primaryBlue }]}>{scores[i] || d.score}%</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${scores[i] || d.score}%`, backgroundColor: ui.primaryBlue }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Career paths */}
        <View style={styles.careerSection}>
          <Text style={styles.careerTitle}>Ideal Career Paths</Text>
          <View style={styles.chipRow}>
            {CAREER_PATHS.map(c => (
              <TouchableOpacity key={c} style={styles.chip} activeOpacity={0.7}>
                <Text style={styles.chipText}>{c}  →</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: ui.offWhite },
  scroll: { flex: 1 },

  archetypeCard: {
    margin: 20,
    borderRadius: 20,
    padding: 22,
    shadowColor: ui.blueGradStart,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  archetypeLabel: { fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginBottom: 8 },
  archetypeName:  { fontSize: 26, fontWeight: '900', color: '#FFFFFF', marginBottom: 10, lineHeight: 30 },
  archetypeDesc:  { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20 },

  radarCard: {
    marginHorizontal: 20,
    backgroundColor: ui.white,
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  radarTitle: { fontSize: 17, fontWeight: '800', color: ui.darkText, marginBottom: 4 },

  barsCard: {
    marginHorizontal: 20,
    backgroundColor: ui.white,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
    gap: 16,
  },
  barRow:   { gap: 6 },
  barLabel: { fontSize: 14, fontWeight: '600', color: ui.darkText },
  barPct:   { fontSize: 14, fontWeight: '800', position: 'absolute', right: 0, top: 0 },
  barTrack: { height: 8, backgroundColor: ui.borderGray, borderRadius: 4, overflow: 'hidden', marginTop: 18 },
  barFill:  { height: '100%', borderRadius: 4 },

  careerSection: { marginHorizontal: 20, marginBottom: 16 },
  careerTitle:   { fontSize: 17, fontWeight: '800', color: ui.darkText, marginBottom: 14 },
  chipRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    borderWidth: 1.5,
    borderColor: ui.primaryBlue,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  chipText: { fontSize: 13, fontWeight: '600', color: ui.primaryBlue },
});
