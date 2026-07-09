import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PHASE: 'rhims_current_phase',
  REGISTRATION: 'rhims_registration',
  CONSENT: 'rhims_consent',
  PHASE2_ANSWERS: 'rhims_phase2_answers',
  PHASE2_DOMAIN: 'rhims_phase2_domain',
  PHASE3_SCORES: 'rhims_phase3_scores',
  PHASE3_TASK: 'rhims_phase3_task',
  PHASE4_MARKS: 'rhims_phase4_marks',
  SCORES: 'rhims_scores',
  MINDFULNESS_SCORE: 'rhims_mindfulness_score',
  MINDFULNESS_DONE:  'rhims_mindfulness_done',
  STREAK_COUNT:      'rhims_streak_count',
  STREAK_LAST_DATE:  'rhims_streak_last_date',
};

export const storage = {
  async saveRegistration(data) {
    await AsyncStorage.setItem(KEYS.REGISTRATION, JSON.stringify(data));
    await AsyncStorage.setItem(KEYS.PHASE, '1');
  },
  async getRegistration() {
    const v = await AsyncStorage.getItem(KEYS.REGISTRATION);
    return v ? JSON.parse(v) : null;
  },

  async saveConsent(data) {
    await AsyncStorage.setItem(KEYS.CONSENT, JSON.stringify(data));
    await AsyncStorage.setItem(KEYS.PHASE, '2');
  },
  async getConsent() {
    const v = await AsyncStorage.getItem(KEYS.CONSENT);
    return v ? JSON.parse(v) : null;
  },

  async savePhase2Answers(answers, domainIndex) {
    await AsyncStorage.setItem(KEYS.PHASE2_ANSWERS, JSON.stringify(answers));
    await AsyncStorage.setItem(KEYS.PHASE2_DOMAIN, String(domainIndex));
  },
  async getPhase2Answers() {
    const v = await AsyncStorage.getItem(KEYS.PHASE2_ANSWERS);
    const d = await AsyncStorage.getItem(KEYS.PHASE2_DOMAIN);
    return { answers: v ? JSON.parse(v) : [], domainIndex: d ? parseInt(d) : 0 };
  },

  async savePhase3Scores(scores, taskIndex) {
    await AsyncStorage.setItem(KEYS.PHASE3_SCORES, JSON.stringify(scores));
    await AsyncStorage.setItem(KEYS.PHASE3_TASK, String(taskIndex));
    await AsyncStorage.setItem(KEYS.PHASE, '3');
  },
  async getPhase3Scores() {
    const v = await AsyncStorage.getItem(KEYS.PHASE3_SCORES);
    const t = await AsyncStorage.getItem(KEYS.PHASE3_TASK);
    return { scores: v ? JSON.parse(v) : [], taskIndex: t ? parseInt(t) : 0 };
  },

  async savePhase4Marks(marks) {
    await AsyncStorage.setItem(KEYS.PHASE4_MARKS, String(marks));
    await AsyncStorage.setItem(KEYS.PHASE, '4');
  },
  async getPhase4Marks() {
    const v = await AsyncStorage.getItem(KEYS.PHASE4_MARKS);
    return v !== null ? parseInt(v) : null;
  },

  async saveScores(scores) {
    await AsyncStorage.setItem(KEYS.SCORES, JSON.stringify(scores));
  },
  async getScores() {
    const v = await AsyncStorage.getItem(KEYS.SCORES);
    return v ? JSON.parse(v) : null;
  },

  async getCurrentPhase() {
    const v = await AsyncStorage.getItem(KEYS.PHASE);
    return v ? parseInt(v) : 0;
  },

  async saveMindfulnessScore(score) {
    await AsyncStorage.setItem(KEYS.MINDFULNESS_SCORE, String(score));
    await AsyncStorage.setItem(KEYS.MINDFULNESS_DONE, 'true');
  },
  async getMindfulnessScore() {
    const v = await AsyncStorage.getItem(KEYS.MINDFULNESS_SCORE);
    return v !== null ? parseInt(v) : null;
  },

  async touchStreak() {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = await AsyncStorage.getItem(KEYS.STREAK_LAST_DATE);
    let count = parseInt(await AsyncStorage.getItem(KEYS.STREAK_COUNT), 10) || 0;

    if (lastDate === today) return count || 1;

    if (lastDate) {
      const diffDays = Math.round((new Date(today) - new Date(lastDate)) / 86400000);
      count = diffDays === 1 ? count + 1 : 1;
    } else {
      count = 1;
    }

    await AsyncStorage.setItem(KEYS.STREAK_LAST_DATE, today);
    await AsyncStorage.setItem(KEYS.STREAK_COUNT, String(count));
    return count;
  },

  async clearAll() {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
