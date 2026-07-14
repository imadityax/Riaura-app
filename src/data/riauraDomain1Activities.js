// RiAura · Domain 1 — Attention Intelligence (Attention & Focus)
// Immersive, adaptive, metric-based activity bank authored per exact age group.
// Each activity integrates Phase 2 (mindfulness) + Phase 3 (cognitive) parameters,
// with adaptive routing (Easy / Moderate / Hard) driven by the user's live score
// band and per-activity performance metrics. Sourced from the Domain 1 spec.

const RIAURA_DOMAIN1_ACTIVITIES = {
  // ── 3 to 6 ──────────────────────────────────────────────
  g3_6: [
    {
      title: 'The Silent Star',
      engine: 'vigilance',
      focus: 'Stillness',
      framework: 'C-OMM Scale',
      mode: 'Online',
      materials: 'Tablet/PC, Headphones',
      minutes: 3,
      phase2: ['Present-moment awareness', 'Environmental awareness'],
      phase3: ['Vigilance', 'Sustained attention (general)'],
      desc: 'The Night Sky Journey: The child listens to a calming nighttime soundscape. They must sustain their visual focus on a dark screen and tap the star only when it pulses in sync with a soft musical chime, actively maintaining present-moment awareness and ignoring the nature sounds.',
      routing: {
        easy: '2 mins. Predictable pulses (10–15s).',
        moderate: '3 mins. Unpredictable pulses (5–45s).',
        hard: '4 mins. Barely visible, extremely rare pulses.',
      },
      metrics: [
        { label: 'Omission Errors', desc: 'Count of missed pulses (indicates fatigue).' },
        { label: 'Vigilance Decrement', desc: 'Identifies the exact minute self-regulated focus drops.' },
      ],
      scienceUrl: null,
    },
    {
      title: 'The Firefly Freeze',
      engine: 'gonogo',
      focus: 'Light',
      framework: 'C-OMM Scale',
      mode: 'Online',
      materials: 'Tablet, Headphones',
      minutes: 3,
      phase2: ['Interoceptive awareness', 'Cognitive flexibility'],
      phase3: ['Response inhibition', 'Cognitive control'],
      desc: 'The Garden Catch: The child enters a vibrant garden with 3D spatial audio. They rapidly tap to catch yellow fireflies. When the owl hoots and the red firefly appears, they must recognize their physical urge to tap and instantly abort their movement.',
      routing: {
        easy: 'Slow fireflies. Owl hoot is loud and clear.',
        moderate: 'Fast fireflies. Owl hoot blends into the background bugs.',
        hard: 'High-speed. Rule reverses halfway.',
      },
      metrics: [
        { label: 'Commission Errors', desc: 'False alarm rate (percentage of times they accidentally tapped red).' },
        { label: 'Inhibitory Latency', desc: 'Milliseconds required to cancel the physical action.' },
      ],
      scienceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8638877/',
    },
  ],

  // ── 6 to 9 ──────────────────────────────────────────────
  g6_9: [
    {
      title: 'The Echo Cave',
      engine: 'dual',
      focus: 'Light & Stillness',
      framework: 'C-OMM Scale',
      mode: 'Online',
      materials: 'Tablet/PC, Headphones',
      minutes: 4,
      phase2: ['Attention shifting', 'Perspective awareness'],
      phase3: ['Divided attention', 'Auditory attention'],
      desc: 'The Deep Exploration: The child uses their finger to visually guide a glowing lantern through dark cave paths. Simultaneously, they must actively listen to echoing sounds. They must shift attention between visual navigation and auditory monitoring, tapping only for the bat squeak.',
      routing: {
        easy: 'Slow navigation. No background noise.',
        moderate: 'Erratic navigation. Heavy wind/water sounds added.',
        hard: 'Tap right side for squeak; tap left side if lantern flickers blue.',
      },
      metrics: [
        { label: 'Cross-Modal Accuracy', desc: 'Percentage of correct taps immediately following the auditory target.' },
        { label: 'Dual-Task Cost', desc: 'Reaction time delay caused by visual distractions.' },
      ],
      scienceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12647209/',
    },
    {
      title: 'Spotlight Sweep',
      engine: 'search',
      focus: 'Light',
      framework: 'S-CAMM',
      mode: 'Online',
      materials: 'Tablet/PC, Headphones',
      minutes: 4,
      phase2: ['Spatial awareness', 'Sustained attention'],
      phase3: ['Selective attention', 'Visual search'],
      desc: 'The Crystal Cavern: The child hears the rumbling of an underground cavern. A guide gives them a specific auditory command. The child sweeps a digital spotlight across a dark map, applying spatial awareness to locate the correct humming blue crystal while filtering out silent red decoys.',
      routing: {
        easy: 'Empty map. Find the single blue crystal.',
        moderate: 'Map includes blue targets and red decoys.',
        hard: 'Cluttered map. Find a blue triangle among blue squares and red triangles.',
      },
      metrics: [
        { label: 'Identification Latency', desc: 'Average time (speed) to find a target.' },
        { label: 'Decoy Susceptibility', desc: 'Count of incorrect distractors tapped.' },
      ],
      scienceUrl: null,
    },
  ],

  // ── 9 to 12 ─────────────────────────────────────────────
  g9_12: [
    {
      title: 'Prism Switch',
      engine: 'switch',
      focus: 'Light',
      framework: 'S-CAMM',
      mode: 'Online',
      materials: 'Tablet/PC, Headphones',
      minutes: 4,
      phase2: ['Autopilot disengagement', 'Self-monitoring'],
      phase3: ['Alternating attention', 'Cognitive flexibility'],
      desc: 'The Machine Room: The child is sorting power beams by color. The "Prism Master" announces, "Shift to shapes!" over the intercom. The child must disengage from their mental autopilot, process the auditory command, and instantly alter their visual sorting strategy.',
      routing: {
        easy: 'Game pauses. Intercom explicitly says "Now sort by shape!"',
        moderate: 'No pause. A specific siren signals an instant shift.',
        hard: 'High-speed. 1 siren = shape; 2 sirens = size.',
      },
      metrics: [
        { label: 'Switch-Cost Latency', desc: 'Exact milliseconds lost adapting to the new rule.' },
        { label: 'Perseveration Error Rate', desc: 'Failure to drop the old habit.' },
      ],
      scienceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6372522/',
    },
    {
      title: 'Quiet the Storm',
      engine: 'hold',
      focus: 'Stillness',
      framework: 'S-CAMM',
      mode: 'Online',
      materials: 'Tablet, Headphones',
      minutes: 4,
      phase2: ['Emotional suppression', 'Avoidance coping'],
      phase3: ['Processing under distraction', 'Interference control'],
      desc: 'The Survival Scenario: The child holds their finger steady on a digital flame. Immersive 3D audio plays howling wolves and cracking thunder. They must manage their emotional fear (avoidance coping) and suppress the urge to flinch during thunderclaps to protect the flame.',
      routing: {
        easy: 'Mild, ambient background noise plays.',
        moderate: 'Sudden loud thunder provokes a startle reflex.',
        hard: 'Sensory chaos. Candle moves slightly, requiring active tracking.',
      },
      metrics: [
        { label: 'Time-on-Target Percentage', desc: 'Total time the finger remained perfectly still.' },
        { label: 'Interference Breakage', desc: 'Count of exact moments the finger slipped due to startle.' },
      ],
      scienceUrl: null,
    },
  ],

  // ── 12 to 18 ────────────────────────────────────────────
  g12_18: [
    {
      title: 'The 5-Minute Eclipse',
      engine: 'vigilance',
      focus: 'Stillness',
      framework: 'MAAS-A',
      mode: 'Online',
      materials: 'PC/Keyboard, Headphones',
      minutes: 5,
      phase2: ['Present-moment awareness', 'Autopilot disengagement'],
      phase3: ['Continuous performance', 'Vigilance'],
      desc: 'The Deep Space Observatory: The teenager listens to a low-frequency space drone. They must sustain intense visual focus on the moon and press a button only when the eclipse shadow aligns perfectly with a specific audio tone. They must fight off mental autopilot and extreme boredom.',
      routing: {
        easy: '3-min duration. Target shadow crosses frequently.',
        moderate: '5-min duration. Target shadow appears only 4 times.',
        hard: '7-min duration. Target shadow is incredibly faint.',
      },
      metrics: [
        { label: 'Vigilance Decrement', desc: 'Identifies the exact minute reaction times slow down.' },
        { label: 'Inattentional Blindness', desc: 'Total count of missed targets.' },
      ],
      scienceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11573249/',
    },
  ],

  // ── 18 to 30 ────────────────────────────────────────────
  g18_30: [
    {
      title: 'Laser Grid',
      engine: 'gonogo',
      focus: 'Light',
      framework: 'MAAS-A',
      mode: 'Online',
      materials: 'Tablet/PC, Headphones',
      minutes: 5,
      phase2: ['Impulse control', 'Metacognitive awareness'],
      phase3: ['Executive Motor Braking', 'Cognitive control'],
      desc: 'The Vault Hack: The young adult taps green lasers to the beat of a rhythmic alarm, building a strong physical rhythm. If they hear the "lockdown siren" (blue laser), they must utilize metacognitive awareness of their own speed to violently break their rhythm and abort the tap.',
      routing: {
        easy: 'Lasers flash for 1000ms.',
        moderate: 'Lasers flash for 400ms. High speed demands aggressive motor rhythm.',
        hard: 'Lasers flash for 300ms. A warning buzzer temporarily reverses colors.',
      },
      metrics: [
        { label: 'Impulsivity Index', desc: 'Ratio of correct hits vs. failure to brake on blue lasers.' },
        { label: 'Inhibitory Threshold', desc: 'The speed at which motor control collapses.' },
      ],
      scienceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5658138/',
    },
  ],

  // ── 30 to 45 ────────────────────────────────────────────
  g30_45: [
    {
      title: 'Control Tower',
      engine: 'dual',
      focus: 'Light & Stillness',
      framework: 'FFMQ',
      mode: 'Online',
      materials: 'PC/Keyboard, Headphones',
      minutes: 6,
      phase2: ['Task-focused awareness', 'Emotional monitoring'],
      phase3: ['Central Executive Overload', 'Multi-task attention'],
      desc: 'The Air-Traffic Simulation: The professional hears pilots speaking through radio static. They must drag visual blips to specific runways while typing altitude numbers spoken by the pilots. They must maintain strict task-focused awareness and monitor their own stress levels to prevent a cascade failure.',
      routing: {
        easy: 'Radar pauses for the user to type audio numbers.',
        moderate: 'Radar does not pause. Click dots while typing numbers simultaneously.',
        hard: 'Fast pace. Red dots must be ignored; even numbers must not be typed.',
      },
      metrics: [
        { label: 'Parallel Processing Collapse', desc: 'Identifies the exact moment multitasking reverts to serial processing.' },
        { label: 'Bandwidth Ceiling', desc: 'Point of task failure.' },
      ],
      scienceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12796017/',
    },
  ],

  // ── 45 to 60 ────────────────────────────────────────────
  g45_60: [
    {
      title: 'Lighthouse Keeper',
      engine: 'dual',
      focus: 'Light & Stillness',
      framework: 'MAAS-A',
      mode: 'Online',
      materials: 'PC/Tablet, Headphones',
      minutes: 6,
      phase2: ['Goal-directed attention', 'Auditory attention'],
      phase3: ['Executive Bandwidth', 'Divided attention'],
      desc: 'The Storm Rescue: The user steers a physical light beam using their mouse to keep a rocking ship illuminated. Simultaneously, they must listen to distant foghorns, ignoring thunder crashes, and actively encode the long blasts into working memory to type the distress code at the end.',
      routing: {
        easy: 'Visually track ship. Click button when foghorn blows.',
        moderate: 'Visually track ship while keeping a silent mental tally of foghorns.',
        hard: 'Track ship, tally foghorns, and tap spacebar for seagulls.',
      },
      metrics: [
        { label: 'Dual-Task Bottleneck', desc: 'Compares visual tracking accuracy vs. audio counting accuracy.' },
        { label: 'Executive Overflow', desc: 'Identifies the point where multitasking fails completely.' },
      ],
      scienceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6586477/',
    },
  ],

  // ── 60+ ─────────────────────────────────────────────────
  g60p: [
    {
      title: 'Stroop of Light',
      engine: 'stroop',
      focus: 'Light',
      framework: 'FFMQ',
      mode: 'Online',
      materials: 'Tablet/PC, Headphones',
      minutes: 5,
      phase2: ['Autopilot disengagement', 'Non-reactivity'],
      phase3: ['Conflict Resolution', 'Response inhibition'],
      desc: 'The Cyberpunk Interface: An AI voice rapidly dictates commands in the user’s ear while the screen flashes incongruent text ("DARK" written in bright neon). The senior must disengage reading autopilot, practice non-reactivity to the text, and resolve the multi-modal cognitive conflict.',
      routing: {
        easy: 'Congruent only (words match font brightness).',
        moderate: 'Incongruent. Tap font style, ignore written word.',
        hard: 'Inverted. White border = tap font style; Black border = tap written word.',
      },
      metrics: [
        { label: 'Stroop Interference Score', desc: 'Latency difference between congruent and incongruent trials.' },
        { label: 'Conflict Resolution Speed', desc: 'Total milliseconds lost resolving the rules.' },
      ],
      scienceUrl: null,
    },
    {
      title: 'The Silent Watch',
      engine: 'vigilance',
      focus: 'Stillness',
      framework: 'FFMQ',
      mode: 'Online',
      materials: 'PC/Keyboard, Headphones',
      minutes: 5,
      phase2: ['Mind wandering awareness', 'Present-moment attention'],
      phase3: ['Tonic Alertness', 'General sustained attention'],
      desc: 'The Hypnotic Metronome: A metronome ticks softly. The senior watches a slow-moving digital pendulum. When the visual pendulum micro-skips and the audio metronome misses a beat simultaneously, the user must click. They must strictly self-monitor and catch their own mind-wandering.',
      routing: {
        easy: '3-min duration. Pendulum skip is large and noticeable.',
        moderate: '5-min duration. Pendulum skip is a 1-millimeter micro-stutter.',
        hard: '10-min duration. Double-click for left-skip, single-click for right-skip.',
      },
      metrics: [
        { label: 'Intra-Individual Variability (IIV)', desc: 'Fluctuation in reaction times detecting micro-sleeps.' },
        { label: 'Lapse Rate', desc: 'Total missed skips.' },
      ],
      scienceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10128103/',
    },
  ],
};

export default RIAURA_DOMAIN1_ACTIVITIES;
