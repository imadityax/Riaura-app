// ─────────────────────────────────────────────────────────────────────────────
// XP engine — one place for the app's progression math.
// XP is stored in AsyncStorage (storage.getXp / storage.addXp); this module
// turns a raw XP total into a level, a title and progress toward the next
// level, and defines the XP rewards each action pays out.
// ─────────────────────────────────────────────────────────────────────────────

export const XP_REWARDS = {
  DOMAIN_COMPLETE: 120,   // finishing any assessment domain (WHO or RiAura)
  DAILY_OPEN:      10,    // opening the app on a new streak day
};

// Cumulative XP needed to REACH each level (index 0 = level 1).
// Gentle early curve so the first sessions level up fast, then it stretches.
const THRESHOLDS = [];
for (let lvl = 1, total = 0; lvl <= 60; lvl++) {
  THRESHOLDS.push(total);
  total += 100 + (lvl - 1) * 40;
}

const TITLES = [
  [1,  'Curious Learner'],
  [3,  'Emerging Mind'],
  [5,  'Rising Thinker'],
  [8,  'Neural Explorer'],
  [12, 'Deep Thinker'],
  [16, 'Cognitive Athlete'],
  [20, 'Logic Architect'],
  [28, 'Master Intellect'],
  [38, 'Neural Sage'],
  [50, 'Limitless Mind'],
];

export function levelFromXp(xp = 0) {
  let level = 1;
  while (level < THRESHOLDS.length && xp >= THRESHOLDS[level]) level++;
  const floor = THRESHOLDS[level - 1];
  const ceil  = level < THRESHOLDS.length ? THRESHOLDS[level] : floor + 1;
  const title = TITLES.filter(([l]) => level >= l).pop()[1];
  return {
    level,
    title,
    xp,
    intoLevel:  xp - floor,
    needed:     ceil - floor,
    progress:   Math.min(1, (xp - floor) / (ceil - floor)),
    nextTitle:  (TITLES.find(([l]) => l > level) || [null, null])[1],
  };
}

// Global rank estimate from the combined intelligence score.
export function rankFromScore(score) {
  if (score >= 90) return 'Top 5%';
  if (score >= 80) return 'Top 10%';
  if (score >= 70) return 'Top 14%';
  if (score >= 60) return 'Top 25%';
  if (score >= 1)  return 'Top 60%';
  return '—';
}

// "Neural energy" — a daily-feeling stat derived from streak + activity so it
// moves every session even before real scores exist.
export function neuralEnergy({ streak = 0, domainsDone = 0 }) {
  return Math.min(98, 52 + streak * 5 + domainsDone * 2);
}

// Brain-map completion: 8 WHO domains + 8 RiAura domains = 16 pathways.
export function neuralMap(whoMap = {}, riaMap = {}) {
  const done = Object.keys(whoMap).length + Object.keys(riaMap).length;
  return { done, total: 16, percent: Math.round((done / 16) * 100) };
}
