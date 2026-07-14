export const AGE_GROUPS = [
  { key: 'g3_6',   label: '3–6',   min: 3,  max: 6   },
  { key: 'g6_9',   label: '6–9',   min: 6,  max: 9   },
  { key: 'g9_12',  label: '9–12',  min: 9,  max: 12  },
  { key: 'g12_18', label: '12–18', min: 12, max: 18  },
  { key: 'g18_30', label: '18–30', min: 18, max: 30  },
  { key: 'g30_45', label: '30–45', min: 30, max: 45  },
  { key: 'g45_60', label: '45–60', min: 45, max: 60  },
  { key: 'g60p',   label: '60+',   min: 60, max: 200 },
];

export function getAgeGroup(age) {
  const n = parseInt(age, 10);
  return AGE_GROUPS.find(g => n >= g.min && n < g.max) || AGE_GROUPS[AGE_GROUPS.length - 1];
}

export const MINDFULNESS_QUESTIONS = {
  g3_6: {
    framework: 'C-OMM Scale',
    scale: 7,
    scaleLabels: ['1\nNever', '2', '3', '4\nSometimes', '5', '6', '7\nAlways'],
    questions: [
      { id: 1, text: "Child displays interest or engages in questioning about others' feelings or perspectives.", difficulty: 'Moderate', reverse: false },
      { id: 2, text: "Child is receptive to the present experience including others, the environment, and oneself.", difficulty: 'Easy',     reverse: false },
      { id: 3, text: "Child frequently or for extended periods of time attends to external stimulus.",            difficulty: 'Moderate', reverse: false },
      { id: 4, text: "Child frequently attends to internal stimulus for extended periods of time. Speaking about or indicating awareness of body sensations, memories or imaginary ideas.", difficulty: 'Moderate', reverse: false },
      { id: 5, text: "Child engages in self-generated switching of attention from one external stimulus to another.", difficulty: 'Moderate', reverse: false },
    ],
  },

  g6_9: {
    framework: 'S-CAMM',
    scale: 5,
    scaleLabels: ['1\nNever', '2\nRarely', '3\nSometimes', '4\nOften', '5\nAlways'],
    questions: [
      { id: 1,  text: "I get upset with myself for having feelings that don't make sense.",                   difficulty: 'Moderate', reverse: false },
      { id: 2,  text: "At school, I walk from class to class without noticing what I'm doing.",               difficulty: 'Easy',     reverse: false },
      { id: 3,  text: "I keep myself busy so I don't notice my thoughts or feelings.",                        difficulty: 'Moderate', reverse: false },
      { id: 4,  text: "I tell myself that I shouldn't feel the way I'm feeling.",                             difficulty: 'Moderate', reverse: false },
      { id: 5,  text: "I push away thoughts that I don't like.",                                              difficulty: 'Moderate', reverse: false },
      { id: 6,  text: "It's hard for me to pay attention to only one thing at a time.",                       difficulty: 'Easy',     reverse: false },
      { id: 7,  text: "I get upset with myself for having certain thoughts.",                                 difficulty: 'Moderate', reverse: false },
      { id: 8,  text: "I think about things that have happened in the past instead of thinking about things that are happening right now.", difficulty: 'Moderate', reverse: false },
      { id: 9,  text: "I think that some of my feelings are bad and that I shouldn't have them.",             difficulty: 'Moderate', reverse: false },
      { id: 10, text: "I stop myself from having feelings that I don't like.",                                difficulty: 'Moderate', reverse: false },
    ],
  },

  g9_12: {
    framework: 'MAAS-A',
    scale: 5,
    scaleLabels: ['1\nAlmost\nAlways', '2\nVery\nOften', '3\nSomewhat\nOften', '4\nSomewhat\nRarely', '5\nAlmost\nNever'],
    questions: [
      { id: 1,  text: "I could be experiencing some emotion and not be conscious of it until some time later.",         difficulty: 'Hard',     reverse: false },
      { id: 2,  text: "I break or spill things because of carelessness, not paying attention, or thinking of something else.", difficulty: 'Easy', reverse: false },
      { id: 3,  text: "I find it difficult to stay focused on what's happening in the present.",                       difficulty: 'Moderate', reverse: false },
      { id: 4,  text: "I tend to walk quickly to get where I'm going without paying attention to what I experience along the way.", difficulty: 'Moderate', reverse: false },
      { id: 5,  text: "I tend not to notice feelings of physical tension or discomfort until they really grab my attention.", difficulty: 'Hard', reverse: false },
      { id: 6,  text: "I forget a person's name almost as soon as I've been told it for the first time.",               difficulty: 'Easy',     reverse: false },
      { id: 7,  text: "It seems I am \"running on automatic\" without much awareness of what I'm doing.",               difficulty: 'Moderate', reverse: false },
      { id: 8,  text: "I rush through activities without being really attentive to them.",                             difficulty: 'Easy',     reverse: false },
      { id: 9,  text: "I get so focused on the goal I want to achieve that I lose touch with what I am doing right now to get there.", difficulty: 'Moderate', reverse: false },
      { id: 10, text: "I do jobs or tasks automatically, without being aware of what I'm doing.",                      difficulty: 'Moderate', reverse: false },
      { id: 11, text: "I find myself listening to someone with one ear, doing something else at the same time.",        difficulty: 'Easy',     reverse: false },
      { id: 12, text: "I find myself preoccupied with the future or the past.",                                        difficulty: 'Moderate', reverse: false },
      { id: 13, text: "I find myself doing things without paying attention.",                                           difficulty: 'Easy',     reverse: false },
      { id: 14, text: "I snack without being aware that I'm eating.",                                                   difficulty: 'Easy',     reverse: false },
    ],
  },

  g12_18: {
    framework: 'FFMQ',
    scale: 5,
    scaleLabels: ['1\nNever/\nRarely', '2\nRarely', '3\nSometimes', '4\nOften', '5\nVery\nOften'],
    questions: [
      { id: 1,  text: "When I take a shower or a bath, I stay alert to the sensations of water on my body.",           difficulty: 'Easy',     reverse: false },
      { id: 2,  text: "I'm good at finding words to describe my feelings.",                                            difficulty: 'Hard',     reverse: false },
      { id: 3,  text: "I don't pay attention to what I'm doing because I'm daydreaming, worrying, or otherwise distracted.", difficulty: 'Moderate', reverse: true },
      { id: 4,  text: "I believe some of my thoughts are abnormal or bad and I shouldn't think that way.",             difficulty: 'Hard',     reverse: true },
      { id: 5,  text: "When I have distressing thoughts or images, I \"step back\" and am aware of the thought or image without getting taken over by it.", difficulty: 'Hard', reverse: false },
      { id: 6,  text: "I notice how foods and drinks affect my thoughts, bodily sensations, and emotions.",            difficulty: 'Moderate', reverse: false },
      { id: 7,  text: "I have trouble thinking of the right words to express how I feel about things.",                difficulty: 'Moderate', reverse: true },
      { id: 8,  text: "I do jobs or tasks automatically without being aware of what I'm doing.",                       difficulty: 'Easy',     reverse: true },
      { id: 9,  text: "I think some of my emotions are bad or inappropriate and I shouldn't feel them.",               difficulty: 'Moderate', reverse: true },
      { id: 10, text: "When I have distressing thoughts or images I am able just to notice them without reacting.",    difficulty: 'Easy',     reverse: false },
      { id: 11, text: "I pay attention to sensations, such as the wind in my hair or sun on my face.",                 difficulty: 'Easy',     reverse: false },
      { id: 12, text: "Even when I'm feeling terribly upset I can find a way to put it into words.",                   difficulty: 'Moderate', reverse: false },
      { id: 13, text: "I find myself doing things without paying attention.",                                           difficulty: 'Hard',     reverse: true },
      { id: 14, text: "I tell myself I shouldn't be feeling the way I'm feeling.",                                     difficulty: 'Easy',     reverse: true },
      { id: 15, text: "When I have distressing thoughts or images I just notice them and let them go.",                difficulty: 'Hard',     reverse: false },
    ],
  },

  g18_30: {
    framework: 'FFMQ',
    scale: 5,
    scaleLabels: ['1\nNever/\nRarely', '2\nRarely', '3\nSometimes', '4\nOften', '5\nVery\nOften'],
    questions: [
      { id: 1,  text: "When I take a shower or a bath, I stay alert to the sensations of water on my body.",           difficulty: 'Hard',     reverse: false },
      { id: 2,  text: "I'm good at finding words to describe my feelings.",                                            difficulty: 'Easy',     reverse: false },
      { id: 3,  text: "I don't pay attention to what I'm doing because I'm daydreaming, worrying, or otherwise distracted.", difficulty: 'Moderate', reverse: true },
      { id: 4,  text: "I believe some of my thoughts are abnormal or bad and I shouldn't think that way.",             difficulty: 'Easy',     reverse: true },
      { id: 5,  text: "When I have distressing thoughts or images, I \"step back\" and am aware of the thought or image without getting taken over by it.", difficulty: 'Moderate', reverse: false },
      { id: 6,  text: "I notice how foods and drinks affect my thoughts, bodily sensations, and emotions.",            difficulty: 'Hard',     reverse: false },
      { id: 7,  text: "I have trouble thinking of the right words to express how I feel about things.",                difficulty: 'Hard',     reverse: true },
      { id: 8,  text: "I do jobs or tasks automatically without being aware of what I'm doing.",                       difficulty: 'Moderate', reverse: true },
      { id: 9,  text: "I think some of my emotions are bad or inappropriate and I shouldn't feel them.",               difficulty: 'Easy',     reverse: true },
      { id: 10, text: "When I have distressing thoughts or images I am able just to notice them without reacting.",    difficulty: 'Moderate', reverse: false },
      { id: 11, text: "I pay attention to sensations, such as the wind in my hair or sun on my face.",                 difficulty: 'Moderate', reverse: false },
      { id: 12, text: "Even when I'm feeling terribly upset I can find a way to put it into words.",                   difficulty: 'Moderate', reverse: false },
      { id: 13, text: "I find myself doing things without paying attention.",                                           difficulty: 'Hard',     reverse: true },
      { id: 14, text: "I tell myself I shouldn't be feeling the way I'm feeling.",                                     difficulty: 'Moderate', reverse: true },
      { id: 15, text: "When I have distressing thoughts or images I just notice them and let them go.",                difficulty: 'Easy',     reverse: false },
    ],
  },

  g30_45: {
    framework: 'FFMQ',
    scale: 5,
    scaleLabels: ['1\nNever/\nRarely', '2\nRarely', '3\nSometimes', '4\nOften', '5\nVery\nOften'],
    questions: [
      { id: 1,  text: "When I take a shower or a bath, I stay alert to the sensations of water on my body.",           difficulty: 'Moderate', reverse: false },
      { id: 2,  text: "I'm good at finding words to describe my feelings.",                                            difficulty: 'Moderate', reverse: false },
      { id: 3,  text: "I don't pay attention to what I'm doing because I'm daydreaming, worrying, or otherwise distracted.", difficulty: 'Easy',     reverse: true },
      { id: 4,  text: "I believe some of my thoughts are abnormal or bad and I shouldn't think that way.",             difficulty: 'Moderate', reverse: true },
      { id: 5,  text: "When I have distressing thoughts or images, I \"step back\" and am aware of the thought or image without getting taken over by it.", difficulty: 'Easy', reverse: false },
      { id: 6,  text: "I notice how foods and drinks affect my thoughts, bodily sensations, and emotions.",            difficulty: 'Hard',     reverse: false },
      { id: 7,  text: "I have trouble thinking of the right words to express how I feel about things.",                difficulty: 'Moderate', reverse: true },
      { id: 8,  text: "I do jobs or tasks automatically without being aware of what I'm doing.",                       difficulty: 'Hard',     reverse: true },
      { id: 9,  text: "I think some of my emotions are bad or inappropriate and I shouldn't feel them.",               difficulty: 'Easy',     reverse: true },
      { id: 10, text: "When I have distressing thoughts or images I am able just to notice them without reacting.",    difficulty: 'Easy',     reverse: false },
      { id: 11, text: "I pay attention to sensations, such as the wind in my hair or sun on my face.",                 difficulty: 'Easy',     reverse: false },
      { id: 12, text: "Even when I'm feeling terribly upset I can find a way to put it into words.",                   difficulty: 'Moderate', reverse: false },
      { id: 13, text: "I find myself doing things without paying attention.",                                           difficulty: 'Easy',     reverse: true },
      { id: 14, text: "I tell myself I shouldn't be feeling the way I'm feeling.",                                     difficulty: 'Moderate', reverse: true },
      { id: 15, text: "When I have distressing thoughts or images I just notice them and let them go.",                difficulty: 'Hard',     reverse: false },
    ],
  },

  g45_60: {
    framework: 'FFMQ',
    scale: 5,
    scaleLabels: ['1\nNever/\nRarely', '2\nRarely', '3\nSometimes', '4\nOften', '5\nVery\nOften'],
    questions: [
      { id: 1,  text: "When I take a shower or a bath, I stay alert to the sensations of water on my body.",           difficulty: 'Easy',     reverse: false },
      { id: 2,  text: "I'm good at finding words to describe my feelings.",                                            difficulty: 'Hard',     reverse: false },
      { id: 3,  text: "I don't pay attention to what I'm doing because I'm daydreaming, worrying, or otherwise distracted.", difficulty: 'Easy',     reverse: true },
      { id: 4,  text: "I believe some of my thoughts are abnormal or bad and I shouldn't think that way.",             difficulty: 'Moderate', reverse: true },
      { id: 5,  text: "When I have distressing thoughts or images, I \"step back\" and am aware of the thought or image without getting taken over by it.", difficulty: 'Moderate', reverse: false },
      { id: 6,  text: "I notice how foods and drinks affect my thoughts, bodily sensations, and emotions.",            difficulty: 'Easy',     reverse: false },
      { id: 7,  text: "I have trouble thinking of the right words to express how I feel about things.",                difficulty: 'Moderate', reverse: true },
      { id: 8,  text: "I do jobs or tasks automatically without being aware of what I'm doing.",                       difficulty: 'Moderate', reverse: true },
      { id: 9,  text: "I think some of my emotions are bad or inappropriate and I shouldn't feel them.",               difficulty: 'Hard',     reverse: true },
      { id: 10, text: "When I have distressing thoughts or images I am able just to notice them without reacting.",    difficulty: 'Moderate', reverse: false },
      { id: 11, text: "I pay attention to sensations, such as the wind in my hair or sun on my face.",                 difficulty: 'Moderate', reverse: false },
      { id: 12, text: "Even when I'm feeling terribly upset I can find a way to put it into words.",                   difficulty: 'Moderate', reverse: false },
      { id: 13, text: "I find myself doing things without paying attention.",                                           difficulty: 'Hard',     reverse: true },
      { id: 14, text: "I tell myself I shouldn't be feeling the way I'm feeling.",                                     difficulty: 'Moderate', reverse: true },
      { id: 15, text: "When I have distressing thoughts or images I just notice them and let them go.",                difficulty: 'Moderate', reverse: false },
    ],
  },

  g60p: {
    framework: 'FFMQ',
    scale: 5,
    scaleLabels: ['1\nNever/\nRarely', '2\nRarely', '3\nSometimes', '4\nOften', '5\nVery\nOften'],
    questions: [
      { id: 1,  text: "When I take a shower or a bath, I stay alert to the sensations of water on my body.",           difficulty: 'Hard',     reverse: false },
      { id: 2,  text: "I'm good at finding words to describe my feelings.",                                            difficulty: 'Hard',     reverse: false },
      { id: 3,  text: "I don't pay attention to what I'm doing because I'm daydreaming, worrying, or otherwise distracted.", difficulty: 'Moderate', reverse: true },
      { id: 4,  text: "I believe some of my thoughts are abnormal or bad and I shouldn't think that way.",             difficulty: 'Easy',     reverse: true },
      { id: 5,  text: "When I have distressing thoughts or images, I \"step back\" and am aware of the thought or image without getting taken over by it.", difficulty: 'Moderate', reverse: false },
      { id: 6,  text: "I notice how foods and drinks affect my thoughts, bodily sensations, and emotions.",            difficulty: 'Easy',     reverse: false },
      { id: 7,  text: "I have trouble thinking of the right words to express how I feel about things.",                difficulty: 'Moderate', reverse: true },
      { id: 8,  text: "I do jobs or tasks automatically without being aware of what I'm doing.",                       difficulty: 'Moderate', reverse: true },
      { id: 9,  text: "I think some of my emotions are bad or inappropriate and I shouldn't feel them.",               difficulty: 'Easy',     reverse: true },
      { id: 10, text: "When I have distressing thoughts or images I am able just to notice them without reacting.",    difficulty: 'Moderate', reverse: false },
      { id: 11, text: "I pay attention to sensations, such as the wind in my hair or sun on my face.",                 difficulty: 'Moderate', reverse: false },
      { id: 12, text: "Even when I'm feeling terribly upset I can find a way to put it into words.",                   difficulty: 'Moderate', reverse: false },
      { id: 13, text: "I find myself doing things without paying attention.",                                           difficulty: 'Hard',     reverse: true },
      { id: 14, text: "I tell myself I shouldn't be feeling the way I'm feeling.",                                     difficulty: 'Easy',     reverse: true },
      { id: 15, text: "When I have distressing thoughts or images I just notice them and let them go.",                difficulty: 'Moderate', reverse: false },
    ],
  },
};

