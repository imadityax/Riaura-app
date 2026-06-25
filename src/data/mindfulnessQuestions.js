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
