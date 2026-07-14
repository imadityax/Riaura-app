import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, StatusBar, Pressable, Animated,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale, FadeInUp } from '../../components/anim';
import { dark } from '../../theme/colors';
import Icon from '../../components/Icon';
import { RingStat } from '../../components/VisualKit';
import { Screen, GlassCard } from '../../components/GlassKit';
import { storage } from '../../utils/storage';
import { MINDFULNESS_DOMAINS } from '../assess/MindfulnessAssessScreen';

const MODES = {
  who: {
    key: 'who', label: 'WHO-Based',
    sub: 'Validated questionnaires across 8 domains.',
    accent: dark.neon, grad: [dark.neon, dark.neon2],
    route: 'MindfulnessAssess',
  },
  riaura: {
    key: 'riaura', label: 'RiAura-Based',
    sub: 'Hands-on activities across 8 domains.',
    accent: dark.violet, grad: [dark.violet, dark.violet2],
    route: 'ActivityAssess',
  },
};

function ModeToggle({ mode, onChange }) {
  const anim = useRef(new Animated.Value(mode === 'who' ? 0 : 1)).current;
  const [half, setHalf] = useState(0);
  useEffect(() => {
    Animated.spring(anim, { toValue: mode === 'who' ? 0 : 1, useNativeDriver: true, speed: 16, bounciness: 6 }).start();
  }, [mode]);
  return (
    <View style={styles.toggle} onLayout={e => setHalf((e.nativeEvent.layout.width - 8) / 2)}>
      <Animated.View
        style={[styles.thumb, {
          width: half, backgroundColor: MODES[mode].accent,
          transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [0, half] }) }],
        }]}
      />
      {['who', 'riaura'].map(k => (
        <Pressable key={k} style={styles.toggleHalf} onPress={() => onChange(k)}>
          <Text style={[styles.toggleText, mode === k && styles.toggleTextActive]}>{MODES[k].label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function AssessScreen({ navigation }) {
  const [mode, setMode]     = useState('who');
  const [whoMap, setWhoMap] = useState({});
  const [riaMap, setRiaMap] = useState({});

  useFocusEffect(useCallback(() => {
    storage.getMindfulnessDomainScores().then(setWhoMap);
    storage.getRiauraDomainScores().then(setRiaMap);
  }, []));

  const cfg       = MODES[mode];
  const doneMap   = mode === 'who' ? whoMap : riaMap;
  const doneCount = Object.keys(doneMap).length;
  const total     = MINDFULNESS_DOMAINS.length;
  const progress  = doneCount / total;

  return (
    <Screen>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Assessments</Text>
          <Text style={styles.headerSub}>{cfg.sub}</Text>
        </View>

        <View style={styles.toggleWrap}>
          <ModeToggle mode={mode} onChange={setMode} />
        </View>

        {/* Progress */}
        <GlassCard style={styles.progressCard} tint={cfg.accent + '1A'} border={cfg.accent + '55'}>
          <View style={styles.progressMain}>
            <RingStat percent={progress * 100} size={94} stroke={9} color={cfg.grad[0]} color2={cfg.grad[1]} trackColor="#ECE8F5">
              <Text style={styles.progressRingNum}>{doneCount}/{total}</Text>
              <Text style={styles.progressRingSub}>domains</Text>
            </RingStat>
            <View style={{ flex: 1 }}>
              <Text style={styles.progressLabel}>{cfg.label.toUpperCase()} · YOUR PROGRESS</Text>
              <Text style={styles.progressTitle}>
                {doneCount === total ? 'All domains complete'
                  : doneCount > 0 ? 'Keep going — you’re on your way'
                  : 'Start with your first domain'}
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Domain cards */}
        <View style={styles.cardList}>
          {MINDFULNESS_DOMAINS.map((d, di) => {
            const done = doneMap[d.num];
            return (
              <FadeInUp key={`${mode}-${d.num}`} delay={di * 55}>
                <GlassCard style={styles.card} onPress={() => navigation.navigate(cfg.route, { domainNum: d.num })}>
                  <View style={styles.cardHead}>
                    <View style={[styles.numPill, { backgroundColor: d.color + '26' }]}>
                      <Text style={[styles.numPillText, { color: d.color }]}>DOMAIN {d.num} OF 8</Text>
                    </View>
                    {done && (
                      <View style={styles.doneBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={dark.green} />
                        <Text style={styles.doneBadgeText}>{done.score}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardRow}>
                    <View style={[styles.cardIconBg, { backgroundColor: d.color + '22' }]}>
                      <Icon name={d.icon} size={22} color={d.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{d.label}</Text>
                      <Text style={styles.cardDesc}>{d.desc}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={dark.textMute} />
                  </View>
                </GlassCard>
              </FadeInUp>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header:      { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 4 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#1E1B33' },
  headerSub:   { fontSize: 13.5, color: dark.textSub, marginTop: 4, lineHeight: 19 },

  toggleWrap: { paddingHorizontal: 20, marginTop: 14 },
  toggle:     { flexDirection: 'row', backgroundColor: dark.glass, borderWidth: 1, borderColor: dark.glassBorder, borderRadius: 14, padding: 4, position: 'relative' },
  thumb:      { position: 'absolute', top: 4, bottom: 4, left: 4, borderRadius: 11 },
  toggleHalf: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 11 },
  toggleText: { fontSize: 13.5, fontWeight: '800', color: dark.textSub },
  toggleTextActive: { color: '#FFFFFF' },

  progressCard:    { marginHorizontal: 20, marginTop: 16, padding: 18 },
  progressMain:    { flexDirection: 'row', alignItems: 'center', gap: 16 },
  progressRingNum: { color: '#1E1B33', fontSize: 18, fontWeight: '900' },
  progressRingSub: { color: dark.textSub, fontSize: 10, fontWeight: '600', marginTop: 1 },
  progressLabel:   { color: dark.textSub, fontSize: 10.5, fontWeight: '700', letterSpacing: 0.8 },
  progressTitle:   { color: '#1E1B33', fontSize: 17, fontWeight: '700', marginTop: 8, lineHeight: 23 },

  cardList:   { paddingHorizontal: 20, paddingTop: 18, gap: 12 },
  card:       { padding: 16 },
  cardHead:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  numPill:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  numPillText:{ fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  doneBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: dark.green + '22', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  doneBadgeText: { fontSize: 12, fontWeight: '800', color: dark.green },
  cardRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardIconBg: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  cardTitle:  { fontSize: 15.5, fontWeight: '800', color: '#1E1B33' },
  cardDesc:   { fontSize: 12.5, color: dark.textSub, marginTop: 2, lineHeight: 17 },
});