export function calcMindfulnessScore(groupKey, answers) {
  const group = MINDFULNESS_QUESTIONS[groupKey];
  if (!group) return 0;
  const { scale, questions } = group;
  let total = 0;
  questions.forEach((q, i) => {
    const raw = answers[i] || 0;
    const val = q.reverse ? (scale + 1) - raw : raw;
    total += val;
  });
  const maxScore = questions.length * scale;
  return Math.round((total / maxScore) * 100);
}

// ── Domain-specific question banks ─────────────────────────────
// Scoring modes:
//   'intensity' — C-OMM 7-point intensity scale; score = sum of raw values,
//                 expression band from item average (1–2 Low, 3–5 Mid, 6–7 High)
//   'deficit'   — S-CAMM / MAAS-A: items describe mindfulness lapses rated by
//                 frequency (1 Never … 5 Always); item score = 5 − answer
//   'standard'  — FFMQ: item score = answer, or (scale + 1) − answer when reverse
// Minimum time per item (minutes) from the assessment specification sheet.

const DOMAIN1_MIN_TIME = {
  g3_6:  [2.5, 3, 3, 5.5, 3.5],
  g6_9:  [3, 3.25, 3, 2.75, 2, 3.5, 2.25, 5, 3.75, 2.5],
  g9_12: [4, 4, 3.25, 5, 4.25, 4.25, 3.5, 2.5, 6.25, 3.25, 4, 2.5, 2, 2],
  ffmq:  [4.75, 2.25, 3.75, 4, 6, 3.25, 3.75, 3.25, 3.75, 4, 4.25, 4, 2, 2.75, 3.75],
};

