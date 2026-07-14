import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, ui, dark } from '../../theme/colors';
import { Emblem } from '../../components/VisualKit';

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
      <StatusBar barStyle="dark-content" />
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
        {INTERVIEWERS.map((iv, i) => (
          <TouchableOpacity key={i} style={[styles.ivCard, selectedInterviewer === i && styles.ivSelected]} onPress={() => setSelectedInterviewer(i)} activeOpacity={0.8}>
            <MaterialCommunityIcons name={iv.icon} size={30} color={dark.neon} style={styles.ivEmoji} />
            <View style={styles.ivInfo}>
              <Text style={styles.ivName}>{iv.name}</Text>
              <Text style={styles.ivTitle}>{iv.title}</Text>
              <Text style={styles.ivRating}>⭐ {iv.rating}</Text>
            </View>
            {selectedInterviewer === i && <Text style={styles.selectedMark}>✓</Text>}
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Select a Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
          {SLOTS.map((slot, i) => (
            <TouchableOpacity key={i} style={[styles.dayCard, selectedDay === i && styles.daySelected]} onPress={() => { setSelectedDay(i); setSelectedTime(null); }} activeOpacity={0.8}>
              <Text style={[styles.dayName, selectedDay === i && styles.dayTextSelected]}>{slot.day.slice(0, 3)}</Text>
              <Text style={[styles.dayDate, selectedDay === i && styles.dayDateSelected]}>{slot.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedDay !== null && (
          <>
            <Text style={styles.sectionTitle}>Select a Time</Text>
            <View style={styles.timeRow}>
              {SLOTS[selectedDay].times.map(t => (
                <TouchableOpacity key={t} style={[styles.timeBtn, selectedTime === t && styles.timeSelected]} onPress={() => setSelectedTime(t)} activeOpacity={0.8}>
                  <Text style={[styles.timeText, selectedTime === t && styles.timeTextSelected]}>{t}</Text>
                </TouchableOpacity>
              ))}
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
  title:        { fontSize: 24, fontWeight: '900', color: '#1E1B33', textAlign: 'center', lineHeight: 30 },
  sub:          { fontSize: 12, color: dark.textSub, marginTop: 6 },
  infoRow:      { flexDirection: 'row', gap: 12, marginBottom: 24 },
  infoCard:     { flex: 1, backgroundColor: dark.glass, borderRadius: 14, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  infoEmoji:    { marginBottom: 4 },
  infoVal:      { fontSize: 16, fontWeight: '800', color: dark.neon },
  infoLbl:      { fontSize: 10, color: dark.textSub, fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 12, color: dark.textSub, fontWeight: '700', marginBottom: 10, marginTop: 8, letterSpacing: 0.5 },
  ivCard:       { backgroundColor: dark.glass, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  ivSelected:   { borderColor: dark.neon },
  ivEmoji:      {},
  ivInfo:       { flex: 1 },
  ivName:       { fontSize: 14, fontWeight: '700', color: '#1E1B33' },
  ivTitle:      { fontSize: 11, color: dark.textSub, marginTop: 2 },
  ivRating:     { fontSize: 11, color: '#F59E0B', marginTop: 3, fontWeight: '600' },
  selectedMark: { color: dark.neon, fontSize: 18, fontWeight: '900' },
  daysScroll:   { marginBottom: 4 },
  dayCard:      { backgroundColor: dark.glass, borderRadius: 12, padding: 12, alignItems: 'center', marginRight: 10, minWidth: 64, borderWidth: 1.5, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  daySelected:  { borderColor: dark.neon, backgroundColor: dark.glass },
  dayName:      { fontSize: 12, color: dark.textSub, fontWeight: '600' },
  dayDate:      { fontSize: 13, color: '#1E1B33', fontWeight: '700', marginTop: 2 },
  dayTextSelected: { color: dark.neon },
  dayDateSelected: { color: dark.neon },
  timeRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  timeBtn:      { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: dark.glass, borderWidth: 1.5, borderColor: dark.glassBorder },
  timeSelected: { borderColor: dark.neon, backgroundColor: dark.glass },
  timeText:     { color: dark.textSub, fontWeight: '600', fontSize: 13 },
  timeTextSelected: { color: dark.neon, fontWeight: '700' },
  summaryCard:  { backgroundColor: dark.glass, borderRadius: 14, padding: 16, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: dark.neon, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  summaryTitle: { fontSize: 13, fontWeight: '800', color: '#1E1B33', marginBottom: 10 },
  summaryLine:  { fontSize: 13, color: dark.textSub, marginBottom: 6 },
  bookBtn:      { backgroundColor: dark.neon, borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginBottom: 10, shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  bookBtnDisabled: { backgroundColor: dark.glassBorder, shadowOpacity: 0 },
  bookText:        { fontSize: 16, fontWeight: '700', color: '#fff' },
  bookTextDisabled:{ color: dark.textMute },
  skipBtn:      { alignItems: 'center', paddingVertical: 10 },
  skipText:     { color: dark.textSub, fontSize: 13, fontWeight: '600' },
});
