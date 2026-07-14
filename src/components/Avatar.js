import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ui } from '../theme/colors';

// Shows the user's profile photo when set, otherwise their initial in a
// colored circle. `photo` is a data URI (or file URI) or null.
export default function Avatar({ photo, initial = 'U', size = 40, bg = '#7C3AED', textColor = '#fff', style }) {
  const dim = { width: size, height: size, borderRadius: size / 2 };
  if (photo) {
    return <Image source={{ uri: photo }} style={[dim, style]} resizeMode="cover" />;
  }
  return (
    <View style={[dim, styles.fallback, { backgroundColor: bg }, style]}>
      <Text style={{ fontSize: size * 0.42, fontWeight: '900', color: textColor }}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', justifyContent: 'center' },
});