const FFMQ_REVERSE = [false, false, true, true, false, false, true, true, true, false, false, false, true, true, false];

function buildDomain1Bank(groupKey) {
  const base = MINDFULNESS_QUESTIONS[groupKey];
  const isFfmq = base.framework === 'FFMQ';
  const times  = isFfmq ? DOMAIN1_MIN_TIME.ffmq : DOMAIN1_MIN_TIME[groupKey];
  const scoring =
    groupKey === 'g3_6'                        ? 'intensity' :
    groupKey === 'g6_9' || groupKey === 'g9_12' ? 'deficit'   : 'standard';
  return {
    ...base,
    scoring,
    // Deficit items are rated by lapse frequency, so MAAS-A needs plain
    // Never→Always labels instead of its inverted Almost Always→Almost Never set.
    scaleLabels: groupKey === 'g9_12'
      ? ['1\nNever', '2\nRarely', '3\nSometimes', '4\nOften', '5\nAlways']
      : base.scaleLabels,
    questions: base.questions.map((q, i) => ({
      ...q,
      reverse: isFfmq ? FFMQ_REVERSE[i] : q.reverse,
      minTime: times[i],
    })),
  };
}

// ── Domain 2 · Memory Intelligence ──────────────────────────────
// All PRMQ / PRMQ-C items describe memory lapses rated by frequency and use
// the sheet's "5 − cell value" (deficit) scoring. The 3–6 RiAura items are
// observations of memory successes, so they score normally; only item 3
// ("completely forgets…") is lapse-worded and reverse-scored.

const FREQ_LABELS = ['1\nNever', '2\nRarely', '3\nSometimes', '4\nOften', '5\nAlways'];

const D2_PRMQC_TEXTS = [
  "Does your child decide to do something in a few minutes' time and then forget to do it?",
  "Does your child fail to recognize a place he/she has visited before?",
  "Does your child fail to do something he/she was supposed to do a few minutes later even though it's there in front of him/her, like turning off the TV or Gameboy or picking up his/her backpack before heading to school?",
  "Does your child forget something that he/she was told a few minutes before?",
  "Does your child forget to get parent notices signed, or go to extracurricular activities if he/she is not prompted by someone else or by a reminder such as an agenda or planner?",
  "Does your child fail to recognize a character in a book or television show from scene to scene?",
  "Does your child forget to either bring or turn in his/her homework that is completed?",
  "Does your child fail to recall things that have happened to him/her in the last few days?",
  "Does your child repeat the same story to the same person on different occasions?",
  "Does your child intend to take something with him/her before leaving a room or going out, but minutes later leave it behind, even though it's there in front of him/her?",
  "Does your child mislay something that he/she has just put down, like a book, a drink, or his/her jacket/sweater?",
  "Does your child forget to pass on a request from a teacher or give something to someone for a friend?",
  "Does your child look at something without realizing he/she has seen it moments before?",
  "If your child tried to contact a friend or relative but they were out, would he/she forget to try again later?",
  "Does your child forget the content of the cartoon he/she watched on television the previous day?",
  "Does your child forget to say something he/she had meant to mention a few minutes prior?",
  "Does your child ask someone a question and ask it again when he/she sees that person later?",
  "Does your child ever do something but cannot remember if he/she has done it after a while?",
];

const D2_PRMQ_TEXTS = [
  "Do you decide to do something in a few minutes' time and then forget to do it?",
  "Do you fail to recognise a place you have visited before?",
  "Do you fail to do something you were supposed to do a few minutes later even though it's there in front of you, like take a pill or turn off the kettle?",
  "Do you forget something that you were told a few minutes before?",
  "Do you forget appointments if you are not prompted by someone else or by a reminder such as a calendar or diary?",
  "Do you fail to recognise a character in a radio or television show from scene to scene?",
  "Do you forget to buy something you planned to buy, like a birthday card, even when you see the shop?",
  "Do you fail to recall things that have happened to you in the last few days?",
  "Do you repeat the same story to the same person on different occasions?",
  "Do you intend to take something with you before leaving a room or going out, but minutes later leave it behind, even though it's there in front of you?",
  "Do you mislay something that you have just put down, like a magazine or glasses?",
  "Do you fail to mention or give something to a visitor that you were asked to pass on?",
  "Do you look at something without realising you have seen it moments before?",
  "If you tried to contact a friend or relative who was out, would you forget to try again later?",
  "Do you forget what you watched on television the previous day?",
  "Do you forget to tell someone something you had meant to mention a few minutes ago?",
];

function deficitBank(framework, texts, difficulties, times) {
  return {
    framework,
    scale: 5,
    scoring: 'deficit',
    scaleLabels: FREQ_LABELS,
    questions: texts.map((text, i) => ({
      id: i + 1, text, difficulty: difficulties[i], reverse: false, minTime: times[i],
    })),
  };
}

