import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, ui, dark } from '../../theme/colors';
import CircularProgress from '../../components/CircularProgress';
import RadarChart from '../../components/RadarChart';
import LabCard from '../../components/LabCard';
import { getTopLabs } from '../../utils/scoreEngine';
import { DOMAIN_SHORT } from '../../data/phase2Questions';
import { storage } from '../../utils/storage';

function generateAIGuidance(scores) {
  const { cis, gps, domainPercents, combined } = scores;
  const strongIdx = domainPercents.indexOf(Math.max(...domainPercents));
  const weakIdx   = domainPercents.indexOf(Math.min(...domainPercents));
  const domains   = ['Attention', 'Memory', 'Processing', 'Reasoning', 'Decision', 'Emotional', 'Social', 'Metacognitive'];
  return `Based on your RHIMS™ assessment, your CIS of ${cis}% places you in the ${cis >= 80 ? 'Elite' : cis >= 60 ? 'High Performance' : 'Development'} tier. Your strongest domain is ${domains[strongIdx]} Intelligence (${domainPercents[strongIdx]}%).\n\nYour GPS of ${gps}% indicates significant development runway. Priority focus: ${domains[weakIdx]} Intelligence (${domainPercents[weakIdx]}%).\n\n${combined.isHighPerformance ? 'Your High Performance Pathway qualification opens access to Specialized Labs and Phase 4 Interview.' : 'Consistent practice across all 8 domains will unlock High Performance Pathway access.'}`;
}

function generateRoadmap(scores) {
  const { domainPercents } = scores;
  const domains = ['Attention', 'Memory', 'Processing', 'Reasoning', 'Decision', 'Emotional', 'Social', 'Metacognitive'];
  const sorted  = [...domainPercents].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v);
  return [
    { step: 1, title: 'Establish Daily Practice',      desc: '20 minutes of targeted cognitive exercises every morning',                           status: 'start'    },
    { step: 2, title: `Strengthen ${domains[sorted[0].i]}`, desc: `Your lowest domain (${sorted[0].v}%) — focus here first for fastest gains`,     status: 'priority' },
    { step: 3, title: `Develop ${domains[sorted[1].i]}`,    desc: `Second priority (${sorted[1].v}%) — combine with domain 1 training`,            status: 'next'     },
    { step: 4, title: 'Maintain Strong Domains',       desc: `Keep ${domains[sorted[7].i]} (${sorted[7].v}%) sharp with weekly challenges`,        status: 'maintain' },
    { step: 5, title: 'Reassess in 30 Days',            desc: 'Retake RHIMS™ assessment to measure progress and unlock new pathways',              status: 'future'   },
  ];
}

