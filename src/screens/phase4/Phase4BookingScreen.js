import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors, ui, dark } from '../../theme/colors';
import { Emblem } from '../../components/VisualKit';
import { ClayCard, ClayBubble } from '../../components/Clay';

function StarRating({ rating, size = 12 }) {
  const full = Math.round(rating);
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <Ionicons key={i} name={i < full ? 'star' : 'star-outline'} size={size} color={dark.gold} />
      ))}
    </View>
  );
}

const SLOTS = [
  { day: 'Monday',    date: 'Jun 30', times: ['10:00 AM', '2:00 PM', '5:00 PM'] },
  { day: 'Tuesday',   date: 'Jul 1',  times: ['11:00 AM', '3:00 PM'] },
  { day: 'Wednesday', date: 'Jul 2',  times: ['9:00 AM', '1:00 PM', '4:00 PM'] },
  { day: 'Thursday',  date: 'Jul 3',  times: ['10:00 AM', '2:30 PM'] },
  { day: 'Friday',    date: 'Jul 4',  times: ['11:00 AM', '3:00 PM', '5:30 PM'] },
];

const INTERVIEWERS = [
  { name: 'Dr. Priya Sharma',  title: 'Cognitive Assessment Specialist', icon: 'account-circle-outline', rating: 4.9 },
  { name: 'Prof. Arjun Mehta', title: 'Human Intelligence Researcher',   icon: 'account-circle-outline', rating: 4.8 },
  { name: 'Dr. Nisha Patel',   title: 'Psychometric Expert',             icon: 'account-circle-outline', rating: 4.9 },
];

