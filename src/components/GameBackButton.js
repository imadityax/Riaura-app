import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ui } from '../theme/colors';

// Floating "Back" pill used on game result / summary screens that don't have a
// PhaseHeader. Absolutely positioned top-left so it never disturbs the existing
// centered result layouts. Pass `dark` on dark-themed game screens.
export default function GameBackButton({ onPress, dark = false, label = 'Back', style }) {
  const insets = useSafeAreaInsets();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      style={[
        styles.btn,
        dark ? styles.dark : styles.light,
        { top: insets.top + 8 },
        style,
      ]}
    >
      <Ionicons name="chevron-back" size={20} color={dark ? '#fff' : '#7C3AED'} />
      <Text style={[styles.text, { color: dark ? '#fff' : '#7C3AED' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute', left: 12, zIndex: 50,
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1,
  },
  light: { backgroundColor: ui.white, borderColor: ui.borderGray },
  dark: { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' },
  text: { fontSize: 15, fontWeight: '700', marginLeft: 1 },
});