const D2_ADULT_PRMQ = deficitBank(
  'PRMQ',
  D2_PRMQ_TEXTS,
  ['Easy', 'Moderate', 'Hard', 'Easy', 'Moderate', 'Moderate', 'Moderate', 'Moderate', 'Easy', 'Hard', 'Easy', 'Hard', 'Moderate', 'Hard', 'Moderate', 'Easy'],
  [4.25, 2.75, 8.25, 3, 5.5, 4.25, 5, 4, 3.25, 7.5, 3.75, 4.5, 3.25, 4.75, 2.75, 4],
);

const DOMAIN2_QUESTIONS = {
  g3_6: {
    framework: 'RiAura Framework',
    scale: 5,
    scoring: 'standard',
    scaleLabels: FREQ_LABELS,
    questions: [
      { id: 1, text: '(Event-Based) Remembers to perform a simple requested action when they see a specific visual cue (e.g., putting a toy away when they see the toy bin).', difficulty: 'Easy',     reverse: false, minTime: 6.5 },
      { id: 2, text: '(Time-Based) Remembers to do something after a short time interval has passed without a visual reminder.',                                              difficulty: 'Moderate', reverse: false, minTime: 4 },
      { id: 3, text: '(Ongoing Task Difficulty) Completely forgets a previous instruction when introduced to a new, highly engaging play activity.',                          difficulty: 'Hard',     reverse: true,  minTime: 4.25 },
      { id: 4, text: '(Ongoing Task Difficulty) Maintains memory of an intention even when they are deeply distracted by a complex or difficult game.',                       difficulty: 'Hard',     reverse: false, minTime: 4.75 },
      { id: 5, text: '(Motivation) Shows significantly improved memory for executing a task when promised a small reward (e.g., a sticker or badge).',                        difficulty: 'Moderate', reverse: false, minTime: 4.75 },
      { id: 6, text: '(Delayed Retrieval) If they miss the exact moment to complete a task, they still realize it and complete it shortly after.',                            difficulty: 'Moderate', reverse: false, minTime: 5.25 },
      { id: 7, text: '(Delayed Execute) Remembers to deliver a message or item to someone, even if that person is busy and the child has to wait to tell them.',              difficulty: 'Hard',     reverse: false, minTime: 6.5 },
      { id: 8, text: '(Resource Allocation) Successfully balances playing their current game while keeping a future instruction in mind.',                                    difficulty: 'Hard',     reverse: false, minTime: 3.75 },
    ],
  },
  g6_9: deficitBank(
    'PRMQ-C',
    D2_PRMQC_TEXTS,
    ['Moderate', 'Easy', 'Easy', 'Moderate', 'Hard', 'Hard', 'Moderate', 'Moderate', 'Easy', 'Easy', 'Hard', 'Easy', 'Hard', 'Moderate', 'Moderate', 'Moderate', 'Moderate', 'Moderate'],
    [4.5, 3, 10, 3.25, 8, 4.5, 3.75, 4.25, 3.5, 7.5, 4.75, 5, 3.5, 5.25, 4, 4, 4.25, 4.25],
  ),
  g9_12: deficitBank(
    'PRMQ-C',
    D2_PRMQC_TEXTS,
    ['Easy', 'Moderate', 'Moderate', 'Easy', 'Moderate', 'Hard', 'Moderate', 'Moderate', 'Easy', 'Hard', 'Easy', 'Hard', 'Hard', 'Hard', 'Moderate', 'Easy', 'Easy', 'Hard'],
    [4.75, 3.25, 10.25, 3.5, 8.25, 4.75, 4, 4.5, 3.75, 7.75, 5, 5.25, 3.75, 5.5, 4.25, 4.25, 4.25, 4.5],
  ),
  g12_18: deficitBank(
    'PRMQ',
    D2_PRMQ_TEXTS,
    ['Easy', 'Moderate', 'Moderate', 'Easy', 'Moderate', 'Hard', 'Moderate', 'Moderate', 'Easy', 'Hard', 'Easy', 'Hard', 'Hard', 'Hard', 'Moderate', 'Easy'],
    [4.25, 2.75, 8, 3, 5.5, 4.25, 5, 4, 3.25, 7.25, 3.75, 4.5, 3.25, 4.75, 2.75, 4],
  ),
  g18_30: D2_ADULT_PRMQ,
  g30_45: D2_ADULT_PRMQ,
  g45_60: D2_ADULT_PRMQ,
  g60p:   D2_ADULT_PRMQ,
};

// ── Domain 3 · Processing Intelligence ──────────────────────────
// CHEXI (ages 3–12, parent/teacher observation) and CFQ (ages 12+) items all
// describe executive/processing lapses, so both use "5 − cell value" (deficit)
// scoring on a Never→Always frequency scale. The sheet repeats identical rows
// for each CHEXI group and each CFQ group, so the banks are shared.

const D3_CHEXI = deficitBank(
  'CHEXI',
  [
    'Has difficulty remembering lengthy instructions',
    "Seldom seems to be able to motivate him-/herself to do something that he/she doesn't want to do",
    'Has difficulty remembering what he/she is doing, in the middle of an activity',
    'Has difficulty following through on less appealing tasks unless he/she is promised some type of reward for doing so',
    'Has a tendency to do things without first thinking about what could happen',
    'When asked to do several things, he/she only remembers the first or last',
    'Has difficulty coming up with a different way of solving a problem when he/she gets stuck',
    'When something needs to be done, he/she is often distracted by something more appealing',
    'Easily forgets what he/she is asked to fetch',
    'Gets overly excited when something special is going to happen (e.g., going on a field trip, going to a party)',
    'Has clear difficulties doing things he/she finds boring',
    'Has difficulty planning for an activity (e.g., remembering to bring everything necessary for a field trip or things needed for school)',
    'Has difficulty holding back his/her activity despite being told to do so',
    'Has difficulty carrying out activities that require several steps (e.g., for younger children, getting completely dressed without reminders; for older children, doing all homework independently)',
    'In order to be able to concentrate, he/she must find the task appealing',
    'Has difficulty refraining from smiling or laughing in situations where it is inappropriate',
    'Has difficulty telling a story about something that has happened so that others may easily understand',
    'Has difficulty stopping an activity immediately upon being told to do so. For example, he/she needs to jump a couple of extra times or play on the computer a little bit longer after being asked to stop',
    'Has difficulty understanding verbal instructions unless he/she is also shown how to do something',
    'Has difficulty with tasks or activities that involve several steps',
    'Has difficulty thinking ahead or learning from experience',
    'Acts in a wilder way compared to other children in a group (e.g., at a birthday party or during a group activity)',
    'Has difficulty doing things that require mental effort, such as counting backwards',
    'Has difficulty keeping things in mind while he/she is doing something else',
  ],
  ['Moderate', 'Moderate', 'Moderate', 'Moderate', 'Easy', 'Moderate', 'Moderate', 'Moderate', 'Easy', 'Easy', 'Moderate', 'Moderate', 'Moderate', 'Moderate', 'Moderate', 'Moderate', 'Hard', 'Moderate', 'Moderate', 'Moderate', 'Hard', 'Easy', 'Hard', 'Hard'],
  [1.25, 4.75, 3.25, 4.75, 3.25, 3.25, 4, 3.5, 2, 5, 2, 5.25, 3, 6.25, 3.25, 3.25, 4, 9.25, 3.5, 2.5, 2, 5.5, 3, 3],
);