export default function FinalReportScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { scores } = route.params || {};
  const safeScores = scores || { phase2: { marks: 20, percent: 50 }, phase3: { marks: 20, percent: 50 }, combined: { total: 40, percent: 50, isHighPerformance: false }, cis: 50, gps: 50, domainPercents: Array(8).fill(50), labReadiness: [], hii: 50 };
  const { combined, cis, gps, domainPercents, labReadiness, hii, phase2, phase3, phase4Marks } = safeScores;
  const topLabs    = getTopLabs(labReadiness || [], 3);
  const aiGuidance = generateAIGuidance(safeScores);
  const roadmap    = generateRoadmap(safeScores);

  async function handleRestart() {
    await storage.clearAll();
    await signOut(auth).catch(() => {});
    navigation.replace('Splash');
  }

  const statusColors = { start: dark.neon, priority: colors.danger, next: colors.warning, maintain: colors.success, future: colors.phase2 };
  const statusLabels = { start: 'START', priority: 'PRIORITY', next: 'NEXT', maintain: 'MAINTAIN', future: 'FUTURE' };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ui.blueGradStart} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[ui.blueGradStart, ui.blueGradEnd]} style={[styles.hero, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.heroLabel}>HUMAN INTELLIGENCE INDEX</Text>
          <CircularProgress percent={hii} size={160} color="#FFD94A" strokeWidth={12} />
          <Text style={styles.heroScore}>{hii}</Text>
          <Text style={styles.heroTier}>{hii >= 80 ? 'Elite Tier' : hii >= 60 ? 'High Performance' : 'Development Tier'}</Text>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>
          <View style={styles.scoreGrid}>
            <View style={styles.scoreCell}>
              <Text style={styles.scoreVal}>{phase2?.marks ?? 0}</Text>
              <Text style={styles.scoreLbl}>Phase 2{'\n'}(max 40)</Text>
            </View>
            <View style={styles.scoreDivider} />
            <View style={styles.scoreCell}>
              <Text style={styles.scoreVal}>{phase3?.marks ?? 0}</Text>
              <Text style={styles.scoreLbl}>Phase 3{'\n'}(max 40)</Text>
            </View>
            {phase4Marks !== undefined && phase4Marks !== null && (
              <>
                <View style={styles.scoreDivider} />
                <View style={styles.scoreCell}>
                  <Text style={styles.scoreVal}>{phase4Marks}</Text>
                  <Text style={styles.scoreLbl}>Phase 4{'\n'}(max 20)</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.threeScores}>
            {[{ val: cis, lbl: 'CIS', color: dark.neon }, { val: gps, lbl: 'GPS', color: colors.phase2 }, { val: hii, lbl: 'HII', color: colors.phase3 }].map(s => (
              <View key={s.lbl} style={styles.scoreRing}>
                <CircularProgress percent={s.val} size={90} color={s.color} />
                <Text style={styles.ringLabel}>{s.lbl}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Domain Intelligence Profile</Text>
          <View style={styles.card}>
            <RadarChart scores={domainPercents} size={280} />
          </View>
          <View style={styles.card}>
            {DOMAIN_SHORT.map((d, i) => (
              <View key={i} style={styles.domainRow}>
                <Text style={styles.domainName}>{d}</Text>
                <View style={styles.domainBar}>
                  <View style={[styles.domainFill, { width: `${domainPercents[i]}%`, backgroundColor: domainPercents[i] >= 80 ? dark.neon : domainPercents[i] >= 60 ? colors.success : colors.warning }]} />
                </View>
                <Text style={styles.domainVal}>{domainPercents[i]}%</Text>
              </View>
            ))}
          </View>

          {topLabs.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Top 3 Lab Recommendations</Text>
              {topLabs.map((lab, i) => <LabCard key={lab.id} lab={lab} rank={i} />)}
            </>
          )}

          <Text style={styles.sectionTitle}>AI Guidance Report</Text>
          <View style={styles.guidanceCard}>
            <MaterialCommunityIcons name="robot-outline" size={24} color={dark.neon} style={styles.guidanceEmoji} />
            <Text style={styles.guidanceText}>{aiGuidance}</Text>
          </View>

          <Text style={styles.sectionTitle}>Personalised Development Roadmap</Text>
          {roadmap.map(r => (
            <View key={r.step} style={styles.roadmapRow}>
              <View style={[styles.roadmapStep, { backgroundColor: statusColors[r.status] + '18', borderColor: statusColors[r.status] }]}>
                <Text style={[styles.roadmapStepNum, { color: statusColors[r.status] }]}>{r.step}</Text>
              </View>
              <View style={styles.roadmapInfo}>
                <View style={styles.roadmapTitleRow}>
                  <Text style={styles.roadmapTitle}>{r.title}</Text>
                  <View style={[styles.roadmapTag, { backgroundColor: statusColors[r.status] + '18' }]}>
                    <Text style={[styles.roadmapTagText, { color: statusColors[r.status] }]}>{statusLabels[r.status]}</Text>
                  </View>
                </View>
                <Text style={styles.roadmapDesc}>{r.desc}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.restartBtn} onPress={handleRestart} activeOpacity={0.8}>
            <Text style={styles.restartText}>Retake Assessment</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: dark.bgSolid },
  hero:    { padding: 30, alignItems: 'center', paddingTop: 50 },
  backBtn: { position: 'absolute', top: 50, left: 20, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  backBtnText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  heroLabel:    { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '700', letterSpacing: 2, marginBottom: 16 },
  heroScore:    { fontSize: 18, color: '#FFD94A', fontWeight: '900', marginTop: 12 },
  heroTier:     { fontSize: 14, color: '#fff', fontWeight: '700', marginTop: 6 },
  content:      { padding: 20, paddingBottom: 50 },
  sectionTitle: { fontSize: 13, color: dark.textSub, fontWeight: '700', marginBottom: 10, marginTop: 20, letterSpacing: 0.5 },
  scoreGrid:    { backgroundColor: dark.glass, borderRadius: 16, flexDirection: 'row', padding: 16, justifyContent: 'space-around', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  scoreCell:    { alignItems: 'center' },
  scoreVal:     { fontSize: 28, fontWeight: '900', color: dark.neon },
  scoreLbl:     { fontSize: 11, color: dark.textSub, textAlign: 'center', marginTop: 4 },
  scoreDivider: { width: 1, backgroundColor: dark.glassBorder },
  threeScores:  { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 8 },
  scoreRing:    { alignItems: 'center', gap: 6 },
  ringLabel:    { fontSize: 12, color: dark.textSub, fontWeight: '700' },
  card:         { backgroundColor: dark.glass, borderRadius: 16, padding: 16, marginBottom: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  domainRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, width: '100%' },
  domainName:   { width: 70, fontSize: 11, color: dark.textSub, fontWeight: '600' },
  domainBar:    { flex: 1, height: 6, backgroundColor: dark.glassBorder, borderRadius: 3, overflow: 'hidden' },
  domainFill:   { height: '100%', borderRadius: 3 },
  domainVal:    { width: 36, fontSize: 11, color: '#1E1B33', fontWeight: '700', textAlign: 'right' },
  guidanceCard: { backgroundColor: dark.glass, borderRadius: 16, padding: 16, borderLeftWidth: 3, borderLeftColor: dark.neon, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  guidanceEmoji:{ marginBottom: 10 },
  guidanceText: { color: dark.textSub, fontSize: 13, lineHeight: 22 },
  roadmapRow:   { backgroundColor: dark.glass, borderRadius: 14, padding: 12, flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  roadmapStep:  { width: 32, height: 32, borderRadius: 16, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  roadmapStepNum: { fontSize: 14, fontWeight: '900' },
  roadmapInfo:    { flex: 1 },
  roadmapTitleRow:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  roadmapTitle:   { fontSize: 13, fontWeight: '700', color: '#1E1B33' },
  roadmapTag:     { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  roadmapTagText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  roadmapDesc:    { fontSize: 11, color: dark.textSub, lineHeight: 16 },
  restartBtn:     { backgroundColor: dark.glass, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: dark.glassBorder },
  restartText:    { color: dark.textSub, fontWeight: '700', fontSize: 14 },
});
