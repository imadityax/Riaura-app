import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BRAIN_FACTS } from '../data/brainFacts';
import Icon from './Icon';

// Day-seeded start index so everyone gets a "fact of the day",
// then tapping cycles through the rest.
function todayIndex() {
  const now = new Date();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  return dayOfYear % BRAIN_FACTS.length;
}

export default function BrainFactCard({ style }) {
  const [idx, setIdx] = useState(todayIndex);
  const anim  = useRef(new Animated.Value(1)).current;
  const press = useRef(new Animated.Value(1)).current;

  const fact = BRAIN_FACTS[idx];

  function nextFact() {
    Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setIdx(i => (i + 1) % BRAIN_FACTS.length);
      Animated.timing(anim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    });
  }

  // Auto-rotate gently every 10s so the card feels alive even untouched
  useEffect(() => {
    const id = setInterval(nextFact, 10000);
    return () => clearInterval(id);
  }, []);

  function shareFact() {
    Share.share({ message: `🧠 Brain fact from RiAura RHIMS:\n\n${fact.fact}` }).catch(() => {});
  }

  return (
    <Pressable
      onPress={nextFact}
      onPressIn={() => Animated.spring(press, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 0 }).start()}
      onPressOut={() => Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start()}
    >
      <Animated.View style={[{ transform: [{ scale: press }] }, style]}>
        <LinearGradient
          colors={['#7C3AED', '#4C1D95']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* decorative depth blobs */}
          <View style={[styles.blob, styles.blobA]} />
          <View style={[styles.blob, styles.blobB]} />

          <View style={styles.headRow}>
            <View style={styles.eyebrowWrap}>
              <MaterialCommunityIcons name="head-lightbulb-outline" size={13} color="#DDD6FE" />
              <Text style={styles.eyebrow}>BRAIN FACT</Text>
            </View>
            <Text style={styles.counter}>{idx + 1}/{BRAIN_FACTS.length}</Text>
          </View>

          <Animated.View
            style={[styles.body, {
              opacity: anim,
              transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
            }]}
          >
            <View style={styles.iconCircle}>
              <Icon name={fact.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.factText}>{fact.fact}</Text>
          </Animated.View>

          <View style={styles.footRow}>
            <Text style={styles.tapHint}>Tap for another fact</Text>
            <Pressable onPress={shareFact} hitSlop={10} style={styles.shareBtn}>
              <Ionicons name="share-outline" size={16} color="#DDD6FE" />
            </Pressable>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  blob: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 999 },
  blobA: { width: 150, height: 150, top: -60, right: -40 },
  blobB: { width: 90, height: 90, bottom: -35, left: -25 },

  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  eyebrowWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#DDD6FE' },
  counter: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)' },

  body: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconCircle: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  factText: { flex: 1, fontSize: 13.5, lineHeight: 20, color: '#fff', fontWeight: '600' },

  footRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  tapHint: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  shareBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
});