const D3_CFQ = deficitBank(
  'CFQ',
  [
    "Do you read something and find you haven't been thinking about it and must read it again?",
    'Do you find you forget why you went from one part of the house to the other?',
    'Do you fail to notice signposts on the road?',
    'Do you find you confuse right and left when giving directions?',
    'Do you bump into people?',
    "Do you find you forget whether you've turned off a light or a fire or locked the door?",
    "Do you fail to listen to people's names when you are meeting them?",
    'Do you say something and realize afterwards that it might be taken as insulting?',
    'Do you fail to hear people speaking to you when you are doing something else?',
    'Do you lose your temper and regret it?',
    'Do you leave important letters unanswered for days?',
    'Do you find you forget which way to turn on a road you know well but rarely use?',
    "Do you fail to see what you want in a supermarket (although it's there)?",
    "Do you find yourself suddenly wondering whether you've used a word correctly?",
    'Do you have trouble making up your mind?',
    'Do you find you forget appointments?',
    'Do you forget where you put something like a newspaper or a book?',
    'Do you find you accidentally throw away the thing you want and keep what you meant to throw away — as in the example of throwing away the matchbox and putting the used match in your pocket?',
    'Do you daydream when you ought to be listening to something?',
    "Do you find you forget people's names?",
    'Do you start doing one thing at home and get distracted into doing something else (unintentionally)?',
    'Do you find you can\'t quite remember something although it\'s "on the tip of your tongue"?',
    'Do you find you forget what you came to the shops to buy?',
    'Do you drop things?',
    "Do you find you can't think of anything to say?",
  ],
  ['Moderate', 'Easy', 'Moderate', 'Moderate', 'Easy', 'Moderate', 'Moderate', 'Hard', 'Moderate', 'Moderate', 'Hard', 'Hard', 'Moderate', 'Hard', 'Moderate', 'Moderate', 'Easy', 'Hard', 'Moderate', 'Easy', 'Moderate', 'Hard', 'Easy', 'Easy', 'Hard'],
  [4.25, 4.25, 2.25, 2.75, 1.25, 4.5, 3.25, 3.5, 3.75, 2, 2, 4.5, 3.5, 3, 2, 1.5, 3.25, 9.25, 2.75, 1.75, 4, 4, 3.25, 1, 2.5],
);

const DOMAIN3_QUESTIONS = {
  g3_6:   D3_CHEXI,
  g6_9:   D3_CHEXI,
  g9_12:  D3_CHEXI,
  g12_18: D3_CFQ,
  g18_30: D3_CFQ,
  g30_45: D3_CFQ,
  g45_60: D3_CFQ,
  g60p:   D3_CFQ,
};

// ── Domain 4 · Reasoning Intelligence ───────────────────────────
// Ages 3–6 use the Child Self-Regulation and Behavior framework (truth scale);
// ages 6+ use RiAura Framework reasoning scales (agree–disagree Likert).
// All banks use standard scoring with the sheet's explicit per-item
// Normal/Reverse flags (reverse = 6 − answer).

const AGREE_LABELS = ['1\nStrongly\nDisagree', '2\nDisagree', '3\nNeutral', '4\nAgree', '5\nStrongly\nAgree'];
const TRUTH_LABELS = ['1\nNot at all\ntrue', '2\nRarely\ntrue', '3\nSometimes\ntrue', '4\nMostly\ntrue', '5\nVery\ntrue'];

function likertBank(framework, scaleLabels, items) {
  return {
    framework,
    scale: scaleLabels.length,
    scoring: 'standard',
    scaleLabels,
    questions: items.map(([text, difficulty, minTime, reverse], i) => ({
      id: i + 1, text, difficulty, reverse: !!reverse, minTime,
    })),
  };
}

const D4_ADULT_30_45 = likertBank('RiAura Framework', AGREE_LABELS, [
  ['I evaluate facts before making important personal or professional decisions.', 'Moderate', 2.25],
  ['I analyze situations from multiple perspectives before reaching conclusions.', 'Hard', 2.25],
  ['I question assumptions before accepting them as correct.', 'Moderate', 2],
  ['I identify the root cause instead of focusing only on symptoms.', 'Hard', 2.75],
  ['I compare several possible solutions before making complex decisions.', 'Hard', 2.25],
  ['I remain objective even when I strongly disagree with others.', 'Hard', 2.25],
  ['I use evidence instead of assumptions when solving problems.', 'Moderate', 2.25],
  ['I review my decisions to learn from previous experiences.', 'Moderate', 2.25],
  ['I make important decisions without reviewing available information.', 'Moderate', 2, true],
  ['I recognize patterns that help me solve unfamiliar situations.', 'Hard', 2.25],
  ['I enjoy solving problems that require careful logical thinking.', 'Moderate', 2.25],
  ['I evaluate long-term consequences before making major decisions.', 'Hard', 2],
  ['I accept conclusions without verifying the supporting evidence.', 'Moderate', 2, true],
  ['I adjust my thinking when reliable evidence contradicts my beliefs.', 'Hard', 2.5],
  ['I reach conclusions before understanding the complete situation.', 'Moderate', 2, true],
  ['I connect information from different sources to solve difficult problems.', 'Hard', 2.5],
  ['I distinguish facts from opinions before making important judgments.', 'Hard', 2.25],
  ['I confidently solve new challenges using logical and structured thinking.', 'Hard', 2.25],
]);