export default function Phase4BookingScreen({ route, navigation }) {
  const { scores } = route.params;
  const [selectedDay, setSelectedDay]             = useState(null);
  const [selectedTime, setSelectedTime]           = useState(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const canBook = selectedDay !== null && selectedTime !== null && selectedInterviewer !== null;

  function handleBook() {
    Alert.alert(
      'Booking Confirmed!',
      `${SLOTS[selectedDay].day}, ${SLOTS[selectedDay].date} at ${selectedTime} with ${INTERVIEWERS[selectedInterviewer].name}.`,
      [
        { text: 'Start Mock Interview', onPress: () => navigation.replace('Phase4Interview', { scores }) },
        { text: 'View Results',         onPress: () => navigation.replace('HighPerformance', { scores }) },
      ]
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.header}>
          <Emblem icon="calendar-check-outline" size={68} colors={['#FFB347', '#F59E0B']} style={{ marginBottom: 14 }} />
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseText}>PHASE 4</Text>
          </View>
          <Text style={styles.title}>Schedule Your{'\n'}Intelligence Interview</Text>
          <Text style={styles.sub}>Live 1-on-1 · 15–20 Minutes · Max 20 Marks</Text>
        </View>

        <View style={styles.infoRow}>
          {[{ icon: 'target', val: '20',    lbl: 'Max Marks' }, { icon: 'timer-outline', val: '15–20', lbl: 'Minutes' }, { icon: 'microphone-outline', val: 'Live', lbl: '1-on-1' }].map(info => (
            <View key={info.lbl} style={styles.infoCard}>
              <MaterialCommunityIcons name={info.icon} size={20} color={dark.neon} style={styles.infoEmoji} />
              <Text style={styles.infoVal}>{info.val}</Text>
              <Text style={styles.infoLbl}>{info.lbl}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Select an Interviewer</Text>
        {INTERVIEWERS.map((iv, i) => {
          const isSel = selectedInterviewer === i;
          return (
            <ClayCard key={i} tone={isSel ? 'selected' : 'default'} radius={16} style={styles.ivCard} onPress={() => setSelectedInterviewer(i)}>
              <ClayBubble size={48} tone={isSel ? 'selected' : 'default'} style={isSel && styles.avatarOnSelected}>
                <MaterialCommunityIcons name={iv.icon} size={26} color={isSel ? '#fff' : dark.neon} />
              </ClayBubble>
              <View style={styles.ivInfo}>
                <Text style={[styles.ivName, isSel && styles.textOnSelected]}>{iv.name}</Text>
                <Text style={[styles.ivTitle, isSel && styles.textOnSelected]}>{iv.title}</Text>
                <View style={styles.ivRatingRow}>
                  <StarRating rating={iv.rating} />
                  <Text style={[styles.ivRatingNum, isSel && styles.textOnSelected]}>{iv.rating}</Text>
                </View>
              </View>
              {isSel && <Ionicons name="checkmark-circle" size={22} color="#fff" />}
            </ClayCard>
          );
        })}

        <Text style={styles.sectionTitle}>Select a Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
          {SLOTS.map((slot, i) => {
            const isSel = selectedDay === i;
            return (
              <ClayCard key={i} tone={isSel ? 'selected' : 'default'} radius={14} style={styles.dayCard} onPress={() => { setSelectedDay(i); setSelectedTime(null); }}>
                <Text style={[styles.dayName, isSel && styles.textOnSelected]}>{slot.day.slice(0, 3)}</Text>
                <Text style={[styles.dayDate, isSel && styles.textOnSelected]}>{slot.date}</Text>
              </ClayCard>
            );
          })}
        </ScrollView>

        {selectedDay !== null && (
          <>
            <Text style={styles.sectionTitle}>Select a Time</Text>
            <View style={styles.timeRow}>
              {SLOTS[selectedDay].times.map(t => {
                const isSel = selectedTime === t;
                return (
                  <ClayCard key={t} tone={isSel ? 'selected' : 'default'} radius={12} style={styles.timeBtn} onPress={() => setSelectedTime(t)}>
                    <Text style={[styles.timeText, isSel && styles.textOnSelected]}>{t}</Text>
                  </ClayCard>
                );
              })}
            </View>
          </>
        )}

        {canBook && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Booking Summary</Text>
            <Text style={styles.summaryLine}><MaterialCommunityIcons name="calendar-outline" size={13} color={dark.textSub} />  {SLOTS[selectedDay].day}, {SLOTS[selectedDay].date}</Text>
            <Text style={styles.summaryLine}><MaterialCommunityIcons name="clock-outline" size={13} color={dark.textSub} />  {selectedTime}</Text>
            <Text style={styles.summaryLine}><MaterialCommunityIcons name="account-outline" size={13} color={dark.textSub} />  {INTERVIEWERS[selectedInterviewer].name}</Text>
            <Text style={styles.summaryLine}><MaterialCommunityIcons name="map-marker-outline" size={13} color={dark.textSub} />  Video Call (Link sent to your email)</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.bookBtn, !canBook && styles.bookBtnDisabled]} onPress={handleBook} activeOpacity={0.8} disabled={!canBook}>
          <Text style={[styles.bookText, !canBook && styles.bookTextDisabled]}>Confirm Booking →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace('Phase4Interview', { scores })}>
          <Text style={styles.skipText}>Take Mock Interview Instead →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: dark.bgSolid },
  content:      { padding: 20, paddingBottom: 40 },
  backBtn:      { paddingVertical: 8, paddingHorizontal: 4, marginBottom: 8 },
  backBtnText:  { color: dark.neon, fontWeight: '700', fontSize: 14 },
  header:       { alignItems: 'center', marginBottom: 20, marginTop: 8 },
  phaseBadge:   { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: dark.glass, borderWidth: 1, borderColor: dark.neon + '60', marginBottom: 10 },
  phaseText:    { color: dark.neon, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  title:        { fontSize: 24, fontWeight: '900', color: dark.text, textAlign: 'center', lineHeight: 30 },
  sub:          { fontSize: 12, color: dark.textSub, marginTop: 6 },
  infoRow:      { flexDirection: 'row', gap: 12, marginBottom: 24 },
  infoCard:     { flex: 1, backgroundColor: dark.glass, borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  infoEmoji:    { marginBottom: 4 },
  infoVal:      { fontSize: 16, fontWeight: '800', color: dark.neon },
  infoLbl:      { fontSize: 10, color: dark.textSub, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 12, color: dark.textSub, fontWeight: '700', marginBottom: 10, marginTop: 8, letterSpacing: 0.5 },
  textOnSelected: { color: '#fff' },
  avatarOnSelected: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderTopColor: 'rgba(255,255,255,0.6)', borderLeftColor: 'rgba(255,255,255,0.6)',
    borderRightColor: 'rgba(255,255,255,0.15)', borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  ivCard:       { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  ivInfo:       { flex: 1 },
  ivName:       { fontSize: 14, fontWeight: '700', color: dark.text },
  ivTitle:      { fontSize: 11, color: dark.textSub, marginTop: 2 },
  ivRatingRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  ivRatingNum:  { fontSize: 11, color: dark.textSub, fontWeight: '700' },
  daysScroll:   { marginBottom: 4 },
  dayCard:      { padding: 12, alignItems: 'center', marginRight: 10, minWidth: 64 },
  dayName:      { fontSize: 12, color: dark.textSub, fontWeight: '600' },
  dayDate:      { fontSize: 13, color: dark.text, fontWeight: '700', marginTop: 2 },
  timeRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  timeBtn:      { paddingHorizontal: 16, paddingVertical: 10 },
  timeText:     { color: dark.textSub, fontWeight: '600', fontSize: 13 },
  summaryCard:  { backgroundColor: dark.glass, borderRadius: 14, padding: 16, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: dark.neon, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  summaryTitle: { fontSize: 13, fontWeight: '800', color: dark.text, marginBottom: 10 },
  summaryLine:  { fontSize: 13, color: dark.textSub, marginBottom: 6 },
  bookBtn:      { backgroundColor: dark.neon, borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginBottom: 10, shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  bookBtnDisabled: { backgroundColor: dark.glassBorder, shadowOpacity: 0 },
  bookText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
  bookTextDisabled:{ color: dark.textMute },
  skipBtn:      { alignItems: 'center', paddingVertical: 10 },
  skipText:     { color: dark.textSub, fontSize: 13, fontWeight: '600' },
});
