import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { ui } from '../../theme/colors';
import PhaseHeader from '../../components/PhaseHeader';

const OBJECTS = ['A paperclip', 'An empty cardboard box', 'A plastic bottle'];
const TIME_PER_OBJECT = 120;

function handleBack(navigation) {
  Alert.alert('Exit Assessment?', 'Your cognitive task progress will not be saved if you exit now.', [
    { text: 'Stay', style: 'cancel' },
    { text: 'Exit', style: 'destructive', onPress: () => navigation.navigate('Main') },
  ]);
}

export default function AlternativeUsesScreen({ route, navigation }) {
  const { phase2Answers, taskScores, taskIndex } = route.params;
  const [objectIdx, setObjectIdx] = useState(0);
  const [input, setInput] = useState('');
  const [uses, setUses] = useState([]);
  const usesRef = useRef([]);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_OBJECT);
  const timerRef = useRef(null);
  const [started, setStarted] = useState(false);

  function startTimer() {
    setStarted(true);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleObjectDone(usesRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function addUse() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!started) startTimer();
    const next = [...usesRef.current, trimmed];
    usesRef.current = next;
    setUses(next);
    setInput('');
  }

  function handleObjectDone(currentUses) {
    clearInterval(timerRef.current);
    const next = objectIdx + 1;
    if (next >= OBJECTS.length) {
      const totalUses = currentUses.length;
      const taskScore = Math.min(5, Math.round(totalUses / 3));
      const newScores = [...taskScores, taskScore];
      navigation.replace('Task_ConfidenceCalibration', { phase2Answers, taskScores: newScores, taskIndex: taskIndex + 1 });
    } else {
      setObjectIdx(next);
      usesRef.current = [];
      setUses([]);
      setTimeLeft(TIME_PER_OBJECT);
      setStarted(false);
    }
  }

  return (
    <View style={styles.container}>
      <PhaseHeader phase={3} title="Alternative Uses" subtitle={`Social & Originality · Object ${objectIdx + 1}/${OBJECTS.length}`} progress={(taskIndex + 1) / 8} onBack={() => handleBack(navigation)} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.objectCard}>
            <Text style={styles.objectLabel}>OBJECT</Text>
            <Text style={styles.objectName}>{OBJECTS[objectIdx]}</Text>
          </View>

          <Text style={styles.instruction}>
            List as many <Text style={{ color: ui.primaryBlue, fontWeight: '700' }}>creative uses</Text> as you can think of for this object.
            There are no wrong answers!
          </Text>

          {started && (
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>⏱ {timeLeft}s remaining</Text>
              <View style={styles.timerBar}>
                <View style={[styles.timerFill, { width: `${(timeLeft / TIME_PER_OBJECT) * 100}%` }]} />
              </View>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={input}
              onChangeText={setInput}
              placeholder="Type a use and press Add…"
              placeholderTextColor={ui.lightText}
              onSubmitEditing={addUse}
              returnKeyType="done"
              color={ui.darkText}
            />
            <TouchableOpacity style={styles.addBtn} onPress={addUse} activeOpacity={0.8}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.usesList}>
            {uses.map((u, i) => (
              <View key={i} style={styles.useItem}>
                <Text style={styles.useNum}>{i + 1}</Text>
                <Text style={styles.useText}>{u}</Text>
              </View>
            ))}
            {uses.length === 0 && <Text style={styles.usesEmpty}>Your ideas will appear here…</Text>}
          </View>

          <View style={styles.footer}>
            <Text style={styles.countText}>{uses.length} ideas so far</Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => handleObjectDone(uses)}
              activeOpacity={0.8}
            >
              <View style={styles.doneInner}>
                <Text style={styles.doneText}>
                  {objectIdx + 1 < OBJECTS.length ? 'Next Object →' : 'Finish Task →'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ui.offWhite },
  content: { padding: 20, paddingBottom: 40 },
  objectCard: {
    backgroundColor: ui.white, borderRadius: 16, padding: 20,
    alignItems: 'center', marginBottom: 16, borderWidth: 2, borderColor: colors.labOriginal,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  objectLabel: { color: colors.labOriginal, fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  objectName: { fontSize: 24, fontWeight: '800', color: ui.darkText, textAlign: 'center' },
  instruction: { fontSize: 13, color: ui.midText, lineHeight: 20, marginBottom: 16, textAlign: 'center' },
  timerBox: { marginBottom: 12 },
  timerText: { color: ui.primaryBlue, fontWeight: '700', fontSize: 13, marginBottom: 6 },
  timerBar: { height: 4, backgroundColor: ui.borderGray, borderRadius: 2, overflow: 'hidden' },
  timerFill: { height: '100%', backgroundColor: ui.primaryBlue, borderRadius: 2 },
  inputRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  textInput: {
    flex: 1, backgroundColor: ui.white, borderRadius: 12,
    borderWidth: 1, borderColor: ui.borderGray,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
  },
  addBtn: {
    backgroundColor: colors.labOriginal, borderRadius: 12,
    paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  usesList: { minHeight: 80 },
  useItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: ui.white, borderRadius: 10, padding: 10, marginBottom: 6,
    borderWidth: 1, borderColor: ui.borderGray,
  },
  useNum: { color: colors.labOriginal, fontWeight: '800', fontSize: 13, minWidth: 20 },
  useText: { flex: 1, color: ui.darkText, fontSize: 13 },
  usesEmpty: { color: ui.lightText, fontSize: 12, textAlign: 'center', paddingVertical: 20 },
  footer: { marginTop: 20 },
  countText: { color: ui.midText, fontSize: 12, textAlign: 'center', marginBottom: 12 },
  doneBtn: { borderRadius: 14, overflow: 'hidden' },
  doneInner: { paddingVertical: 16, alignItems: 'center', backgroundColor: ui.primaryBlue, borderRadius: 14 },
  doneText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
