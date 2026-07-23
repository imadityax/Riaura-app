import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PressableScale, FadeInUp, PopIn, ProgressBar } from '../../components/anim';
import Icon from '../../components/Icon';
import { ui, dark } from '../../theme/colors';
import { storage } from '../../utils/storage';
import { auth } from '../../firebase/config';
import { AGE_GROUPS } from '../../data/mindfulnessQuestions';
import { getRiauraActivities, tierForGroup, TIER_LABEL } from '../../data/riauraActivities';
import { MINDFULNESS_DOMAINS } from './MindfulnessAssessScreen';

const AGE_GROUP_META = {
  g3_6:   { icon: 'happy-outline',     color: '#F59E0B' },
  g6_9:   { icon: 'star-outline',      color: '#10B981' },
  g9_12:  { icon: 'bulb-outline',      color: '#06B6D4' },
  g12_18: { icon: 'school-outline',    color: '#8B5CF6' },
  g18_30: { icon: 'briefcase-outline', color: '#3B82F6' },
  g30_45: { icon: 'briefcase-outline', color: '#EF4444' },
  g45_60: { icon: 'ribbon-outline',    color: '#F97316' },
  g60p:   { icon: 'leaf-outline',      color: '#14B8A6' },
};

export default function ActivityAssessScreen({ navigation, route }) {
  const domain = MINDFULNESS_DOMAINS.find(d => d.num === route?.params?.domainNum) || MINDFULNESS_DOMAINS[0];

  const [phase, setPhase]         = useState('age');   // age → activities → done
  const [ageGroup, setAgeGroup]   = useState(null);
  const [activities, setActivities] = useState([]);
  const [done, setDone]           = useState({});      // index → true
  const [expanded, setExpanded]   = useState({});      // index → true (details open)
  const [gameScores, setGameScores] = useState({});    // index → 0-100 from the game
  const [band, setBand]           = useState('moderate'); // adaptive difficulty band
  const [score, setScore]         = useState(0);

  // Resolve the adaptive difficulty band from the user's prior score on this
  // domain (RiAura activities first, then the WHO mindfulness track).
  useEffect(() => {
    (async () => {
      try {
        let prior = null;
        const r = await storage.getRiauraDomainScores();
        if (typeof r?.[domain.num]?.score === 'number') prior = r[domain.num].score;
        if (prior == null) {
          const m = await storage.getMindfulnessDomainScores();
          if (typeof m?.[domain.num]?.score === 'number') prior = m[domain.num].score;
        }
        if (prior != null) setBand(prior < 40 ? 'easy' : prior > 60 ? 'hard' : 'moderate');
      } catch (_) { /* default moderate */ }
    })();
  }, [domain.num]);

  function startActivities(group) {
    setAgeGroup(group);
    setActivities(getRiauraActivities(domain.num, group.key));
    setDone({});
    setExpanded({});
    setGameScores({});
    setPhase('activities');
  }

  function toggle(i) {
    setDone(d => ({ ...d, [i]: !d[i] }));
  }

  function toggleExpand(i) {
    setExpanded(e => ({ ...e, [i]: !e[i] }));
  }

  function openScience(url) {
    if (url) Linking.openURL(url).catch(() => {});
  }

  // Launch the interactive game for a playable (Domain 1) activity. On finish
  // the game hands back a real 0–100 score, which marks the activity complete.
  function openGame(i, a) {
    navigation.navigate('ActivityGame', {
      activity: a,
      band,
      color: domain.color,
      onComplete: (res) => {
        setDone(d => ({ ...d, [i]: true }));
        setGameScores(s => ({ ...s, [i]: res.score }));
      },
    });
  }

  // Launch a self-contained WebView activity (e.g. the Collaborative Sandbox).
  // Finishing it just marks the row done — no numeric score is fed back.
  function openWeb(i, a) {
    navigation.navigate('WebActivity', {
      activity: a,
      color: domain.color,
      onComplete: () => setDone(d => ({ ...d, [i]: true })),
    });
  }

  const doneCount = Object.values(done).filter(Boolean).length;
  const total     = activities.length;
  const progress  = total ? doneCount / total : 0;

  async function finish() {
    // Prefer real game scores when the activities were played; otherwise fall
    // back to simple completion ratio (used by the other domains' checklists).
    const played = Object.values(gameScores);
    const pct = played.length
      ? Math.round(played.reduce((a, b) => a + b, 0) / played.length)
      : (total ? Math.round((doneCount / total) * 100) : 0);
    setScore(pct);
    const map = await storage.saveRiauraDomainScore(domain.num, {
      score: pct,
      ageGroup: ageGroup.key,
      activitiesDone: doneCount,
      activitiesTotal: total,
      gameScores: played.length ? gameScores : undefined,
      difficulty: band,
      completedAt: new Date().toISOString(),
    });
    if (auth.currentUser) {
      const { saveRiauraDomainsToCloud } = await import('../../firebase/firestore');
      saveRiauraDomainsToCloud(auth.currentUser.uid, map).catch(() => {});
    }
    setPhase('done');
  }

  // ── STEP 1 · AGE GROUP ───────────────────────────────────
  if (phase === 'age') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
        <StatusBar barStyle="dark-content" />
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={20} color={'#1E1B33'} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Select Age Group</Text>
            <Text style={s.sub}>We’ll tailor the activities to you</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
          <View style={[s.domainCard, { borderLeftColor: domain.color }]}>
            <View style={[s.domainIconBg, { backgroundColor: domain.color + '18' }]}>
              <Icon name={domain.icon} size={22} color={domain.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.domainKicker}>RIAURA · DOMAIN {domain.num} OF 8</Text>
              <Text style={s.domainLabel}>{domain.label}</Text>
            </View>
          </View>

          {AGE_GROUPS.map((g, i) => {
            const meta = AGE_GROUP_META[g.key] || { icon: 'person-outline', color: dark.neon };
            const count = getRiauraActivities(domain.num, g.key).length;
            return (
              <FadeInUp key={g.key} delay={i * 45}>
                <PressableScale style={s.ageCard} scaleTo={0.97} onPress={() => startActivities(g)}>
                  <View style={[s.ageIconBg, { backgroundColor: meta.color + '18' }]}>
                    <Ionicons name={meta.icon} size={22} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.ageLabel}>{g.label} years</Text>
                    <Text style={s.ageMeta}>{TIER_LABEL[tierForGroup(g.key)]} · {count} activities</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={meta.color} />
                </PressableScale>
              </FadeInUp>
            );
          })}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── STEP 3 · DONE ────────────────────────────────────────
  if (phase === 'done') {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={domain.color} />
        <View style={s.doneWrap}>
          <PopIn>
            <View style={[s.doneRing, { borderColor: domain.color }]}>
              <Text style={[s.doneScore, { color: domain.color }]}>{score}%</Text>
            </View>
          </PopIn>
          <View style={[s.doneBadge, { backgroundColor: domain.color + '18' }]}>
            <Ionicons name="checkmark-circle" size={15} color={domain.color} />
            <Text style={[s.doneBadgeText, { color: domain.color }]}>DOMAIN COMPLETE</Text>
          </View>
          <Text style={s.doneTitle}>{domain.label}</Text>
          <Text style={s.doneSub}>
            You completed {Object.values(done).filter(Boolean).length} of {total} activities.
            Come back anytime to try the rest.
          </Text>

          <PressableScale style={[s.primaryBtn, { backgroundColor: domain.color }]} scaleTo={0.95} onPress={() => navigation.goBack()}>
            <Text style={s.primaryBtnText}>Back to Assessments</Text>
          </PressableScale>
          <TouchableOpacity onPress={() => { setPhase('age'); setAgeGroup(null); }} style={{ marginTop: 14 }}>
            <Text style={s.secondaryLink}>Choose another age group</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── STEP 2 · ACTIVITIES ──────────────────────────────────
  return (
    <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => setPhase('age')} style={s.backBtn}>
          <Ionicons name="chevron-back" size={20} color={'#1E1B33'} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{domain.label}</Text>
          <Text style={s.sub}>
            {ageGroup?.label} years · {activities[0]?.framework ? 'tap an activity to play' : 'tap each activity as you finish it'}
          </Text>
        </View>
      </View>

      <View style={s.progressWrap}>
        <View style={s.progressTop}>
          <Text style={s.progressText}>{doneCount} of {total} done</Text>
          <Text style={[s.progressPct, { color: domain.color }]}>{Math.round(progress * 100)}%</Text>
        </View>
        <ProgressBar progress={progress} height={7} fillColor={domain.color} trackColor={dark.glassBorder} duration={500} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>
        {activities.map((a, i) => {
          const isDone = !!done[i];
          const detailed = !!a.framework;   // Domain 1 rich activities
          const web = !!a.web;              // WebView activity (e.g. Collaborative Sandbox)
          const playable = detailed || web; // shows a play button + launches instead of toggling
          const isOpen = !!expanded[i];
          return (
            <FadeInUp key={i} delay={i * 45}>
              <View style={[s.actCard, isDone && { borderColor: domain.color, backgroundColor: domain.color + '0C' }]}>
                {/* Top row — playable activities launch the game; others toggle */}
                <PressableScale style={s.actTopRow} scaleTo={0.98} onPress={() => web ? openWeb(i, a) : detailed ? openGame(i, a) : toggle(i)}>
                  {playable ? (
                    <View style={[s.playBtn, { backgroundColor: domain.color + '18' }, isDone && { backgroundColor: domain.color }]}>
                      <Ionicons name={isDone ? 'checkmark' : 'play'} size={16} color={isDone ? '#fff' : domain.color} />
                    </View>
                  ) : (
                    <View style={[s.checkbox, isDone && { backgroundColor: domain.color, borderColor: domain.color }]}>
                      {isDone && <Ionicons name="checkmark" size={16} color="#fff" />}
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={s.actTitleRow}>
                      <Text style={[s.actTitle, isDone && s.actTitleDone]}>{a.title}</Text>
                      {gameScores[i] != null ? (
                        <View style={[s.scorePill, { backgroundColor: domain.color + '18' }]}>
                          <Text style={[s.scorePillText, { color: domain.color }]}>{gameScores[i]}/100</Text>
                        </View>
                      ) : a.minutes ? (
                        <View style={s.timePill}>
                          <Ionicons name="time-outline" size={11} color={dark.textSub} />
                          <Text style={s.timeText}>{a.minutes}m</Text>
                        </View>
                      ) : null}
                    </View>

                    {detailed && (
                      <View style={s.badgeRow}>
                        <View style={[s.badge, { backgroundColor: domain.color + '16' }]}>
                          <Text style={[s.badgeText, { color: domain.color }]}>{a.focus}</Text>
                        </View>
                        <View style={[s.badge, { backgroundColor: dark.glass }]}>
                          <Text style={[s.badgeText, { color: dark.textSub }]}>{a.framework}</Text>
                        </View>
                        <View style={[s.badge, { backgroundColor: dark.glass }]}>
                          <Ionicons name="wifi-outline" size={10} color={dark.textSub} />
                          <Text style={[s.badgeText, { color: dark.textSub }]}>{a.mode}</Text>
                        </View>
                      </View>
                    )}

                    <Text style={s.actDesc}>{a.desc}</Text>
                  </View>
                </PressableScale>

                {/* Details toggle + expandable rich content (Domain 1 only) */}
                {detailed && (
                  <>
                    <TouchableOpacity style={s.detailsToggle} onPress={() => toggleExpand(i)} activeOpacity={0.7}>
                      <Text style={[s.detailsToggleText, { color: domain.color }]}>
                        {isOpen ? 'Hide details' : 'View details'}
                      </Text>
                      <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={14} color={domain.color} />
                    </TouchableOpacity>

                    {isOpen && (
                      <View style={s.detailBody}>
                        {/* Materials */}
                        <DetailRow icon="cube-outline" label="Materials" value={a.materials} />

                        {/* Integrated parameters */}
                        <Text style={s.detailHeading}>Integrated Parameters</Text>
                        <View style={s.paramGroup}>
                          <Text style={s.paramTag}>Phase 2</Text>
                          <View style={s.chipWrap}>
                            {a.phase2.map(p => (
                              <View key={p} style={[s.chip, { borderColor: domain.color + '55', backgroundColor: domain.color + '10' }]}>
                                <Text style={[s.chipText, { color: domain.color }]}>{p}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                        <View style={s.paramGroup}>
                          <Text style={s.paramTag}>Phase 3</Text>
                          <View style={s.chipWrap}>
                            {a.phase3.map(p => (
                              <View key={p} style={[s.chip, { borderColor: dark.glassBorder, backgroundColor: dark.glass }]}>
                                <Text style={[s.chipText, { color: dark.textSub }]}>{p}</Text>
                              </View>
                            ))}
                          </View>
                        </View>

                        {/* Adaptive routing */}
                        <Text style={s.detailHeading}>Adaptive Routing</Text>
                        <RoutingRow tier="Easy"     band="<40%"   color="#10B981" text={a.routing.easy} />
                        <RoutingRow tier="Moderate" band="40–60%" color="#F59E0B" text={a.routing.moderate} />
                        <RoutingRow tier="Hard"     band=">60%"    color="#EF4444" text={a.routing.hard} />

                        {/* Metrics */}
                        <Text style={s.detailHeading}>Metrics Calculated</Text>
                        {a.metrics.map(m => (
                          <View key={m.label} style={s.metricRow}>
                            <Ionicons name="analytics-outline" size={13} color={domain.color} style={{ marginTop: 2 }} />
                            <Text style={s.metricText}>
                              <Text style={s.metricLabel}>{m.label}: </Text>{m.desc}
                            </Text>
                          </View>
                        ))}

                        {/* Scientific backing */}
                        {a.scienceUrl ? (
                          <TouchableOpacity style={s.scienceBtn} onPress={() => openScience(a.scienceUrl)} activeOpacity={0.7}>
                            <Ionicons name="link-outline" size={13} color={dark.neon} />
                            <Text style={s.scienceText}>Scientific backing (PubMed Central)</Text>
                            <Ionicons name="open-outline" size={12} color={dark.neon} />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    )}
                  </>
                )}
              </View>
            </FadeInUp>
          );
        })}

        <PressableScale
          style={[s.primaryBtn, { backgroundColor: domain.color }, !doneCount && s.primaryBtnDisabled]}
          scaleTo={0.95}
          onPress={finish}
          disabled={!doneCount}
        >
          <Text style={s.primaryBtnText}>
            {doneCount ? 'Finish Domain' : 'Complete an activity to finish'}
          </Text>
        </PressableScale>
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={s.detailRow}>
      <Ionicons name={icon} size={13} color={dark.textSub} />
      <Text style={s.detailRowLabel}>{label}:</Text>
      <Text style={s.detailRowValue}>{value}</Text>
    </View>
  );
}

function RoutingRow({ tier, band, color, text }) {
  return (
    <View style={s.routeRow}>
      <View style={[s.routePill, { backgroundColor: color + '18' }]}>
        <Text style={[s.routeTier, { color }]}>{tier}</Text>
        <Text style={[s.routeBand, { color }]}>{band}</Text>
      </View>
      <Text style={s.routeText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: dark.bgSolid },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: dark.glass, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#1E1B33' },
  sub:   { fontSize: 12.5, color: dark.textSub, marginTop: 2 },

  content: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 30, gap: 10 },

  // age step
  domainCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: dark.glass, borderRadius: 16, padding: 14,
    borderLeftWidth: 4, marginBottom: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 1,
  },
  domainIconBg: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  domainKicker: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5, color: dark.textMute },
  domainLabel:  { fontSize: 15.5, fontWeight: '800', color: '#1E1B33', marginTop: 2 },

  ageCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: dark.glass, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: dark.glassBorder,
  },
  ageIconBg: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  ageLabel:  { fontSize: 15, fontWeight: '800', color: '#1E1B33' },
  ageMeta:   { fontSize: 12, color: dark.textSub, marginTop: 2 },

  // progress
  progressWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  progressTop:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 12.5, fontWeight: '600', color: dark.textSub },
  progressPct:  { fontSize: 12.5, fontWeight: '800' },

  // activity cards
  actCard: {
    backgroundColor: dark.glass, borderRadius: 16, padding: 14,
    borderWidth: 1.5, borderColor: dark.glassBorder,
  },
  actTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: dark.glassBorder,
    alignItems: 'center', justifyContent: 'center', marginTop: 1,
  },
  playBtn: {
    width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: -1,
  },
  scorePill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  scorePillText: { fontSize: 11, fontWeight: '800' },
  actTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  actTitle:    { flex: 1, fontSize: 14.5, fontWeight: '800', color: '#1E1B33' },
  actTitleDone:{ textDecorationLine: 'line-through', color: dark.textSub },
  timePill:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: dark.glass, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  timeText:    { fontSize: 10.5, fontWeight: '700', color: dark.textSub },
  actDesc:     { fontSize: 12.5, color: dark.textSub, lineHeight: 18, marginTop: 6 },

  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  badge:    { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:{ fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },

  // details toggle + body
  detailsToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    marginTop: 10, marginLeft: 38,
  },
  detailsToggleText: { fontSize: 12.5, fontWeight: '800' },
  detailBody: {
    marginTop: 12, marginLeft: 38, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: dark.glassBorder, gap: 6,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  detailRowLabel: { fontSize: 11.5, fontWeight: '800', color: dark.textSub },
  detailRowValue: { flex: 1, fontSize: 12, color: '#1E1B33', fontWeight: '600' },

  detailHeading: { fontSize: 11, fontWeight: '800', letterSpacing: 0.6, color: dark.textMute, marginTop: 12, marginBottom: 2, textTransform: 'uppercase' },

  paramGroup: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 4 },
  paramTag:   { fontSize: 10, fontWeight: '800', color: dark.textSub, width: 44, marginTop: 5 },
  chipWrap:   { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:       { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  chipText:   { fontSize: 11, fontWeight: '700' },

  routeRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 },
  routePill:  { width: 78, borderRadius: 8, paddingVertical: 5, paddingHorizontal: 8, alignItems: 'center' },
  routeTier:  { fontSize: 11, fontWeight: '800' },
  routeBand:  { fontSize: 9.5, fontWeight: '700', opacity: 0.85 },
  routeText:  { flex: 1, fontSize: 12, color: '#1E1B33', lineHeight: 17 },

  metricRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 5 },
  metricText: { flex: 1, fontSize: 12, color: dark.textSub, lineHeight: 17 },
  metricLabel:{ fontWeight: '800', color: '#1E1B33' },

  scienceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12,
    backgroundColor: dark.neon + '10', borderRadius: 10, paddingVertical: 9, paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  scienceText:{ fontSize: 12, fontWeight: '700', color: dark.neon },

  primaryBtn: {
    borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginTop: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
  },
  primaryBtnDisabled: { opacity: 0.5, shadowOpacity: 0 },
  primaryBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // done step
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  doneRing: {
    width: 120, height: 120, borderRadius: 60, borderWidth: 5,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  doneScore: { fontSize: 34, fontWeight: '900' },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12 },
  doneBadgeText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 1.2 },
  doneTitle: { fontSize: 20, fontWeight: '900', color: '#1E1B33', textAlign: 'center' },
  doneSub:   { fontSize: 13.5, color: dark.textSub, textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 28 },
  secondaryLink: { fontSize: 13.5, fontWeight: '700', color: dark.textSub },
});
