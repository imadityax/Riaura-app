import { Dimensions, PixelRatio } from 'react-native';

// Responsive scaling helpers so the UI holds its proportions from a small
// iPhone SE (320pt) up to large phones and small tablets. Layouts are already
// flexbox-based (they adapt to width automatically); these helpers scale the
// things flexbox can't: font sizes and fixed pixel dimensions.

const { width, height } = Dimensions.get('window');

export const SCREEN_W = width;
export const SCREEN_H = height;

// Design baseline: iPhone 13/14 (390 × 844)
const BASE_W = 390;
const BASE_H = 844;

const shortSide = Math.min(width, height);

export const isSmallDevice = shortSide < 350;   // iPhone SE, compact Androids
export const isTablet      = shortSide >= 600;

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// Scale a dimension by screen width, gently clamped so tablets don't blow up
// and tiny phones don't collapse.
export function scale(size) {
  const factor = clamp(width / BASE_W, 0.85, 1.3);
  return Math.round(size * factor);
}

// Scale by height — for vertical spacing that should track screen height.
export function vScale(size) {
  const factor = clamp(height / BASE_H, 0.85, 1.3);
  return Math.round(size * factor);
}

// Moderate scale: scales, but dampened by `f` (0 = none, 1 = full width scale).
// A good default for most spacing/sizing that shouldn't move too aggressively.
export function ms(size, f = 0.5) {
  return Math.round(size + (scale(size) - size) * f);
}

// Responsive font size: moderate-scaled and pixel-snapped.
export function rf(size) {
  return Math.round(PixelRatio.roundToNearestPixel(ms(size, 0.5)));
}
