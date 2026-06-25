import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, ui } from '../../theme/colors';
import CircularProgress from '../../components/CircularProgress';
import ScoreCard from '../../components/ScoreCard';
import LabCard from '../../components/LabCard';
import RadarChart from '../../components/RadarChart';
import { getTopLabs } from '../../utils/scoreEngine';
import { DOMAIN_SHORT } from '../../data/phase2Questions';

export default function HighPerformanceScreen({ route, navigation }) {
  const { scores } = route.params;
  const { combined, cis, gps, domainPercents, labReadiness, hii } = scores;
  const topLabs = getTopLabs(labReadiness, 3);
  const bestLab = topLabs[0];
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ui.blueGradStart} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[ui.blueGradStart, ui.blueGradEnd]} style={styles.hero}>
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
            <Text style={styles.heroEmoji}>🏆</Text>
            <Text style={styles.heroTitle}>High Performance{'\n'}Pathway</Text>
            <Text style={styles.heroSub}>Combined Score: {Math.round(combined.percent)}%</Text>
            <View style={styles.heroRing}>
              <CircularProgress percent={combined.percent} size={140} color="#FFD94A" strokeWidth={10} />
            </View>
          </Animated.View>
        </LinearGradient>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Intelligence Scores</Text>
          <ScoreCard acronym="CIS" title="Current Intelligence Score" description="Your current overall cognitive capability level" value={cis} color={ui.primaryBlue} />
          <ScoreCard acronym="GPS" title="Growth Potential Score" description="Expected improvement potential with training" value={gps} color={colors.phase2} />
          <ScoreCard acronym="HII" title="Human Intelligence Index" description="Composite score across both assessments" value={hii} color={colors.phase3} />

          <Text style={styles.sectionTitle}>Intelligence Profile</Text>
          <View style={styles.card}>
            <RadarChart scores={domainPercents} size={280} />
            <View style={styles.legendRow}>
              {DOMAIN_SHORT.map((d, i) => (
                <Text key={i} style={styles.legendItem}>{i + 1}. {d}: <Text style={{ color: ui.primaryBlue }}>{domainPercents[i]}%</Text></Text>
              ))}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Top 3 Recommended Labs</Text>
          {topLabs.map((lab, i) => <LabCard key={lab.id} lab={lab} rank={i} />)}

          {bestLab && (
            <View style={styles.bestLabCard}>
              <Text style={styles.bestLabStar}>⭐</Text>
              <Text style={styles.bestLabLabel}>AI Recommended Best Lab</Text>
              <Text style={styles.bestLabName}>{bestLab.emoji} {bestLab.name}</Text>
              <Text style={styles.bestLabDesc}>{bestLab.description}</Text>
              <Text style={styles.bestLabScore}>Readiness: {bestLab.readiness}%</Text>
            </View>
          )}

          <View style={styles.phase4Card}>
            <Text style={styles.phase4Badge}>PHASE 4 ELIGIBLE</Text>
            <Text style={styles.phase4Title}>Structured Human{'\n'}Intelligence Interview</Text>
            <Text style={styles.phase4Sub}>You qualify for a live 1-on-1 interview. Duration: 15–20 minutes.</Text>
            <TouchableOpacity style={styles.phase4Btn} onPress={() => navigation.navigate('Phase4Booking', { scores })} activeOpacity={0.8}>
              <Text style={styles.phase4BtnText}>Book Phase 4 Interview →</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.reportBtn} onPress={() => navigation.navigate('FinalReport', { scores })} activeOpacity={0.8}>
            <Text style={styles.reportBtnText}>View Full Report →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: ui.offWhite },
  hero:         { padding: 30, alignItems: 'center', paddingTop: 50 },
  heroEmoji:    { fontSize: 40, marginBottom: 12 },
  heroTitle:    { fontSize: 26, fontWeight: '900', color: '#fff', textAlign: 'center', lineHeight: 32, marginBottom: 6 },
  heroSub:      { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '700', marginBottom: 20 },
  heroRing:     { marginTop: 10, marginBottom: 10 },
  content:      { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, color: ui.midText, fontWeight: '700', marginTop: 24, marginBottom: 10, letterSpacing: 0.5 },
  card: {
    backgroundColor: ui.white, borderRadius: 16, padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  legendRow:  { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  legendItem: { fontSize: 11, color: ui.midText, width: '48%' },
  bestLabCard: {
    backgroundColor: ui.white, borderRadius: 16, padding: 20, alignItems: 'center', marginVertical: 8,
    borderWidth: 1.5, borderColor: ui.primaryBlue + '40',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  bestLabStar:  { fontSize: 28, marginBottom: 8 },
  bestLabLabel: { fontSize: 11, color: ui.primaryBlue, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  bestLabName:  { fontSize: 20, fontWeight: '900', color: ui.darkText, marginBottom: 8 },
  bestLabDesc:  { fontSize: 12, color: ui.midText, textAlign: 'center', lineHeight: 18, marginBottom: 8 },
  bestLabScore: { fontSize: 14, color: ui.primaryBlue, fontWeight: '800' },
  phase4Card: {
    backgroundColor: ui.white, borderRadius: 16, padding: 20,
    borderWidth: 1.5, borderColor: ui.primaryBlue + '50', marginVertical: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  phase4Badge: {
    fontSize: 10, color: ui.primaryBlue, fontWeight: '700', letterSpacing: 1,
    backgroundColor: ui.challengeBg, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10,
  },
  phase4Title: { fontSize: 18, fontWeight: '800', color: ui.darkText, lineHeight: 24, marginBottom: 6 },
  phase4Sub:   { fontSize: 12, color: ui.midText, lineHeight: 18, marginBottom: 16 },
  phase4Btn: {
    backgroundColor: ui.primaryBlue, borderRadius: 28, paddingVertical: 14, alignItems: 'center',
    shadowColor: ui.primaryBlue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  phase4BtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  reportBtn: {
    backgroundColor: ui.white, borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: ui.borderGray,
  },
  reportBtnText: { color: ui.primaryBlue, fontWeight: '700', fontSize: 14 },
});
