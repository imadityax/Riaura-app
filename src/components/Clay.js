import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PressableScale } from './anim';

// Claymorphism chrome shared by every tap-to-choose option across the app.
// RN has no inset/multi shadows, so the puffy "molded clay" look is faked
// with a solid pastel fill + mismatched light/dark border edges (top-left
// lighter, bottom-right darker, like light hitting a raised surface) plus a
// soft ambient drop shadow.
const TONES = {
  default: {
    backgroundColor: '#F1EDFB',
    borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: '#D8CFF0',
    borderBottomColor: '#D8CFF0',
    shadowColor: '#8B7BB8',
  },
  selected: {
    backgroundColor: '#7C3AED',
    borderTopColor: 'rgba(255,255,255,0.45)',
    borderLeftColor: 'rgba(255,255,255,0.45)',
    borderRightColor: '#4C1D95',
    borderBottomColor: '#4C1D95',
    shadowColor: '#4C1D95',
  },
  correct: {
    backgroundColor: '#DCFCE7',
    borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: '#86D9A8',
    borderBottomColor: '#86D9A8',
    shadowColor: '#4E9B6E',
  },
  incorrect: {
    backgroundColor: '#FEE2E2',
    borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: '#F1A6A6',
    borderBottomColor: '#F1A6A6',
    shadowColor: '#C0504D',
  },
  warning: {
    backgroundColor: '#FEF3C7',
    borderTopColor: 'rgba(255,255,255,0.9)',
    borderLeftColor: 'rgba(255,255,255,0.9)',
    borderRightColor: '#F3D48A',
    borderBottomColor: '#F3D48A',
    shadowColor: '#B08B2E',
  },
};

function toneStyle(tone) {
  return TONES[tone] || TONES.default;
}

// Puffy, pressable option card — swap in for a flat TouchableOpacity/card.
export function ClayCard({ children, tone = 'default', radius = 20, style, scaleTo = 0.97, onPress, disabled, ...rest }) {
  return (
    <PressableScale
      style={[styles.card, { borderRadius: radius }, toneStyle(tone), style]}
      scaleTo={scaleTo}
      onPress={onPress}
      disabled={disabled}
      {...rest}
    >
      {children}
    </PressableScale>
  );
}

// Small circular clay "button" — numbered pills, lettered badges, avatars.
export function ClayBubble({ children, tone = 'default', size = 32, style }) {
  return (
    <View style={[styles.bubble, { width: size, height: size, borderRadius: size / 2 }, toneStyle(tone), style]}>
      {children}
    </View>
  );
}

// Static (non-pressable) clay panel — question cards, chip pills, hero backing.
export function ClaySurface({ children, tone = 'default', radius = 20, style }) {
  return (
    <View style={[styles.card, { borderRadius: radius }, toneStyle(tone), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  bubble: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
});
