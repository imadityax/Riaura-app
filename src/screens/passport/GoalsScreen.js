import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PressableScale, FadeInUp } from '../../components/anim';
import { ui, dark } from '../../theme/colors';
import Icon from '../../components/Icon';
import { storage } from '../../utils/storage';
import { auth } from '../../firebase/config';
import { saveGoalsToCloud } from '../../firebase/firestore';

export const DEV_GOALS = [
  { id: 'decisions',     icon: 'scale-balance',        title: 'Improve decision making', desc: 'Structured choices under pressure' },
  { id: 'leadership',    icon: 'account-group-outline', title: 'Build leadership skills', desc: 'Guide and align people around goals' },
  { id: 'communication', icon: 'message-text-outline', title: 'Strengthen communication', desc: 'Clearer, more resonant expression' },
  { id: 'focus',         icon: 'target',               title: 'Enhance focus',           desc: 'Deeper, longer attention spans' },
  { id: 'creativity',    icon: 'creation-outline',     title: 'Develop creativity',      desc: 'More original ideas, more often' },
  { id: 'memory',        icon: 'brain',                title: 'Sharpen memory',          desc: 'Better recall and retention' },
  { id: 'emotional',     icon: 'heart-outline',        title: 'Emotional balance',       desc: 'Awareness and regulation of feelings' },
  { id: 'reflection',    icon: 'mirror',               title: 'Grow metacognition',      desc: 'Think about how you think' },
];

export default function GoalsScreen({ navigation }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    storage.getGoals().then(g => setSelected(g.map(x => x.id)));
  }, []);

  function toggle(id) {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(x => x !== id)
      : sel.length >= 3 ? sel   // keep it focused: max 3 active goals
      : [...sel, id]);
  }

  async function save() {
    setSaving(true);
    const goals = DEV_GOALS
      .filter(g => selected.includes(g.id))
      .map(g => ({ id: g.id, title: g.title, startedAt: new Date().toISOString() }));
    await storage.saveGoals(goals);
    if (auth.currentUser) saveGoalsToCloud(auth.currentUser.uid, goals).catch(() => {});
    setSaving(false);
    Alert.alert('Goals saved', 'Your development goals are now part of your journey.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={s.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={'#1E1B33'} />
        </TouchableOpacity>
        <Text style={s.pageTitle}>Development Goals</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.lead}>
          Choose up to <Text style={{ fontWeight: '800' }}>3 goals</Text> to focus on.
          RHIMS will weave them into your recommendations and track them over time.
        </Text>

        {DEV_GOALS.map((g, i) => {
          const active = selected.includes(g.id);
          return (
            <FadeInUp key={g.id} delay={i * 50}>
              <PressableScale
                style={[s.goalCard, active && s.goalCardActive]}
                scaleTo={0.97}
                onPress={() => toggle(g.id)}
              >
                <View style={[s.goalIcon, active && s.goalIconActive]}>
                  <Icon name={g.icon} size={20} color={active ? '#fff' : dark.neon} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.goalTitle, active && s.goalTitleActive]}>{g.title}</Text>
                  <Text style={[s.goalDesc, active && s.goalDescActive]}>{g.desc}</Text>
                </View>
                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={22}
                  color={active ? '#fff' : dark.glassBorder}
                />
              </PressableScale>
            </FadeInUp>
          );
        })}

        <PressableScale
          style={[s.saveBtn, !selected.length && s.saveBtnDisabled]}
          scaleTo={0.95}
          onPress={save}
          disabled={!selected.length || saving}
        >
          <Text style={s.saveText}>
            {selected.length ? `Commit to ${selected.length} Goal${selected.length > 1 ? 's' : ''}` : 'Pick at least one goal'}
          </Text>
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: dark.bgSolid },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: dark.glass, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  pageTitle: { fontSize: 17, fontWeight: '800', color: '#1E1B33' },

  lead: { fontSize: 13.5, color: dark.textSub, lineHeight: 20, marginBottom: 16, marginTop: 4 },

  goalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: dark.glass, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: dark.glassBorder,
  },
  goalCardActive: { backgroundColor: dark.neon, borderColor: dark.neon },
  goalIcon: {
    width: 40, height: 40, borderRadius: 13, backgroundColor: dark.glass,
    alignItems: 'center', justifyContent: 'center',
  },
  goalIconActive:  { backgroundColor: 'rgba(255,255,255,0.2)' },
  goalTitle:       { fontSize: 14, fontWeight: '800', color: '#1E1B33' },
  goalTitleActive: { color: '#fff' },
  goalDesc:        { fontSize: 12, color: dark.textSub, marginTop: 2 },
  goalDescActive:  { color: 'rgba(255,255,255,0.75)' },

  saveBtn: {
    backgroundColor: dark.neon, borderRadius: 28, paddingVertical: 16,
    alignItems: 'center', marginTop: 14,
    shadowColor: dark.neon, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  saveBtnDisabled: { backgroundColor: dark.glassBorder, shadowOpacity: 0 },
  saveText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
