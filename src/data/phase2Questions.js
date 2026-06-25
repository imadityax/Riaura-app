// WHO Psychometric Assessment – 8 domains × 5 questions (Likert 1–5)
export const DOMAINS = [
  'Attention Intelligence',
  'Memory Intelligence',
  'Processing Intelligence',
  'Reasoning Intelligence',
  'Decision Intelligence',
  'Emotional & Sensory Intelligence',
  'Social & Originality Intelligence',
  'Metacognitive Intelligence',
];

export const DOMAIN_SHORT = [
  'Attention', 'Memory', 'Processing', 'Reasoning',
  'Decision', 'Emotional', 'Social', 'Metacognitive',
];

export const phase2Questions = [
  // Domain 0 – Attention Intelligence
  [
    'I can focus on a task for extended periods without getting distracted.',
    'I notice small details in my environment that others often miss.',
    'I can switch between tasks quickly while maintaining accuracy.',
    'When someone is speaking, I remain fully present and attentive.',
    'I can filter out background noise or distractions when concentrating.',
  ],
  // Domain 1 – Memory Intelligence
  [
    'I can recall information I learned weeks or months ago with ease.',
    'I remember faces, names, and personal details of people I meet.',
    'I can mentally retrace steps to find something I have forgotten.',
    'I retain information better when I organise it into patterns or stories.',
    'I can hold multiple pieces of information in mind while solving a problem.',
  ],
  // Domain 2 – Processing Intelligence
  [
    'I understand and respond to new information quickly.',
    'I can read or scan text rapidly while retaining meaning.',
    'I process visual information (charts, maps, diagrams) faster than most.',
    'Under time pressure, my performance remains accurate and consistent.',
    'I can process multiple streams of information simultaneously.',
  ],
  // Domain 3 – Reasoning Intelligence
  [
    'I enjoy solving puzzles, riddles, and logical challenges.',
    'I can identify patterns in data or sequences with ease.',
    'I approach complex problems by breaking them into smaller steps.',
    'I can form coherent arguments and identify flaws in others\' reasoning.',
    'I make connections between seemingly unrelated ideas or concepts.',
  ],
  // Domain 4 – Decision Intelligence
  [
    'I evaluate multiple options systematically before making a decision.',
    'I can make sound decisions under pressure and time constraints.',
    'I am comfortable with uncertainty and can act without full information.',
    'I review the outcomes of my decisions and learn from them.',
    'I weigh both short-term and long-term consequences when choosing.',
  ],
  // Domain 5 – Emotional & Sensory Intelligence
  [
    'I can accurately identify and label my own emotional states.',
    'I notice shifts in other people\'s moods before they express them verbally.',
    'I manage stress and negative emotions without losing focus.',
    'My senses (sight, sound, touch) pick up on subtle environmental cues.',
    'I adjust my emotional responses based on social context.',
  ],
  // Domain 6 – Social & Originality Intelligence
  [
    'I adapt my communication style to suit different people and situations.',
    'I generate novel ideas or unconventional solutions to everyday problems.',
    'I enjoy brainstorming and exploring ideas without immediate judgment.',
    'I build rapport with new people quickly and naturally.',
    'I express myself creatively through writing, art, speech, or other means.',
  ],
  // Domain 7 – Metacognitive Intelligence
  [
    'I am aware of my thinking process as I work through problems.',
    'I know which learning strategies work best for me personally.',
    'I monitor my own understanding and ask for clarification when confused.',
    'I regularly reflect on my strengths, weaknesses, and progress.',
    'I can predict how well I will perform on tasks before attempting them.',
  ],
];

export const LIKERT_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
