import { colors } from '../theme/colors';

export const LABS = [
  {
    id: 'light',
    name: 'Lab of Light',
    icon: 'lightbulb-outline',
    color: colors.labLight,
    focus: 'Attention, Awareness, Observation',
    domains: [0], // Attention
    description: 'Sharpen your perception and cultivate razor-sharp awareness through structured attention training.',
  },
  {
    id: 'compass',
    name: 'Lab of Compass',
    icon: 'compass-outline',
    color: colors.labCompass,
    focus: 'Purpose, Values, Direction',
    domains: [3, 4], // Reasoning + Decision
    description: 'Discover your core values and build a purposeful direction for your intellectual journey.',
  },
  {
    id: 'stillness',
    name: 'Lab of Stillness',
    icon: 'leaf',
    color: colors.labStill,
    focus: 'Mindfulness, Emotional Balance',
    domains: [5], // Emotional
    description: 'Develop emotional equilibrium and mindful presence as foundations for peak performance.',
  },
  {
    id: 'echoes',
    name: 'Lab of Echoes',
    icon: 'volume-high',
    color: colors.labEchoes,
    focus: 'Communication and Relationships',
    domains: [6], // Social
    description: 'Master the art of meaningful communication and build deeply resonant relationships.',
  },
  {
    id: 'fire',
    name: 'Lab of Fire & Flow',
    icon: 'fire',
    color: colors.labFire,
    focus: 'Motivation and Execution',
    domains: [4, 2], // Decision + Processing
    description: 'Ignite intrinsic motivation and channel it into consistent, high-quality execution.',
  },
  {
    id: 'patterns',
    name: 'Lab of Patterns',
    icon: 'shape-outline',
    color: colors.labPatterns,
    focus: 'Logic and Problem Solving',
    domains: [3, 2], // Reasoning + Processing
    description: 'Decode complex systems and develop elite-level logical problem-solving frameworks.',
  },
  {
    id: 'mirrors',
    name: 'Lab of Mirrors',
    icon: 'mirror',
    color: colors.labMirrors,
    focus: 'Self-Awareness and Reflection',
    domains: [7], // Metacognitive
    description: 'Develop profound self-knowledge through structured reflection and metacognitive training.',
  },
  {
    id: 'originals',
    name: 'Lab of Originals',
    icon: 'creation',
    color: colors.labOriginal,
    focus: 'Creativity and Innovation',
    domains: [6, 1], // Social + Memory
    description: 'Unleash your creative potential and develop the mindset of an original thinker.',
  },
];
