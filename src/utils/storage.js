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
  MINDFULNESS_DOMAIN_SCORES: 'rhims_mindfulness_domain_scores',
  RIAURA_DOMAIN_SCORES: 'rhims_riaura_domain_scores',
  STREAK_COUNT:      'rhims_streak_count',
  STREAK_LAST_DATE:  'rhims_streak_last_date',
  CHAT_HISTORY:      'rhims_chat_history',
  GOALS:             'rhims_dev_goals',
  REFLECTIONS:       'rhims_reflections',
  ONBOARDED:         'rhims_onboarded',
  PROFILE_PHOTO:     'rhims_profile_photo',
  XP_TOTAL:          'rhims_xp_total',
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

  // Update profile fields without touching phase progress
  async updateRegistration(data) {
    await AsyncStorage.setItem(KEYS.REGISTRATION, JSON.stringify(data));
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

  async saveMindfulnessDomainScore(domainNum, entry) {
    const v = await AsyncStorage.getItem(KEYS.MINDFULNESS_DOMAIN_SCORES);
    const map = v ? JSON.parse(v) : {};
    map[domainNum] = entry;
    await AsyncStorage.setItem(KEYS.MINDFULNESS_DOMAIN_SCORES, JSON.stringify(map));
    return map;
  },
  async getMindfulnessDomainScores() {
    const v = await AsyncStorage.getItem(KEYS.MINDFULNESS_DOMAIN_SCORES);
    return v ? JSON.parse(v) : {};
  },

  // ── RiAura activity-based domain scores (parallel to the WHO track) ──
  async saveRiauraDomainScore(domainNum, entry) {
    const v = await AsyncStorage.getItem(KEYS.RIAURA_DOMAIN_SCORES);
    const map = v ? JSON.parse(v) : {};
    map[domainNum] = entry;
    await AsyncStorage.setItem(KEYS.RIAURA_DOMAIN_SCORES, JSON.stringify(map));
    return map;
  },
  async getRiauraDomainScores() {
    const v = await AsyncStorage.getItem(KEYS.RIAURA_DOMAIN_SCORES);
    return v ? JSON.parse(v) : {};
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

  // ── XP (gamified progression) ──
  async getXp() {
    return parseInt(await AsyncStorage.getItem(KEYS.XP_TOTAL), 10) || 0;
  },
  async addXp(amount) {
    const total = (parseInt(await AsyncStorage.getItem(KEYS.XP_TOTAL), 10) || 0) + amount;
    await AsyncStorage.setItem(KEYS.XP_TOTAL, String(total));
    return total;
  },

  // ── Chat history (AI Coach) ──
  async saveChatHistory(messages) {
    await AsyncStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(messages.slice(-60)));
  },
  async getChatHistory() {
    const v = await AsyncStorage.getItem(KEYS.CHAT_HISTORY);
    return v ? JSON.parse(v) : [];
  },
  async clearChatHistory() {
    await AsyncStorage.removeItem(KEYS.CHAT_HISTORY);
  },

  // ── Development goals ──
  async saveGoals(goals) {
    await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
  },
  async getGoals() {
    const v = await AsyncStorage.getItem(KEYS.GOALS);
    return v ? JSON.parse(v) : [];
  },

  // ── Post-assessment reflections ──
  async addReflection(entry) {
    const v = await AsyncStorage.getItem(KEYS.REFLECTIONS);
    const list = v ? JSON.parse(v) : [];
    list.push({ ...entry, at: new Date().toISOString() });
    await AsyncStorage.setItem(KEYS.REFLECTIONS, JSON.stringify(list.slice(-100)));
    return list;
  },
  async getReflections() {
    const v = await AsyncStorage.getItem(KEYS.REFLECTIONS);
    return v ? JSON.parse(v) : [];
  },

  // ── Profile photo (base64 data URI, persists across restarts) ──
  async saveProfilePhoto(dataUri) {
    await AsyncStorage.setItem(KEYS.PROFILE_PHOTO, dataUri);
  },
  async getProfilePhoto() {
    return await AsyncStorage.getItem(KEYS.PROFILE_PHOTO);
  },
  async removeProfilePhoto() {
    await AsyncStorage.removeItem(KEYS.PROFILE_PHOTO);
  },

  // ── Onboarding flag (device-level, survives sign-out) ──
  async setOnboarded() {
    await AsyncStorage.setItem(KEYS.ONBOARDED, 'true');
  },
  async getOnboarded() {
    return (await AsyncStorage.getItem(KEYS.ONBOARDED)) === 'true';
  },

  // ── Cloud restore ──
  // Writes a Firestore user document into local storage so progress
  // follows the account across devices and reinstalls.
  async hydrateFromCloud(data) {
    if (!data) return;
    const writes = [];
    if (data.profile)       writes.push([KEYS.REGISTRATION, JSON.stringify(data.profile)]);
    if (data.phase != null) writes.push([KEYS.PHASE, String(data.phase)]);
    if (data.scores)        writes.push([KEYS.SCORES, JSON.stringify(data.scores)]);
    if (data.phase2Answers?.answers?.length) {
      writes.push([KEYS.PHASE2_ANSWERS, JSON.stringify(data.phase2Answers.answers)]);
      writes.push([KEYS.PHASE2_DOMAIN, String(data.phase2Answers.domainIndex ?? 0)]);
    }
    if (data.phase3Scores?.scores?.length) {
      writes.push([KEYS.PHASE3_SCORES, JSON.stringify(data.phase3Scores.scores)]);
      writes.push([KEYS.PHASE3_TASK, String(data.phase3Scores.taskIndex ?? 0)]);
    }
    if (data.phase4Marks != null) writes.push([KEYS.PHASE4_MARKS, String(data.phase4Marks)]);
    if (data.mindfulness?.score != null) {
      writes.push([KEYS.MINDFULNESS_SCORE, String(data.mindfulness.score)]);
      writes.push([KEYS.MINDFULNESS_DONE, 'true']);
    }
    if (data.mindfulnessDomains) {
      writes.push([KEYS.MINDFULNESS_DOMAIN_SCORES, JSON.stringify(data.mindfulnessDomains)]);
    }
    if (data.riauraDomains) {
      writes.push([KEYS.RIAURA_DOMAIN_SCORES, JSON.stringify(data.riauraDomains)]);
    }
    if (data.devGoals)    writes.push([KEYS.GOALS, JSON.stringify(data.devGoals)]);
    if (data.reflections) writes.push([KEYS.REFLECTIONS, JSON.stringify(data.reflections)]);
    if (data.photoUrl)    writes.push([KEYS.PROFILE_PHOTO, data.photoUrl]);
    if (writes.length) await AsyncStorage.multiSet(writes);
  },

  async clearAll() {
    // Keep the onboarding flag so returning users skip the intro
    const keep = new Set([KEYS.ONBOARDED]);
    await AsyncStorage.multiRemove(Object.values(KEYS).filter(k => !keep.has(k)));
  },
};
