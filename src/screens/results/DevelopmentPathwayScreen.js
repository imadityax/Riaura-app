import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, ui } from '../../theme/colors';
import CircularProgress from '../../components/CircularProgress';
import LabCard from '../../components/LabCard';
import RadarChart from '../../components/RadarChart';
import { LABS } from '../../data/labsData';
import { DOMAIN_SHORT } from '../../data/phase2Questions';

const CHAT_SEED = [
  { from: 'ai', text: 'Hello! I\'m your RiAura AI Guide. I\'ve reviewed your assessment results. How can I help you today?' },
];

export default function DevelopmentPathwayScreen({ route, navigation }) {
  const { scores } = route.params;
  const { combined, cis, gps, domainPercents, hii } = scores;
  const [tab, setTab]         = useState('report');
  const [messages, setMessages] = useState(CHAT_SEED);
  const [input, setInput]     = useState('');

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages(m => [...m, { from: 'user', text }]);
    setInput('');
    setTimeout(() => {
      setMessages(m => [...m, { from: 'ai', text: generateReply(text, scores) }]);
    }, 800);
  }

  function generateReply(userMsg, scores) {
    const lower = userMsg.toLowerCase();
    if (lower.includes('score') || lower.includes('result'))
      return `Your Combined Score is ${Math.round(scores.combined.percent)}%. CIS: ${scores.cis}%, GPS: ${scores.gps}%. You have significant growth potential!`;
    if (lower.includes('lab') || lower.includes('access'))
      return `Lab access unlocks at 60%+ Combined Score. Focus on your weakest domains to get there.`;
    if (lower.includes('improve') || lower.includes('grow')) {
      const weakIdx = [...scores.domainPercents].map((v, i) => ({ v, i })).sort((a, b) => a.v - b.v)[0];
      const domains = ['Attention', 'Memory', 'Processing', 'Reasoning', 'Decision', 'Emotional', 'Social', 'Metacognitive'];
      return `Your biggest opportunity: ${domains[weakIdx.i]} Intelligence (${weakIdx.v}%). 15 mins of daily targeted practice will yield the fastest gains.`;
    }
    return `Based on your profile, consistent daily practice across all 8 domains will unlock High Performance Pathway. What area would you like to explore?`;
  }

  const TABS = [
    { id: 'report', label: '📊 Report' },
    { id: 'labs',   label: '🔒 Labs'   },
    { id: 'chat',   label: '🤖 AI Chat' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={ui.blueGradStart} />

      {/* Hero */}
      <LinearGradient colors={[ui.blueGradStart, ui.blueGradEnd]} style={styles.hero}>
        <Text style={styles.heroEmoji}>📈</Text>
        <Text style={styles.heroTitle}>Development Pathway</Text>
        <Text style={styles.heroSub}>Combined Score: {Math.round(combined.percent)}%</Text>
        <CircularProgress percent={combined.percent} size={100} color="#90EE90" strokeWidth={8} />
        <Text style={styles.needMore}>Need {Math.max(0, 60 - Math.round(combined.percent))}% more for High Performance</Text>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={[styles.tab, tab === t.id && styles.tabActive]} onPress={() => setTab(t.id)}>
            <Text style={[styles.tabText, tab === t.id && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'report' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.scoreRow}>
            {[{ val: `${cis}%`, lbl: 'CIS', color: ui.primaryBlue }, { val: `${gps}%`, lbl: 'GPS', color: colors.phase2 }, { val: `${hii}`, lbl: 'HII', color: colors.phase3 }].map(s => (
              <View key={s.lbl} style={styles.miniScore}>
                <Text style={[styles.miniVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.miniLabel}>{s.lbl}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Intelligence Profile</Text>
          <View style={styles.card}>
            <RadarChart scores={domainPercents} size={260} />
          </View>

          <Text style={styles.sectionTitle}>Domain Breakdown</Text>
          {DOMAIN_SHORT.map((d, i) => (
            <View key={i} style={styles.domainRow}>
              <Text style={styles.domainName}>{d}</Text>
              <View style={styles.domainBar}>
                <View style={[styles.domainFill, { width: `${domainPercents[i]}%`, backgroundColor: domainPercents[i] >= 60 ? colors.success : colors.warning }]} />
              </View>
              <Text style={styles.domainVal}>{domainPercents[i]}%</Text>
            </View>
          ))}

          <View style={styles.growthCard}>
            <Text style={styles.growthTitle}>💡 Growth Suggestions</Text>
            {['Practice attention exercises for 10 minutes daily', 'Use spaced repetition for memory improvement', 'Challenge yourself with logic puzzles weekly', 'Keep a reflection journal to boost metacognition', 'Engage in group discussions to strengthen social intelligence'].map((tip, i) => (
              <Text key={i} style={styles.growthTip}>• {tip}</Text>
            ))}
          </View>

          <View style={styles.lockBadge}>
            <Text style={styles.lockText}>🔒 Lab & Interview Access unlocks at 60% Combined Score</Text>
          </View>
        </ScrollView>
      )}

      {tab === 'labs' && (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.lockedInfo}>All labs are locked until you reach 60% Combined Score.</Text>
          {LABS.map(lab => <LabCard key={lab.id} lab={lab} locked />)}
        </ScrollView>
      )}

      {tab === 'chat' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.chatContent} showsVerticalScrollIndicator={false}>
            {messages.map((msg, i) => (
              <View key={i} style={[styles.bubble, msg.from === 'ai' ? styles.aiBubble : styles.userBubble]}>
                {msg.from === 'ai' && <Text style={styles.aiAvatar}>🤖</Text>}
                <Text style={[styles.bubbleText, msg.from === 'user' && styles.userBubbleText]}>{msg.text}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatTextInput}
              value={input}
              onChangeText={setInput}
              placeholder="Ask about your results…"
              placeholderTextColor={ui.lightText}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
              color={ui.darkText}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} activeOpacity={0.8}>
              <Text style={styles.sendBtnText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: ui.offWhite },
  hero:       { padding: 20, alignItems: 'center', paddingTop: 24, paddingBottom: 24 },
  heroEmoji:  { fontSize: 32, marginBottom: 6 },
  heroTitle:  { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 4 },
  heroSub:    { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '700', marginBottom: 10 },
  needMore:   { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 6 },
  tabs:       { flexDirection: 'row', backgroundColor: ui.white, marginHorizontal: 16, marginTop: 12, borderRadius: 14, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  tab:        { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 11 },
  tabActive:  { backgroundColor: ui.challengeBg },
  tabText:    { fontSize: 12, color: ui.lightText, fontWeight: '600' },
  tabTextActive: { color: ui.primaryBlue, fontWeight: '800' },
  content:    { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
  scoreRow:   { flexDirection: 'row', gap: 10, marginBottom: 16 },
  miniScore:  { flex: 1, backgroundColor: ui.white, borderRadius: 12, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  miniVal:    { fontSize: 22, fontWeight: '900' },
  miniLabel:  { fontSize: 11, color: ui.midText, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 13, color: ui.midText, fontWeight: '700', marginBottom: 10, marginTop: 16 },
  card:       { backgroundColor: ui.white, borderRadius: 16, padding: 12, marginBottom: 8, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  domainRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  domainName: { width: 70, fontSize: 11, color: ui.midText, fontWeight: '600' },
  domainBar:  { flex: 1, height: 6, backgroundColor: ui.borderGray, borderRadius: 3, overflow: 'hidden' },
  domainFill: { height: '100%', borderRadius: 3 },
  domainVal:  { width: 36, fontSize: 11, color: ui.darkText, fontWeight: '700', textAlign: 'right' },
  growthCard: { backgroundColor: ui.white, borderRadius: 14, padding: 16, marginTop: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  growthTitle:{ fontSize: 14, fontWeight: '800', color: ui.darkText, marginBottom: 10 },
  growthTip:  { fontSize: 12, color: ui.midText, lineHeight: 20, marginBottom: 4 },
  lockBadge:  { backgroundColor: colors.danger + '10', borderRadius: 12, borderWidth: 1, borderColor: colors.danger + '30', padding: 12, alignItems: 'center' },
  lockText:   { color: colors.danger, fontSize: 13, fontWeight: '700' },
  lockedInfo: { fontSize: 13, color: ui.midText, textAlign: 'center', padding: 16, lineHeight: 20 },
  chatContent:{ padding: 16, paddingBottom: 20 },
  bubble:     { marginBottom: 10, maxWidth: '85%', borderRadius: 14, padding: 12 },
  aiBubble:   { backgroundColor: ui.white, alignSelf: 'flex-start', borderBottomLeftRadius: 4, flexDirection: 'row', gap: 8, alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  userBubble: { backgroundColor: ui.challengeBg, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiAvatar:   { fontSize: 18 },
  bubbleText: { color: ui.darkText, fontSize: 13, lineHeight: 20, flex: 1 },
  userBubbleText: { color: ui.primaryBlue },
  chatInput:  { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: ui.borderGray, backgroundColor: ui.white },
  chatTextInput: { flex: 1, backgroundColor: ui.inputBg, borderRadius: 12, borderWidth: 1, borderColor: ui.borderGray, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  sendBtn:    { backgroundColor: ui.primaryBlue, borderRadius: 12, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  sendBtnText:{ color: '#fff', fontWeight: '800', fontSize: 13 },
});