const DOMAIN4_QUESTIONS = {
  g3_6: likertBank('Child Self-Regulation & Behavior', TRUTH_LABELS, [
    ['Persists with difficult tasks.', 'Hard', 1],
    ['Does not need much help with tasks.', 'Hard', 1.75],
    ['Persists with tasks until completed.', 'Moderate', 1.25],
    ['Chooses activities on their own.', 'Easy', 1.25],
    ['Likes to work things out for self.', 'Moderate', 1.75],
    ['Is impulsive, acts without thinking.', 'Easy', 1.25],
    ['Restless, does not keep still for long.', 'Easy', 1.75],
    ['Shows wide mood swings.', 'Moderate', 1],
    ['Often loses temper, has tantrums.', 'Easy', 1.25],
    ['Will play easily with new children.', 'Moderate', 1.5],
    ['Has regular friends.', 'Moderate', 0.75, true],
    ['Liked by other children.', 'Moderate', 1, true],
    ['Gets on well with other children.', 'Moderate', 1.5, true],
    ['Offers to help others.', 'Hard', 1, true],
    ['Shares sweets or toys with other children.', 'Hard', 1.75, true],
  ]),
  g6_9: likertBank('RiAura Framework', AGREE_LABELS, [
    ['I think before I choose an answer.', 'Easy', 1.75],
    ['I can tell why I picked my answer.', 'Easy', 2],
    ['I look for another way when something does not work.', 'Moderate', 2.5],
    ['I enjoy solving simple thinking puzzles.', 'Easy', 1.5],
    ['I notice what is different between two similar things.', 'Moderate', 2.25],
    ['I ask questions when I do not understand something.', 'Moderate', 2.25],
    ['I can find the missing part in a simple pattern.', 'Moderate', 2.5],
    ['I think about what might happen before I act.', 'Moderate', 2.25],
    ['I choose answers without thinking carefully.', 'Easy', 1.5, true],
    ['I like games that make me think.', 'Easy', 1.75],
    ['I can explain how I solved an easy problem.', 'Moderate', 2.25],
    ['I keep trying until I find the correct answer.', 'Moderate', 2.25],
    ['I guess the answer without looking carefully.', 'Easy', 1.75, true],
    ['I can find what comes next in a sequence.', 'Moderate', 2.25],
    ['I enjoy finding different ways to solve a problem.', 'Hard', 2.5],
    ['I change my answer when I find a better one.', 'Moderate', 2.5],
    ['I stop thinking when a question feels difficult.', 'Moderate', 2, true],
    ['I like figuring out how things work.', 'Easy', 1.75],
  ]),
  g9_12: likertBank('RiAura Framework', AGREE_LABELS, [
    ['I think carefully before choosing an answer.', 'Easy', 1.5],
    ['I compare different ideas before making a decision.', 'Moderate', 2],
    ['I enjoy solving problems that make me think deeply.', 'Moderate', 2],
    ['I can explain the reason for my answers.', 'Easy', 2],
    ['I notice patterns that help me solve problems.', 'Moderate', 2],
    ['I think about what could happen before I act.', 'Moderate', 2.25],
    ['I try another method when my first idea fails.', 'Moderate', 2.25],
    ['I can identify the main cause of a problem.', 'Hard', 2.25],
    ['I answer questions without thinking carefully.', 'Easy', 1.5, true],
    ['I like activities that challenge my thinking.', 'Easy', 1.75],
    ['I can find mistakes in my own thinking.', 'Hard', 2],
    ['I check whether my answer makes sense.', 'Moderate', 1.75],
    ['I accept information without asking questions.', 'Moderate', 1.75, true],
    ['I connect different ideas to solve difficult problems.', 'Hard', 2],
    ['I quickly give up when problems become difficult.', 'Moderate', 2, true],
    ['I enjoy finding more than one solution to a problem.', 'Hard', 2.5],
    ['I change my answer when better evidence is available.', 'Hard', 2.25],
    ['I can tell the difference between facts and opinions.', 'Hard', 2],
  ]),
  g12_18: likertBank('RiAura Framework', AGREE_LABELS, [
    ['I think carefully before deciding between two different choices.', 'Easy', 2],
    ['I can explain why I chose one solution instead of another.', 'Moderate', 2.75],
    ['I compare different ideas before making an important decision.', 'Moderate', 2.25],
    ['I enjoy solving problems that require logical thinking.', 'Easy', 2],
    ['I notice mistakes in my thinking and try to correct them.', 'Hard', 2.75],
    ['I think about the possible results before taking action.', 'Moderate', 2.25],
    ['When my first solution fails, I look for another approach.', 'Moderate', 2.5],
    ['I can identify the main reason behind a problem.', 'Moderate', 2.25],
    ['I make decisions without thinking about the consequences.', 'Easy', 2.25, true],
    ['I enjoy finding patterns that others usually miss.', 'Hard', 2],
    ['I consider more than one possible answer before choosing.', 'Hard', 2.25],
    ['I accept information without checking whether it makes sense.', 'Moderate', 2.5, true],
    ['I can connect different pieces of information to solve a problem.', 'Hard', 3],
    ['I remain calm while solving difficult reasoning tasks.', 'Moderate', 2],
    ['I often rush into conclusions before understanding the situation.', 'Moderate', 2.5, true],
    ['I can recognize when evidence does not support a conclusion.', 'Hard', 2.75],
    ['I enjoy activities that challenge my thinking abilities.', 'Moderate', 2],
    ['I change my opinion when better evidence is presented.', 'Hard', 2.25],
  ]),
  g18_30: likertBank('RiAura Framework', AGREE_LABELS, [
    ['I evaluate different options before making important decisions.', 'Moderate', 2],
    ['I question information before accepting it as true.', 'Moderate', 2],
    ['I identify logical flaws in arguments during discussions.', 'Hard', 2],
    ['I consider both risks and benefits before taking action.', 'Moderate', 2.25],
    ['I analyze problems from more than one perspective.', 'Hard', 2],
    ['I enjoy solving problems that require careful reasoning.', 'Moderate', 2],
    ['I recognize when my assumptions influence my decisions.', 'Hard', 2],
    ['I change my conclusions when stronger evidence is presented.', 'Hard', 2.25],
    ['I make important decisions without considering available evidence.', 'Moderate', 2.25, true],
    ['I compare multiple solutions before selecting the best one.', 'Hard', 2.25],
    ['I identify patterns that help explain complex situations.', 'Hard', 2],
    ['I reflect on my mistakes to improve future decisions.', 'Moderate', 2.25],
    ['I accept opinions without evaluating supporting evidence.', 'Moderate', 1.75, true],
    ['I remain objective even when situations become emotionally challenging.', 'Hard', 2.25],
    ['I reach conclusions before understanding all available information.', 'Moderate', 2.25, true],
    ['I identify connections between unrelated ideas to solve problems.', 'Hard', 2.5],
    ['I enjoy evaluating evidence before forming an opinion.', 'Moderate', 2],
    ['I confidently solve unfamiliar problems using logical thinking.', 'Hard', 2],
  ]),
  g30_45: D4_ADULT_30_45,
  // The source sheet's 45–60 rows were truncated and 60+ never arrived;
  // the 30–45 bank stands in until those items are provided.
  g45_60: D4_ADULT_30_45,
  g60p:   D4_ADULT_30_45,
};

// ── Domain 5 · Decision Intelligence ────────────────────────────
// Ages 3–6 use PSRA decision/executive-function observations — all items are
// positive behaviours, so they score normally on a 4-point frequency scale.
// Ages 6–12 use the MDMQ-Y (sheet scoring 0–2 "Not at all / Somewhat / Very
// true"; rendered here as a 3-point truth scale). Only the six Vigilance
// items (2, 4, 6, 8, 12, 16) describe adaptive decision habits; the
// buck-passing / procrastination / hypervigilance items are lapses and are
// reverse-scored so a higher percent always means better decision-making.
// Ages 12–18 use the GDMS on the standard agree–disagree Likert. Rational (R)
// and Intuitive (I) style items score normally; Dependent (D), Avoidant (A)
// and Spontaneous (S) items are reverse-scored.

const MDMQ_LABELS = ['1\nNot at all\ntrue', '2\nSomewhat\ntrue', '3\nVery\ntrue'];

const D5_MDMQ_TEXTS = [
  'I feel as if I were under tremendous time pressure when I make decisions.',
  'I like to consider all the alternatives when making a decision.',
  'I prefer to leave decisions to others.',
  'I try to find the disadvantages of all the alternatives.',
  'I waste a lot of time on unimportant matters before making the final decision.',
  'I take into consideration what would be the best way to carry out a decision.',
  'Even after having made a decision, I delay putting it into practice.',
  'When I make decisions, I like to gather a good amount of information.',
  'I avoid making decisions.',
  'When I have to make a decision, I wait a long time before starting to think about it.',
  'I do not like to assume the responsibility of making decisions.',
  'I try to be clear in my objectives before choosing.',
  'The possibility that something goes wrong makes me abruptly change my preferences.',
  'If a decision can be made by me or by another person, I let the other person make it.',
  'Every time I face a difficult decision I feel pessimistic about finding a good solution.',
  'I take many precautions before choosing.',
  'I do not make decisions unless I really have to do it.',
  'I delay in making decisions until it is too late.',
  'I prefer that people who are better informed decide for me.',
  'After making a decision, I dedicate a lot of time to convincing myself that it was the right one.',
  'I postpone making decisions.',
  'I cannot think clearly if I have to make rushed decisions.',
];

// true = Vigilance (adaptive, scored normally); everything else reverses.
const D5_MDMQ_VIGILANCE = [false, true, false, true, false, true, false, true, false, false, false, true, false, false, false, true, false, false, false, false, false, false];
const D5_MDMQ_TIMES = [3.5, 2.75, 1.75, 2.5, 3.5, 3.75, 3, 3.25, 1, 4.5, 2.75, 2.5, 3, 4.75, 3.75, 1.5, 3, 2.5, 2.75, 4.75, 1, 2.75];

function mdmqBank(difficulties) {
  return {
    framework: 'MDMQ-Y',
    scale: 3,
    scoring: 'standard',
    scaleLabels: MDMQ_LABELS,
    questions: D5_MDMQ_TEXTS.map((text, i) => ({
      id: i + 1, text, difficulty: difficulties[i], reverse: !D5_MDMQ_VIGILANCE[i], minTime: D5_MDMQ_TIMES[i],
    })),
  };
}

