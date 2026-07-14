// Light UI palette (new design)
export const ui = {
  beige:         '#C9B8A4',
  offWhite:      '#F8F5F0',
  white:         '#FFFFFF',
  // Primary accent is now purple (names kept for compatibility)
  primaryBlue:   '#7C3AED',
  blueGradStart: '#4B3A9B',
  blueGradEnd:   '#33265F',
  darkText:      '#1A1A2E',
  midText:       '#6B7280',
  lightText:     '#9CA3AF',
  inputBg:       '#F3F4F6',
  borderGray:    '#E5E7EB',
  purple:        '#7C3AED',
  amber:         '#F59E0B',
  amberBg:       '#FFFDE7',
  green:         '#059669',
  challengeBg:   '#EBF1FF',
  streakBg:      '#FFF3E0',
  streakBorder:  '#FFB74D',
};

export const colors = {
  // Core brand
  navyDark:    '#0A0E2A',
  navyMid:     '#12184A',
  navyLight:   '#1C2460',
  navyCard:    '#161B45',

  // Gold / accent
  gold:        '#F5C518',
  goldLight:   '#FFD94A',
  goldDark:    '#C9A000',

  // Text
  white:       '#FFFFFF',
  textSub:     '#A8B0D8',
  textMuted:   '#6B74A8',

  // Semantic
  success:     '#4CAF50',
  warning:     '#FF9800',
  danger:      '#F44336',
  info:        '#2196F3',

  // Phase colours
  phase1:      '#6C63FF',
  phase2:      '#00C9A7',
  phase3:      '#FF6B6B',
  phase4:      '#FFB347',

  // Lab colours
  labLight:    '#FFD700',
  labCompass:  '#4FC3F7',
  labStill:    '#81C784',
  labEchoes:   '#BA68C8',
  labFire:     '#FF7043',
  labPatterns: '#42A5F5',
  labMirrors:  '#26C6DA',
  labOriginal: '#AB47BC',

  // Gradient pairs
  gradientMain:   ['#0A0E2A', '#12184A'],
  gradientGold:   ['#F5C518', '#C9A000'],
  gradientGreen:  ['#00C9A7', '#009688'],
  gradientPurple: ['#6C63FF', '#4A3FE0'],
};

// ── Neural premium palette (VisionOS / Neuralink design language) ────────────
// Deep-purple hero surfaces over a soft #F7F8FF page, glass cards, and
// electric cyan/pink accents for "live" neural elements.
export const neural = {
  primary:     '#6C4DFF',
  deepPurple:  '#3B1F88',
  electric:    '#4CC9F0',
  cyan:        '#2EF3FF',
  pink:        '#D946EF',
  success:     '#22C55E',
  energy:      '#F59E0B',

  bg:          '#F7F8FF',
  card:        'rgba(255,255,255,0.72)',
  cardBorder:  'rgba(255,255,255,0.45)',

  // Dark hero panel (Home header, scan overlays)
  heroGrad:    ['#241255', '#3B1F88', '#170B3B'],
  heroText:    '#F1EDFF',
  heroSub:     '#B4A5EE',
  heroGlass:   'rgba(255,255,255,0.08)',
  heroBorder:  'rgba(255,255,255,0.14)',
};

// ── Light design language (app-wide clean theme) ─────────────────────────────
// NOTE: the export keeps its historical name `dark` so the 40+ screens that
// import it don't need touching — the VALUES are now the light palette.
export const dark = {
  // Page backgrounds
  bg:        ['#F4F2FE', '#FBFAFF', '#F1EEFD'],   // default page gradient
  bgViolet:  ['#F0EBFD', '#FAF7FF', '#EFEAFC'],   // accent / hero pages
  bgSolid:   '#F7F8FF',

  // Card surfaces — translucent glass over the ambient gradient
  glass:        'rgba(255,255,255,0.78)',
  glassStrong:  'rgba(243,240,250,0.85)',
  glassBorder:  '#ECE8F5',
  glassBorderStrong: '#DDD6EE',

  // Accents (purple-led, matching the Home design)
  neon:    '#7C3AED',
  neon2:   '#6D28D9',
  violet:  '#8B5CF6',
  violet2: '#7C3AED',
  gold:    '#F59E0B',
  green:   '#10B981',
  pink:    '#EC4899',

  // Text
  text:     '#1E1B33',
  textSub:  '#6E6A80',
  textMute: '#A8A5B5',
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
};
