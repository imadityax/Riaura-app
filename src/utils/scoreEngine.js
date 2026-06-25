import { LABS } from '../data/labsData';

export function calcPhase2Score(answers) {
  // answers: array of 40 numbers (8 domains × 5 questions), each 1–5
  const total = answers.reduce((s, v) => s + v, 0);
  return { marks: total, percent: (total / 40) * 100 };
}

export function calcPhase3Score(taskScores) {
  // taskScores: array of 8 numbers, each 0–5
  const total = taskScores.reduce((s, v) => s + v, 0);
  return { marks: total, percent: (total / 40) * 100 };
}

export function calcCombinedScore(phase2Marks, phase3Marks) {
  const total = phase2Marks + phase3Marks;
  const percent = (total / 80) * 100;
  return { total, percent, isHighPerformance: percent >= 60 };
}

export function calcCIS(combinedPercent) {
  return Math.round(combinedPercent);
}

export function calcGPS(cis) {
  return 100 - cis;
}

// domainScores: array of 8 domain raw scores (each 0–5)
export function calcDomainPercents(p2Answers, p3TaskScores) {
  // p2Answers: 40 answers (flat, 5 per domain)
  // p3TaskScores: 8 task scores (one per domain)
  return p2Answers
    ? Array.from({ length: 8 }, (_, i) => {
        const p2Raw = p2Answers.slice(i * 5, i * 5 + 5).reduce((s, v) => s + v, 0); // max 25
        const p3Raw = (p3TaskScores?.[i] ?? 0); // max 5
        const combined = p2Raw + p3Raw; // max 30
        return Math.round((combined / 30) * 100);
      })
    : Array(8).fill(0);
}

export function calcLabReadiness(domainPercents) {
  return LABS.map((lab) => {
    const relevantScores = lab.domains.map((d) => domainPercents[d]);
    const avg = relevantScores.reduce((s, v) => s + v, 0) / relevantScores.length;
    return { ...lab, readiness: Math.round(avg) };
  });
}

export function getTopLabs(labReadiness, n = 3) {
  return [...labReadiness].sort((a, b) => b.readiness - a.readiness).slice(0, n);
}

export function calcHII(phase2Marks, phase3Marks, phase4Marks = null) {
  if (phase4Marks !== null) {
    return Math.min(100, phase2Marks + phase3Marks + phase4Marks);
  }
  return Math.round(((phase2Marks + phase3Marks) / 80) * 100);
}