// GDMS item 3's sheet text was cut off mid-sentence; completed from the
// published scale wording. The sheet itself was truncated after item 19
// (its minTime never arrived) and items 20–25 plus every adult group
// (18–30 through 60+) are missing. GDMS is originally an adult instrument,
// so the 12–18 bank stands in for adults until those rows are provided.
const D5_GDMS = likertBank('GDMS', AGREE_LABELS, [
  ['When I make decisions, I tend to rely on my intuition.', 'Moderate', 3],
  ['I rarely make important decisions without consulting other people.', 'Easy', 2.5, true],
  ['When I make a decision, it is more important for me to feel the decision is right than to have a rational reason for it.', 'Moderate', 4.5],
  ['I double-check my information sources to be sure I have the right facts before making decisions.', 'Moderate', 4.25],
  ['I use the advice of other people in making my important decisions.', 'Easy', 3.25, true],
  ['I put off making decisions because thinking about them makes me uneasy.', 'Moderate', 3.25, true],
  ['I make decisions in a logical and systematic way.', 'Hard', 2.5],
  ['When making decisions I do what I think first.', 'Hard', 2.5, true],
  ['I generally make snap decisions.', 'Easy', 1.5, true],
  ['I like to have someone steer me in the right direction when I am faced with important decisions.', 'Easy', 4.75, true],
  ['My decision-making requires careful thought.', 'Easy', 1.5],
  ['When making a decision, I trust my inner feelings and reactions.', 'Moderate', 3],
  ['When making a decision, I consider various options in terms of a specified goal.', 'Hard', 3.75],
  ['I avoid making important decisions until the pressure is on.', 'Easy', 2.75, true],
  ['I often make impulsive decisions.', 'Easy', 1.5, true],
  ['When making decisions, I rely upon my instincts.', 'Easy', 2.25],
  ['I generally make decisions that feel right to me.', 'Easy', 2.5],
  ['I often need the assistance of other people when making important decisions.', 'Easy', 3.25, true],
  ['I postpone decision-making whenever possible.', 'Easy', null, true],
]);

const DOMAIN5_QUESTIONS = {
  g3_6: likertBank('PSRA — Decision/Executive Function', ['1\nNever', '2\nRarely', '3\nSometimes', '4\nAlways'], [
    ['When given two snack options, does the child pick one without lengthy hesitation?', 'Easy', 3.5],
    ['Does the child decide which toy to play with at the start of free play?', 'Easy', 3.75],
    ['Can the child choose between two activities presented by the caregiver?', 'Easy', 2.75],
    ['Does the child redirect themselves after making an unsuccessful choice?', 'Easy', 2.5],
    ['When two peers compete for the same toy, does the child find an alternative?', 'Easy', 3.5],
    ["Does the child show awareness of consequences (e.g., 'if I do this, then...')?", 'Moderate', 3.25],
    ['Can the child stop and think before responding to a conflict situation?', 'Moderate', 3],
    ['Does the child ask for help when a task exceeds their ability?', 'Moderate', 3],
    ['Does the child delay gratification when told a better option comes later?', 'Moderate', 3],
    ['Does the child consider both options before making a selection (e.g., pause + look at both)?', 'Moderate', 4],
    ["Can the child follow a two-step decision rule (e.g., 'pick the big red one')?", 'Moderate', 3.5],
    ['Does the child express a preference and give a reason for it?', 'Moderate', 3],
    ['Does the child persist with a chosen activity, or switch impulsively?', 'Moderate', 2.75],
    ['Does the child check with a caregiver before making a risky decision?', 'Moderate', 3],
    ['Does the child revise their plan if the first option is unavailable?', 'Hard', 3],
    ['Can the child plan a sequence of two decisions (e.g., which game first, then which snack)?', 'Hard', 4],
    ['Does the child independently select and complete a multi-step preferred task?', 'Hard', 2.75],
    ['Does the child negotiate choices with peers instead of resorting to conflict?', 'Hard', 3],
    ['Does the child recognise when they need more information before choosing?', 'Hard', 2.75],
    ['Can the child reflect on a past choice and say if they would choose differently?', 'Hard', 3.75],
    ["Does the child make a rule-based decision (e.g., 'we take turns')?", 'Moderate', 2.75],
    ["Does the child distinguish between 'want' and 'need' when choosing?", 'Hard', 2.5],
    ['Does the child resist a preferred option when a rule says otherwise?', 'Hard', 3],
    ['Does the child consider the feelings of others when making a shared decision?', 'Hard', 3.25],
    ['Does the child self-correct a poor decision without adult prompting?', 'Hard', 2.5],
    ['Does the child plan ahead when packing their bag for an activity?', 'Moderate', 3],
    ['Does the child choose strategies to complete a puzzle or task?', 'Moderate', 2.75],
    ['Does the child show flexible decision-making when initial attempts fail?', 'Hard', 2.5],
  ]),
  g6_9: mdmqBank(['Moderate', 'Moderate', 'Easy', 'Hard', 'Moderate', 'Moderate', 'Moderate', 'Moderate', 'Easy', 'Easy', 'Moderate', 'Hard', 'Hard', 'Easy', 'Hard', 'Hard', 'Easy', 'Easy', 'Moderate', 'Hard', 'Moderate', 'Easy']),
  g9_12: mdmqBank(['Easy', 'Easy', 'Easy', 'Moderate', 'Easy', 'Moderate', 'Moderate', 'Easy', 'Easy', 'Easy', 'Moderate', 'Moderate', 'Moderate', 'Easy', 'Moderate', 'Moderate', 'Easy', 'Easy', 'Easy', 'Hard', 'Easy', 'Easy']),
  g12_18: D5_GDMS,
  g18_30: D5_GDMS,
  g30_45: D5_GDMS,
  g45_60: D5_GDMS,
  g60p:   D5_GDMS,
};

// ── Domain 7 · Social & Originality ─────────────────────────────
// Ages 3–18 use CASES (Creative Self-Efficacy Scale for Children and
// Adolescents) — the same nine items for every group, rated on a 5-point
// confidence scale; only the per-group difficulty ratings (and, for 9–12,
// the puzzle/build item order) differ. Adults use the 3-item Tierney &
// Farmer Creative Self-Efficacy scale on a 7-point agree–disagree Likert.
// Every item is a positive self-belief, so all banks score normally.

const CONFIDENCE_LABELS = ['1\nNot at all\nconfident', '2\nNot very\nconfident', '3\nConfident', '4\nQuite\nconfident', '5\nTotally\nconfident'];
const AGREE7_LABELS = ['1\nStrongly\nDisagree', '2\nDisagree', '3\nSlightly\nDisagree', '4\nNeutral', '5\nSlightly\nAgree', '6\nAgree', '7\nStrongly\nAgree'];

// [text, minTime] pairs shared by every CASES group.
const D7_CASES_ITEMS = {
  stories:  ['I make up new stories faster than my friends.', 2.25],
  firstSay: ['When we are playing, I am the first to say which game to play.', 3.5],
  games:    ['I love creating games.', 1],
  endings:  ['When I have to invent the end of a story, I think of many possible endings.', 4],
  heard:    ["When I want to tell a new story, I think of the ones I've heard.", 3.75],
  dreams:   ["I can tell a new story from dreams I've had.", 2.5],
  puzzle:   ["I can do a puzzle, even when it's hard.", 2.25],
  build:    ['I can learn how to build something (e.g., a toy, a LEGO) on my own.', 3.75],
  enjoy:    ['I still enjoy playing with something (e.g., a toy, a LEGO) even after spending an entire afternoon playing with it.', 5],
};

function casesBank(rows) {
  return likertBank('CASES', CONFIDENCE_LABELS, rows.map(([key, difficulty]) => {
    const [text, minTime] = D7_CASES_ITEMS[key];
    return [text, difficulty, minTime];
  }));
}

function tierneyFarmerBank(difficulties) {
  return likertBank('Creative Self-Efficacy (Tierney & Farmer)', AGREE7_LABELS, [
    ['I feel that I am good at generating novel ideas.', difficulties[0], 2.5],
    ['I have confidence in my ability to solve problems creatively.', difficulties[1], 2.5],
    ['I have a knack for further developing the ideas of others.', difficulties[2], 2.75],
  ]);
}

const D7_CASES_6_9 = casesBank([
  ['stories', 'Easy'], ['firstSay', 'Easy'], ['games', 'Easy'], ['endings', 'Easy'], ['heard', 'Easy'],
  ['dreams', 'Moderate'], ['puzzle', 'Easy'], ['build', 'Moderate'], ['enjoy', 'Easy'],
]);
const D7_ADULT_30_PLUS = tierneyFarmerBank(['Moderate', 'Moderate', 'Hard']);

