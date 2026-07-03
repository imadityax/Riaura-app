import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { storage } from '../utils/storage';
import { ui } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { getUserData } from '../firebase/firestore';

export default function SplashScreen({ navigation }) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loading) return;

    (async () => {
      await new Promise(r => setTimeout(r, 2000));

      if (!currentUser) {
        navigation.replace('Login');
        return;
      }

      // User is logged in — check their progress
      const data = await getUserData(currentUser.uid);
      const phase = data?.phase ?? 0;

      if (phase >= 4) {
        const scores = await storage.getScores();
        navigation.replace('FinalReport', { scores });
      } else {
        navigation.replace('Main');
      }
    })();
  }, [loading, currentUser]);

  return (
    <LinearGradient colors={[ui.blueGradStart, ui.blueGradEnd]} style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <View style={styles.logoBox}>
          <Text style={styles.logoEmoji}>🧠</Text>
        </View>
        <Text style={styles.brand}>RiAura</Text>
        <Text style={styles.title}>RHIMS™</Text>
        <Text style={styles.sub}>Human Intelligence Mapping System</Text>
      </Animated.View>
      <Text style={styles.footer}>Class 1 Operational Architecture</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logoBox: {
    width: 100, height: 100, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  logoEmoji: { fontSize: 48 },
  brand: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700', letterSpacing: 3, marginBottom: 4 },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  footer: { position: 'absolute', bottom: 40, fontSize: 11, color: 'rgba(255,255,255,0.5)' },
});
