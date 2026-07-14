import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NeuralLoader from '../components/NeuralLoader';
import { rf, scale } from '../utils/responsive';
import BrainIcon from '../components/BrainIcon';

const { width } = Dimensions.get('window');
const BURST = 22;

// A single particle flung outward from centre, then fading.
function Burst({ progress, seed }) {
  const angle = (Math.PI * 2 * seed) / BURST + (seed % 3);
  const dist  = 120 + (seed * 37) % 90;
  const size  = 4 + (seed % 4);
  const hue   = ['#8B9EFF', '#C7D2FE', '#FDE68A', '#6EE7B7', '#F0ABFC'][seed % 5];

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size, height: size, borderRadius: size / 2, backgroundColor: hue,
        opacity: progress.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] }),
        transform: [
          { translateX: progress.interpolate({ inputRange: [0, 1], outputRange: [0, dist * Math.cos(angle)] }) },
          { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [0, dist * Math.sin(angle)] }) },
          { scale: progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.4, 1.2, 0.6] }) },
        ],
      }}
    />
  );
}

export default function CompletionScreen({ route, navigation }) {
  const report  = route.params?.report || {};
  const burst   = useRef(new Animated.Value(0)).current;
  const brain   = useRef(new Animated.Value(0)).current;
  const content = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(brain, { toValue: 1, speed: 3, bounciness: 14, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(burst,   { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(content, { toValue: 1, duration: 500,  easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    const t = setTimeout(() => {
      navigation.replace('MindfulnessReport', report);
    }, 2700);
    return () => clearTimeout(t);
  }, []);

  return (
    <LinearGradient colors={['#4B3A9B', '#3A2C74', '#33265F']} style={styles.container}>
      <View style={styles.center}>
        {/* particle explosion */}
        <View style={styles.burstAnchor}>
          {Array.from({ length: BURST }, (_, i) => <Burst key={i} progress={burst} seed={i + 1} />)}
        </View>

        <Animated.View style={[styles.brainWrap, { transform: [{ scale: brain }] }]}>
          <View style={styles.brainGlow} />
          <View style={styles.brainCircle}>
            <BrainIcon size={scale(54)} color="#fff" strokeWidth={2} />
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: content, alignItems: 'center' }}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="check-decagram" size={14} color="#6EE7B7" />
            <Text style={styles.badgeText}>ACHIEVEMENT UNLOCKED</Text>
          </View>
          <Text style={styles.title}>Assessment Completed</Text>
          <View style={styles.loaderRow}>
            <NeuralLoader size={54} color="#8B9EFF" />
          </View>
          <Text style={styles.sub}>Generating your Human Intelligence Passport…</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },

  burstAnchor: { position: 'absolute', width: 1, height: 1, top: '38%', alignItems: 'center', justifyContent: 'center' },

  brainWrap:   { alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  brainGlow: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(139,158,255,0.28)',
  },
  brainCircle: {
    width: scale(112), height: scale(112), borderRadius: scale(56),
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },

  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(110,231,183,0.14)', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(110,231,183,0.3)', marginBottom: 14,
  },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#6EE7B7' },
  title:     { fontSize: rf(23), fontWeight: '900', color: '#fff', textAlign: 'center' },
  loaderRow: { marginTop: 22, marginBottom: 16 },
  sub:       { fontSize: 13, color: 'rgba(255,255,255,0.65)', textAlign: 'center' },
});