const DOMAIN7_QUESTIONS = {
  g3_6: casesBank([
    ['stories', 'Easy'], ['firstSay', 'Easy'], ['games', 'Easy'], ['endings', 'Moderate'], ['heard', 'Moderate'],
    ['dreams', 'Moderate'], ['puzzle', 'Moderate'], ['build', 'Moderate'], ['enjoy', 'Easy'],
  ]),
  g6_9: D7_CASES_6_9,
  g9_12: casesBank([
    ['stories', 'Easy'], ['firstSay', 'Easy'], ['games', 'Easy'], ['endings', 'Easy'], ['heard', 'Easy'],
    ['dreams', 'Easy'], ['build', 'Moderate'], ['puzzle', 'Easy'], ['enjoy', 'Easy'],
  ]),
  g12_18: casesBank([
    ['stories', 'Easy'], ['firstSay', 'Easy'], ['games', 'Easy'], ['endings', 'Easy'], ['heard', 'Easy'],
    ['dreams', 'Easy'], ['puzzle', 'Easy'], ['build', 'Easy'], ['enjoy', 'Easy'],
  ]),
  g18_30: tierneyFarmerBank(['Easy', 'Easy', 'Easy']),
  g30_45: D7_ADULT_30_PLUS,
  g45_60: D7_ADULT_30_PLUS,
  g60p:   D7_ADULT_30_PLUS,
};

// ── Domain 8 · Metacognitive Intelligence ───────────────────────
// Ages 3–12 share one Jr. MAI bank (the sheet repeats identical rows for all
// three child groups) rated Never→Always; 12–18 uses the 19-item MAI and
// 18–30 the 18-item MAI-SF, both on the 5-point agree–disagree Likert.
// Every item is a positive metacognitive habit, so all banks score normally.
// The source sheet was truncated four rows into the 30–45 group (52-item
// MAI) and the 45–60 / 60+ rows never arrived; the 18–30 MAI-SF bank stands
// in for adults 30+ until those rows are provided.

const D8_JR_MAI = likertBank('Jr. MAI', FREQ_LABELS, [
  ['When I am done with my schoolwork, I ask myself if I learned what I wanted to learn.', 'Hard', 4.5],
  ['I think about what I need to learn before I start working.', 'Moderate', 3],
  ['I ask myself how well I am doing while I am learning something new.', 'Moderate', 3.5],
  ['I think of several ways to solve a problem and then choose the best one.', 'Hard', 3.75],
  ['I ask myself if there was an easier way to do things after I finish a task.', 'Hard', 4.25],
  ['I draw pictures or diagrams to help me understand while learning.', 'Easy', 2.75],
  ['I use different learning strategies depending on the task.', 'Hard', 2.25],
  ['I decide what I need to get done before I start a task.', 'Moderate', 3.25],
  ['I occasionally check to make sure I will get my work done on time.', 'Moderate', 3.5],
  ['I know when I understand something.', 'Easy', 1.5],
  ['I learn more when I am interested in the topic.', 'Easy', 2.5],
  ['I really pay attention to important information.', 'Easy', 1.75],
  ['I can make myself learn when I need to.', 'Moderate', 2.25],
  ['I learn best when I already know something about the topic.', 'Easy', 2.75],
  ['I know what the teacher expects me to learn.', 'Easy', 2.25],
  ['I try to use ways of studying that have worked for me before.', 'Moderate', 3.25],
  ['I use my learning strengths to make up for my weaknesses.', 'Hard', 2.75],
  ['I sometimes use learning strategies without thinking.', 'Easy', 1.75],
]);

const D8_MAI_SF = likertBank('MAI-SF', AGREE_LABELS, [
  ['I can motivate myself to learn when I need to.', 'Moderate', 2.5],
  ['I use my intellectual strengths to compensate for my weaknesses.', 'Hard', 2.5],
  ['I know when each strategy I use will be most effective.', 'Hard', 2.75],
  ['I am good at organizing information.', 'Easy', 1.5],
  ['I am good at remembering information.', 'Easy', 1.5],
  ['I am a good judge of how well I understand something.', 'Moderate', 2.75],
  ['I try to use strategies that have worked in the past.', 'Moderate', 2.75],
  ['I am aware of what strategies I use when I study.', 'Hard', 2.75],
  ['I find myself using helpful learning strategies automatically.', 'Hard', 2],
  ['I think about what I really need to learn before I begin a task.', 'Moderate', 3.5],
  ['I set specific goals before I begin a task.', 'Moderate', 2.25],
  ['I organize my time to best accomplish my goals.', 'Moderate', 2.25],
  ['I change strategies when I fail to understand.', 'Hard', 2],
  ["I ask myself if what I'm reading is related to what I already know.", 'Moderate', 3.5],
  ['I find myself analyzing the usefulness of strategies while I study.', 'Hard', 2.75],
  ["I summarize what I've learned after I finish.", 'Moderate', 2],
  ["I ask myself how well I accomplish my goals once I'm finished.", 'Hard', 3],
  ['I ask myself if I learned as much as I could have once I finish a task.', 'Hard', 4.25],
]);

const DOMAIN8_QUESTIONS = {
  g3_6:  D8_JR_MAI,
  g6_9:  D8_JR_MAI,
  g9_12: D8_JR_MAI,
  g12_18: likertBank('MAI', AGREE_LABELS, [
    ['I periodically ask myself whether I am reaching my goals.', 'Hard', 2.5],
    ['I know what the teacher expects me to learn.', 'Easy', 2.25],
    ['I am good at remembering information.', 'Easy', 1.5],
    ['I have control over how well I learn.', 'Moderate', 2],
    ['I learn best when I already know something about the topic.', 'Easy', 2.75],
    ['I organize my time to best accomplish my goals.', 'Moderate', 2.25],
    ['I ask myself if I have learned as much as I could once I finish a task.', 'Hard', 4.25],
    ['I understand my intellectual strengths and weaknesses.', 'Hard', 1.75],
    ['I ask for help when I do not understand something.', 'Easy', 2.5],
    ['I am a good judge of how well I understand something.', 'Moderate', 2.75],
    ['I catch myself using helpful learning strategies automatically.', 'Hard', 2],
    ['I have a specific purpose for each strategy I use.', 'Hard', 2.5],
    ['I know what kind of information is most important to learn.', 'Moderate', 2.75],
    ['I change strategies when I fail to understand.', 'Hard', 2],
    ['I know which strategy I use will be most effective.', 'Hard', 2.5],
    ['I try to use strategies that have worked in the past.', 'Moderate', 2.75],
    ['I use my intellectual strengths to compensate for my weaknesses.', 'Hard', 2.5],
    ['I can motivate myself to learn when necessary.', 'Hard', 2],
    ['I use different learning strategies depending on the situation.', 'Hard', 2.25],
  ]),
  g18_30: D8_MAI_SF,
  g30_45: D8_MAI_SF,
  g45_60: D8_MAI_SF,
  g60p:   D8_MAI_SF,
};

export const MINDFULNESS_DOMAIN_QUESTIONS = {
  1: Object.fromEntries(AGE_GROUPS.map(g => [g.key, buildDomain1Bank(g.key)])),
  2: DOMAIN2_QUESTIONS,
  3: DOMAIN3_QUESTIONS,
  4: DOMAIN4_QUESTIONS,
  5: DOMAIN5_QUESTIONS,
  7: DOMAIN7_QUESTIONS,
  8: DOMAIN8_QUESTIONS,
};

export function getMindfulnessQuestions(domainNum, groupKey) {
  return MINDFULNESS_DOMAIN_QUESTIONS[domainNum]?.[groupKey] || MINDFULNESS_QUESTIONS[groupKey];
}

export function scoreMindfulnessBank(bank, answers) {
  const { scale, questions, scoring = 'standard' } = bank;
  let total = 0;
  let max   = 0;
  questions.forEach((q, i) => {
    const raw = answers[i] || 0;
    if (scoring === 'deficit') {
      total += scale - raw;
      max   += scale - 1;
    } else {
      total += q.reverse ? (scale + 1) - raw : raw;
      max   += scale;
    }
  });
  const percent = Math.round((total / max) * 100);
  let band = null;
  if (scoring === 'intensity') {
    const avg = total / questions.length;
    band = avg <= 2 ? 'Low expression' : avg <= 5 ? 'Mid expression' : 'High expression';
  }
  return { total, max, percent, band };
}
