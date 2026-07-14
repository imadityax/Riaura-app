// ─────────────────────────────────────────────────────────────────────────────
// RI-AURA · PHASE 3 · DOMAIN 1: ATTENTION INTELLIGENCE (Ages 3–6)
// "The Firefly Freeze" — Cognitive Control & Response Inhibition Simulation
//
// A touchscreen Go/No-Go task. The child catches glowing YELLOW fireflies (Go)
// while inhibiting the urge to tap RED fireflies flagged by an owl cue (No-Go).
// Three escalating levels probe response inhibition, goal-directed attention,
// interoceptive awareness, inhibitory latency and cognitive flexibility.
//
// UI: premium dark "night-garden arcade" — frosted-glass panels, neon glow,
// ambient bokeh depth, live neon timer. Scientific basis: PMC8638877.
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Easing,
  Dimensions, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { colors, ui } from '../../theme/colors';
import GameBackButton from '../../components/GameBackButton';

const { width: SCREEN_W } = Dimensions.get('window');

// Neon accent used across the premium UI chrome.
const NEON = '#6EE7FF';
const NEON_DEEP = '#22D3EE';

// ── Firefly palettes ────────────────────────────────────────────────────────
const FIREFLY = {
  yellow: { core: '#FFFDE7', mid: '#FFE24A', glow: '#FFC93C', ring: '#FFF3A0' },
  red:    { core: '#FFE3E3', mid: '#FF5470', glow: '#FF1E56', ring: '#FF9DAE' },
};

// ── Level design ─────────────────────────────────────────────────────────────
// Difficulty routing (Phase 2 score): <40% → Easy · 40–60% → Moderate · >60% → Hard.
const LEVELS = [
  {
    key: 'easy', num: 1, title: 'The Slow Catch',
    subtitle: 'A calm, quiet garden',
    narrator: 'Catch the YELLOW fireflies! If the owl hoots and a RED firefly appears — freeze your fingers!',
    goColor: 'yellow',
    duration: 26000, spawnEvery: 1450, lifetime: 4200,
    sway: 22, riseJitter: 0, noGoChance: 0.30, maxOnScreen: 4,
    cue: 'loud', reverse: false,
    bg: ['#0B1E3F', '#1A1547', '#05091C'],
  },
  {
    key: 'moderate', num: 2, title: 'The Noisy Swarm',
    subtitle: 'Denser, louder, faster',
    narrator: 'They are moving faster! Keep catching YELLOW — but still freeze for RED!',
    goColor: 'yellow',
    duration: 28000, spawnEvery: 820, lifetime: 2500,
    sway: 46, riseJitter: 0.35, noGoChance: 0.32, maxOnScreen: 7,
    cue: 'muffled', reverse: false,
    bg: ['#08192F', '#1B103A', '#03060F'],
  },
  {
    key: 'hard', num: 3, title: 'The Magic Reverse',
    subtitle: 'The rules flip mid-game',
    narrator: 'Catch YELLOW fast... then MAGIC SHIFT! Catch RED, freeze YELLOW!',
    goColor: 'yellow',
    duration: 26000, spawnEvery: 720, lifetime: 2100,
    sway: 54, riseJitter: 0.5, noGoChance: 0.34, maxOnScreen: 8,
    cue: 'muffled', reverse: true, warmup: 6000,
    bg: ['#1F0B37', '#380A2E', '#0A0418'],
  },
];

const r1 = (n) => Math.round(n * 10) / 10;
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// ── Per-level scoring against the RI-AURA rubric (5 marks / level, 15 total) ──
function scoreLevel(key, s) {
  const goTotal = s.hits + s.misses;
  const hitRate = goTotal ? s.hits / goTotal : 0;
  const avgRt = s.rt.length ? s.rt.reduce((a, b) => a + b, 0) / s.rt.length : 3000;

  if (key === 'easy') {
    const braking = s.commission === 0 ? 2.0 : clamp(2 - s.commission * 1.0, 0, 2);
    const attention = clamp(1.5 * (hitRate / 0.65), 0, 1.5);
    const intero = (s.correctInhibitions >= 1 && s.commission === 0)
      ? 1.5 : (s.correctInhibitions >= 1 ? 0.75 : 0);
    return {
      total: r1(braking + attention + intero),
      metrics: [
        { name: 'Response Inhibition (Motor Braking)', score: r1(braking), max: 2.0,
          note: s.commission === 0 ? 'Halted instantly on the owl cue.' : `${s.commission} red tap(s) slipped through.` },
        { name: 'Goal-Directed Attention', score: r1(attention), max: 1.5,
          note: `Caught ${s.hits}/${goTotal} yellow fireflies.` },
        { name: 'Interoceptive Awareness', score: r1(intero), max: 1.5,
          note: s.correctInhibitions >= 1 ? 'Self-regulated the urge to tap.' : 'Needed prompting to freeze.' },
      ],
    };
  }
  if (key === 'moderate') {
    const commission = s.commission === 0 ? 2.0 : clamp(2 - s.commission * 0.7, 0, 2);
    const attention = clamp(1.5 * (hitRate / 0.6), 0, 1.5);
    const latency = clamp(1.5 * (1 - (avgRt - 1200) / 1800), 0, 1.5);
    return {
      total: r1(commission + attention + latency),
      metrics: [
        { name: 'Response Inhibition (Commission Errors)', score: r1(commission), max: 2.0,
          note: s.commission === 0 ? 'No false taps under noise.' : `${s.commission} false tap(s) on red.` },
        { name: 'Goal-Directed Attention', score: r1(attention), max: 1.5,
          note: `Tracked ${s.hits}/${goTotal} fast targets.` },
        { name: 'Inhibitory Latency', score: r1(latency), max: 1.5,
          note: `Avg reaction ≈ ${Math.round(avgRt)} ms.` },
      ],
    };
  }
  // hard
  const flexibility = clamp(2 - s.perseverative * 1.0, 0, 2);
  const highSpeedInhib = s.postCommission === 0 ? 1.5 : clamp(1.5 - s.postCommission * 0.75, 0, 1.5);
  const switchMs = s.switchCostMs == null ? 5000 : s.switchCostMs;
  const switchCost = clamp(1.5 * (1 - (switchMs - 1500) / 3500), 0, 1.5);
  return {
    total: r1(flexibility + highSpeedInhib + switchCost),
    metrics: [
      { name: 'Cognitive Flexibility (Set-Shifting)', score: r1(flexibility), max: 2.0,
        note: s.perseverative === 0 ? 'Flipped rules with 0 errors.' : `${s.perseverative} perseverative tap(s).` },
      { name: 'Response Inhibition (High Speed)', score: r1(highSpeedInhib), max: 1.5,
        note: s.postCommission === 0 ? 'Avoided the new No-Go target.' : `${s.postCommission} false alarm(s) after switch.` },
      { name: 'Executive Control (Switch Cost)', score: r1(switchCost), max: 1.5,
        note: s.switchCostMs == null ? 'Did not adapt in time.' : `Adapted in ${(switchMs / 1000).toFixed(1)}s.` },
    ],
  };
}

const freshStats = () => ({
  hits: 0, misses: 0, commission: 0, correctInhibitions: 0, rt: [],
  perseverative: 0, postCommission: 0, switchCostMs: null,
});

// ═══════════════════════════════════════════════════════════════════════════
// Reusable premium chrome
// ═══════════════════════════════════════════════════════════════════════════

// Faux-frosted glass panel (expo-blur unavailable) — layered translucency with a
// bright top hairline to read as a lit glass edge.
function Glass({ style, children, tint = 'rgba(255,255,255,0.07)', border = 'rgba(255,255,255,0.16)' }) {
  return (
    <View style={[{ backgroundColor: tint, borderWidth: 1, borderColor: border, borderRadius: 22, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0)']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 40 }}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

// Cinematic edge vignette to add depth to the arena.
function Vignette() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['rgba(0,0,0,0.55)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 160 }} />
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220 }} />
    </View>
  );
}

// Ambient out-of-focus bokeh for parallax depth behind the fireflies.
function Bokeh() {
  const dots = useRef(
    Array.from({ length: 9 }, () => ({
      x: Math.random() * SCREEN_W,
      size: Math.random() * 90 + 50,
      delay: Math.random() * 4000,
      dur: Math.random() * 5000 + 6000,
      tint: Math.random() > 0.5 ? 'rgba(110,231,255,0.10)' : 'rgba(124,58,237,0.12)',
    }))
  ).current;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {dots.map((d, i) => <BokehDot key={i} d={d} />)}
    </View>
  );
}
function BokehDot({ d }) {
  const y = useRef(new Animated.Value(0)).current;
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(o, { toValue: 1, duration: d.dur * 0.4, delay: d.delay, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0, duration: d.dur * 0.6, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.timing(y, { toValue: 1, duration: d.dur, delay: d.delay, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);
  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [40, -60] });
  return (
    <Animated.View style={{
      position: 'absolute', left: d.x, top: '55%',
      width: d.size, height: d.size, borderRadius: d.size / 2,
      backgroundColor: d.tint, opacity: o, transform: [{ translateY }],
    }} />
  );
}

function StarField() {
  const stars = useRef(
    Array.from({ length: 34 }, () => ({
      x: Math.random() * SCREEN_W, y: Math.random() * 320,
      s: Math.random() * 2 + 1, o: Math.random() * 0.6 + 0.2,
    }))
  ).current;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((st, i) => (
        <View key={i} style={{ position: 'absolute', left: st.x, top: st.y, width: st.s, height: st.s, borderRadius: st.s, backgroundColor: '#fff', opacity: st.o }} />
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Firefly — animated, tappable neon sprite that floats upward.
// ─────────────────────────────────────────────────────────────────────────────
function Firefly({ data, onCatch, onEscape, dimmed }) {
  const rise = useRef(new Animated.Value(0)).current;
  const sway = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0.4)).current;
  const caughtRef = useRef(false);

  useEffect(() => {
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    const riseAnim = Animated.timing(rise, {
      toValue: 1, duration: data.lifetime, easing: Easing.linear, useNativeDriver: true,
    });
    riseAnim.start(({ finished }) => { if (finished && !caughtRef.current) onEscape(data); });
    Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 900 + data.swaySpeed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(sway, { toValue: 0, duration: 900 + data.swaySpeed, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 620, useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0.35, duration: 620, useNativeDriver: true }),
    ])).start();
    return () => riseAnim.stop();
  }, []);

  const handlePress = () => {
    if (caughtRef.current) return;
    caughtRef.current = true;
    Animated.timing(pop, { toValue: 1.7, duration: 170, useNativeDriver: true }).start();
    Animated.timing(glow, { toValue: 0, duration: 170, useNativeDriver: true }).start(() => onCatch(data));
  };

  const translateY = rise.interpolate({ inputRange: [0, 1], outputRange: [data.startY, data.endY] });
  const translateX = sway.interpolate({ inputRange: [0, 1], outputRange: [data.x - data.sway, data.x + data.sway] });
  const opacity = rise.interpolate({ inputRange: [0, 0.08, 0.85, 1], outputRange: [0, 1, 1, 0] });
  const c = FIREFLY[data.color];

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.fireflyWrap, {
        opacity: dimmed ? Animated.multiply(opacity, 0.5) : opacity,
        transform: [{ translateX }, { translateY }, { scale: pop }],
      }]}
    >
      <Pressable onPress={handlePress} hitSlop={16} style={styles.fireflyHit}>
        <Animated.View style={[styles.aura, { backgroundColor: c.glow, opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.06, 0.20] }), transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.4] }) }] }]} />
        <Animated.View style={[styles.glowOuter, { backgroundColor: c.glow, opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] }), transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.25] }) }] }]} />
        <View style={[styles.glowMid, { backgroundColor: c.mid, shadowColor: c.glow }]} />
        <View style={[styles.core, { backgroundColor: c.core }]} />
        <Animated.View style={[styles.wing, styles.wingL, { backgroundColor: c.ring, opacity: glow }]} />
        <Animated.View style={[styles.wing, styles.wingR, { backgroundColor: c.ring, opacity: glow }]} />
      </Pressable>
    </Animated.View>
  );
}

function Popper({ data, onDone }) {
  const y = useRef(new Animated.Value(0)).current;
  const o = useRef(new Animated.Value(1)).current;
  const s = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(y, { toValue: -52, duration: 720, useNativeDriver: true }),
      Animated.timing(o, { toValue: 0, duration: 720, useNativeDriver: true }),
      Animated.spring(s, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start(() => onDone(data.id));
  }, []);
  return (
    <Animated.Text style={[styles.popper, { left: data.x - 26, top: data.y, color: data.color, textShadowColor: data.color, opacity: o, transform: [{ translateY: y }, { scale: s }] }]}>
      {data.text}
    </Animated.Text>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function FireflyFreezeScreen({ route, navigation }) {
  const params = route?.params || {};
  const { phase2Answers, taskScores, taskIndex, phase2Score, embedded } = params;

  const routed = phase2Score == null ? null
    : phase2Score < 40 ? 'easy' : phase2Score <= 60 ? 'moderate' : 'hard';

  const [stage, setStage] = useState('intro'); // intro | countdown | playing | levelSummary | report
  const [levelIdx, setLevelIdx] = useState(0);
  const [count, setCount] = useState(3);
  const [fireflies, setFireflies] = useState([]);
  const [poppers, setPoppers] = useState([]);
  const [caughtCount, setCaughtCount] = useState(0);
  const [freezeCue, setFreezeCue] = useState(false);
  const [shifted, setShifted] = useState(false);
  const [flash, setFlash] = useState(false);
  const [results, setResults] = useState([]);

  const arena = useRef({ w: SCREEN_W, h: 480 }).current;
  const statsRef = useRef(freshStats());
  const idRef = useRef(0);
  const goColorRef = useRef('yellow');
  const nogoOnScreen = useRef(0);
  const shiftAtRef = useRef(null);
  const spawnTimer = useRef(null);
  const levelTimer = useRef(null);
  const warmupTimer = useRef(null);
  const timerAnim = useRef(new Animated.Value(0)).current; // live level progress

  const level = LEVELS[levelIdx];

  const clearTimers = () => {
    clearInterval(spawnTimer.current);
    clearTimeout(levelTimer.current);
    clearTimeout(warmupTimer.current);
    timerAnim.stopAnimation();
  };
  useEffect(() => () => clearTimers(), []);

  const spawn = useCallback(() => {
    setFireflies((prev) => {
      if (prev.length >= level.maxOnScreen) return prev;
      const id = ++idRef.current;
      const isNoGo = Math.random() < level.noGoChance;
      const color = isNoGo
        ? (goColorRef.current === 'yellow' ? 'red' : 'yellow')
        : goColorRef.current;
      if (isNoGo) nogoOnScreen.current += 1;
      const margin = 46;
      const x = margin + Math.random() * (arena.w - margin * 2);
      const jitter = level.riseJitter ? (1 - Math.random() * level.riseJitter) : 1;
      const fly = {
        id, color, isNoGo,
        x, sway: (Math.random() * 0.5 + 0.6) * level.sway,
        swaySpeed: Math.random() * 500,
        startY: arena.h - 70, endY: -60,
        lifetime: level.lifetime * jitter,
        born: Date.now(),
      };
      return [...prev, fly];
    });
  }, [levelIdx]);

  const addPopper = (x, y, text, color) => {
    const id = ++idRef.current;
    setPoppers((p) => [...p, { id, x, y, text, color }]);
  };

  const onCatch = useCallback((fly) => {
    const s = statsRef.current;
    const isTarget = fly.color === goColorRef.current;
    const rt = Date.now() - fly.born;
    if (isTarget) {
      s.hits += 1; s.rt.push(rt);
      setCaughtCount((c) => c + 1);
      addPopper(fly.x, arena.h * 0.4, '+1', '#FFE24A');
      if (shiftAtRef.current && s.switchCostMs == null && goColorRef.current === 'red') {
        s.switchCostMs = Date.now() - shiftAtRef.current;
      }
    } else {
      s.commission += 1;
      if (fly.isNoGo) nogoOnScreen.current = Math.max(0, nogoOnScreen.current - 1);
      if (shiftAtRef.current) {
        s.postCommission += 1;
        if (fly.color === 'yellow') s.perseverative += 1;
      }
      addPopper(fly.x, arena.h * 0.4, 'oops', '#FF5470');
    }
    setFireflies((prev) => prev.filter((f) => f.id !== fly.id));
    if (fly.isNoGo) setTimeout(() => { if (nogoOnScreen.current <= 0) setFreezeCue(false); }, 0);
  }, []);

  const onEscape = useCallback((fly) => {
    const s = statsRef.current;
    const isTarget = fly.color === goColorRef.current;
    if (isTarget) s.misses += 1;
    else s.correctInhibitions += 1;
    if (fly.isNoGo) {
      nogoOnScreen.current = Math.max(0, nogoOnScreen.current - 1);
      if (nogoOnScreen.current <= 0) setFreezeCue(false);
    }
    setFireflies((prev) => prev.filter((f) => f.id !== fly.id));
  }, []);

  const onBackgroundTap = () => {};

  useEffect(() => {
    if (stage !== 'playing') return;
    if (fireflies.some((f) => f.isNoGo)) setFreezeCue(true);
  }, [fireflies, stage]);

  const startLevel = useCallback((idx) => {
    const lv = LEVELS[idx];
    statsRef.current = freshStats();
    goColorRef.current = 'yellow';
    nogoOnScreen.current = 0;
    shiftAtRef.current = null;
    setShifted(false);
    setFireflies([]); setPoppers([]); setCaughtCount(0); setFreezeCue(false);
    setStage('playing');

    timerAnim.setValue(0);
    Animated.timing(timerAnim, { toValue: 1, duration: lv.duration, easing: Easing.linear, useNativeDriver: false }).start();

    spawnTimer.current = setInterval(spawn, lv.spawnEvery);
    levelTimer.current = setTimeout(() => endLevel(idx), lv.duration);
    if (lv.reverse) warmupTimer.current = setTimeout(() => triggerMagicShift(), lv.warmup);
  }, [spawn]);

  const triggerMagicShift = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 700);
    goColorRef.current = 'red';
    shiftAtRef.current = Date.now();
    setShifted(true);
    setFireflies([]);
    nogoOnScreen.current = 0;
    setFreezeCue(false);
  };

  const endLevel = (idx) => {
    clearTimers();
    setFireflies([]);
    const res = scoreLevel(LEVELS[idx].key, statsRef.current);
    setResults((prev) => [...prev, { key: LEVELS[idx].key, ...res }]);
    setStage('levelSummary');
  };

  useEffect(() => {
    if (stage !== 'countdown') return;
    setCount(3);
    let n = 3;
    const iv = setInterval(() => {
      n -= 1;
      if (n <= 0) { clearInterval(iv); startLevel(levelIdx); }
      else setCount(n);
    }, 900);
    return () => clearInterval(iv);
  }, [stage, levelIdx]);

  const beginGame = () => { setLevelIdx(0); setResults([]); setStage('countdown'); };
  const nextLevel = () => {
    if (levelIdx + 1 >= LEVELS.length) setStage('report');
    else { setLevelIdx((i) => i + 1); setStage('countdown'); }
  };

  const grandTotal = r1(results.reduce((a, r) => a + r.total, 0));
  const taskScore5 = Math.round((grandTotal / 15) * 5);

  const finishAssessment = () => {
    if (embedded && Array.isArray(taskScores)) {
      navigation.replace('Task_Stroop', {
        phase2Answers, taskScores: [...taskScores, taskScore5], taskIndex: (taskIndex || 0) + 1,
      });
    } else navigation.navigate('Main');
  };

  const confirmExit = () => {
    Alert.alert('Leave the garden?', 'The fireflies will fly away and this round won’t be saved.', [
      { text: 'Keep Playing', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => { clearTimers(); navigation.navigate('Main'); } },
    ]);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  if (stage === 'intro') return <Intro routed={routed} onStart={beginGame} onBack={() => navigation.goBack()} />;
  if (stage === 'report') return <Report results={results} grandTotal={grandTotal} taskScore5={taskScore5} onFinish={finishAssessment} onBack={() => navigation.goBack()} embedded={embedded} />;

  const timerWidth = timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['100%', '0%'] });

  return (
    <View style={styles.root}>
      <LinearGradient colors={level.bg} style={StyleSheet.absoluteFill} />
      <Bokeh />
      <StarField />

      {/* HUD */}
      <SafeAreaView edges={['top']} style={styles.hud} pointerEvents="box-none">
        <Pressable onPress={confirmExit} hitSlop={12} style={styles.hudBtn}>
          <Ionicons name="close" size={20} color="#fff" />
        </Pressable>

        <Glass style={styles.hudCenter} tint="rgba(255,255,255,0.08)">
          <Text style={styles.hudLevel}>LEVEL {level.num} · {level.title.toUpperCase()}</Text>
          <View style={styles.ruleChip}>
            <View style={[styles.ruleDot, { backgroundColor: FIREFLY[shifted ? 'red' : level.goColor].mid, shadowColor: FIREFLY[shifted ? 'red' : level.goColor].glow }]} />
            <Text style={styles.ruleText}>Catch {shifted ? 'RED' : 'YELLOW'}</Text>
          </View>
        </Glass>

        <Glass style={styles.hudScore} tint="rgba(255,255,255,0.08)">
          <MaterialCommunityIcons name="star-four-points" size={15} color={colors.gold} />
          <Text style={styles.hudScoreText}>{caughtCount}</Text>
        </Glass>
      </SafeAreaView>

      {/* Live neon level timer */}
      <View style={styles.timerTrack}>
        <Animated.View style={[styles.timerFill, { width: timerWidth }]}>
          <LinearGradient colors={[NEON, NEON_DEEP]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      </View>

      {/* Arena */}
      <Pressable
        style={styles.arena}
        onPress={onBackgroundTap}
        onLayout={(e) => { const { width, height } = e.nativeEvent.layout; arena.w = width; arena.h = height; }}
      >
        {fireflies.map((f) => (
          <Firefly key={f.id} data={f} onCatch={onCatch} onEscape={onEscape} dimmed={freezeCue && !f.isNoGo && f.color === goColorRef.current} />
        ))}
        {poppers.map((p) => (
          <Popper key={p.id} data={p} onDone={(id) => setPoppers((ps) => ps.filter((x) => x.id !== id))} />
        ))}
        <LinearGradient colors={['transparent', 'rgba(12,32,18,0.6)']} style={styles.ground} pointerEvents="none" />
      </Pressable>

      <Vignette />

      {freezeCue && stage === 'playing' && <FreezeCue muffled={level.cue === 'muffled'} />}
      {flash && <MagicFlash />}
      {stage === 'countdown' && <Countdown level={level} count={count} />}
      {stage === 'levelSummary' && (
        <LevelSummary level={level} result={results[results.length - 1]} last={levelIdx + 1 >= LEVELS.length} onNext={nextLevel} onExit={confirmExit} />
      )}
    </View>
  );
}

// ── The owl "freeze" cue ──────────────────────────────────────────────────────
function FreezeCue({ muffled }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 520, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 520, useNativeDriver: true }),
    ])).start();
  }, []);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const wave = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.2, muffled ? 0.4 : 0.9] });
  return (
    <>
      <View pointerEvents="none" style={[styles.freezeVignette, { opacity: muffled ? 0.45 : 0.85 }]} />
      <Animated.View pointerEvents="none" style={[styles.owlBanner, { transform: [{ scale }] }]}>
        <Glass style={styles.owlGlass} tint="rgba(255,30,86,0.14)" border="rgba(255,80,112,0.5)">
          <View style={styles.owlRow}>
            <Animated.View style={[styles.soundWave, { opacity: wave }]} />
            <Text style={styles.owlEmoji}>🦉</Text>
            <Animated.View style={[styles.soundWave, { opacity: wave }]} />
          </View>
          <Text style={styles.freezeText}>FREEZE!</Text>
          <Text style={styles.freezeSub}>{muffled ? 'listen… the owl is hooting' : 'Hoot! Do not tap red'}</Text>
        </Glass>
      </Animated.View>
    </>
  );
}

function MagicFlash() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(a, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(a, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.magicFlash, { opacity: a }]}>
      <LinearGradient colors={['rgba(124,58,237,0.6)', 'rgba(236,72,153,0.55)']} style={StyleSheet.absoluteFill} />
      <Text style={styles.magicText}>✨ MAGIC SHIFT ✨</Text>
      <Text style={styles.magicSub}>Now catch RED — freeze YELLOW!</Text>
    </Animated.View>
  );
}

function Countdown({ level, count }) {
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => { s.setValue(0); Animated.spring(s, { toValue: 1, friction: 4, useNativeDriver: true }).start(); }, [count]);
  return (
    <View style={styles.overlay} pointerEvents="none">
      <Glass style={styles.narratorCard} tint="rgba(20,26,60,0.72)" border="rgba(110,231,255,0.35)">
        <Text style={styles.narratorLevel}>LEVEL {level.num}</Text>
        <Text style={styles.narratorTitle}>{level.title}</Text>
        <Text style={styles.narratorText}>{level.narrator}</Text>
      </Glass>
      <Animated.Text style={[styles.countNum, { transform: [{ scale: s }] }]}>{count}</Animated.Text>
    </View>
  );
}

function LevelSummary({ level, result, last, onNext, onExit }) {
  const stars = Math.round((result.total / 5) * 3);
  return (
    <View style={styles.overlay}>
      <GameBackButton dark label="Exit" onPress={onExit} />
      <Glass style={styles.summaryCard} tint="rgba(18,24,54,0.9)" border="rgba(110,231,255,0.3)">
        <Text style={styles.summaryTitle}>{level.title} — Done!</Text>
        <View style={styles.starRow}>
          {[0, 1, 2].map((i) => (
            <MaterialCommunityIcons key={i} name={i < stars ? 'star' : 'star-outline'} size={36} color={i < stars ? colors.gold : 'rgba(255,255,255,0.25)'} />
          ))}
        </View>
        <Text style={styles.summaryScore}>{result.total} <Text style={styles.summaryScoreSub}>/ 5</Text></Text>
        {result.metrics.map((m) => (
          <View key={m.name} style={styles.metricRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricName}>{m.name}</Text>
              <Text style={styles.metricNote}>{m.note}</Text>
            </View>
            <Text style={styles.metricScore}>{m.score}/{m.max}</Text>
          </View>
        ))}
        <NeonButton label={last ? 'See My Results →' : 'Next Level →'} onPress={onNext} />
      </Glass>
    </View>
  );
}

function NeonButton({ label, onPress, icon }) {
  return (
    <Pressable style={styles.neonBtn} onPress={onPress}>
      <LinearGradient colors={[NEON, NEON_DEEP]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.neonBtnGrad}>
        {icon ? <MaterialCommunityIcons name={icon} size={20} color="#05233A" /> : null}
        <Text style={styles.neonBtnText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

// ── Intro cover ──────────────────────────────────────────────────────────────
function Intro({ routed, onStart, onBack }) {
  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(float, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(float, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);
  const ty = float.interpolate({ inputRange: [0, 1], outputRange: [0, -14] });
  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0B1E3F', '#1A1547', '#05091C']} style={StyleSheet.absoluteFill} />
      <Bokeh />
      <StarField />
      <Vignette />
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.introBack}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.introBackText}>Back</Text>
        </Pressable>
        <ScrollView contentContainerStyle={styles.introContent} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.introFly, { transform: [{ translateY: ty }] }]}>
            <View style={[styles.aura, { width: 120, height: 120, borderRadius: 60, backgroundColor: FIREFLY.yellow.glow, opacity: 0.18 }]} />
            <View style={[styles.glowMid, { width: 70, height: 70, borderRadius: 35, backgroundColor: FIREFLY.yellow.mid, shadowColor: FIREFLY.yellow.glow }]} />
            <View style={[styles.core, { width: 32, height: 32, borderRadius: 16, backgroundColor: FIREFLY.yellow.core }]} />
          </Animated.View>

          <View style={styles.domainBadge}><Text style={styles.domainText}>PHASE 3 · ATTENTION · AGES 3–6</Text></View>
          <Text style={styles.introTitle}>The Firefly Freeze</Text>
          <Text style={styles.introSub}>Catch the glowing fireflies in the magic garden — but freeze your fingers when the owl hoots!</Text>

          <Glass style={styles.howCard} tint="rgba(255,255,255,0.06)">
            <HowRow color="yellow" icon="hand-pointing-up" title="Catch yellow" text="Tap the yellow fireflies to catch them." />
            <HowRow color="red" icon="hand-back-right-off-outline" title="Freeze on red + owl" text="See a red firefly & hear the owl? Don’t tap!" />
            <HowRow color="magic" icon="autorenew" title="Magic reverse" text="Later the rules flip — stay sharp!" />
          </Glass>

          <View style={styles.levelPreview}>
            {LEVELS.map((lv) => (
              <Glass key={lv.key} style={[styles.lvChip, routed === lv.key && styles.lvChipActive]} tint={routed === lv.key ? 'rgba(245,197,24,0.16)' : 'rgba(255,255,255,0.05)'} border={routed === lv.key ? colors.gold : 'rgba(255,255,255,0.12)'}>
                <Text style={[styles.lvChipNum, routed === lv.key && styles.lvChipTextActive]}>L{lv.num}</Text>
                <Text style={[styles.lvChipName, routed === lv.key && styles.lvChipTextActive]}>{lv.title}</Text>
                {routed === lv.key && <Text style={styles.lvChipMatch}>matched to you</Text>}
              </Glass>
            ))}
          </View>

          <NeonButton label="Enter the Garden" icon="play" onPress={onStart} />
          <Text style={styles.sciNote}>Go/No-Go response-inhibition task · validated in early childhood (PMC8638877)</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function HowRow({ color, icon, title, text }) {
  const dot = color === 'magic' ? colors.gold : FIREFLY[color].mid;
  return (
    <View style={styles.howRow}>
      <View style={[styles.howDot, { backgroundColor: dot + '26', borderColor: dot, shadowColor: dot }]}>
        <MaterialCommunityIcons name={icon} size={18} color={dot} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.howTitle}>{title}</Text>
        <Text style={styles.howText}>{text}</Text>
      </View>
    </View>
  );
}

// ── Final report ─────────────────────────────────────────────────────────────
function Report({ results, grandTotal, taskScore5, onFinish, onBack, embedded }) {
  const band = grandTotal >= 12 ? { label: 'Excellent Control', color: colors.success }
    : grandTotal >= 8 ? { label: 'Developing Well', color: colors.gold }
    : { label: 'Emerging Skills', color: colors.phase3 };
  return (
    <View style={styles.root}>
      <GameBackButton dark onPress={onBack} />
      <LinearGradient colors={['#0B1E3F', '#1A1547', '#05091C']} style={StyleSheet.absoluteFill} />
      <Bokeh />
      <StarField />
      <Vignette />
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.reportContent} showsVerticalScrollIndicator={false}>
          <View style={styles.trophyWrap}>
            <View style={[styles.aura, { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.gold, opacity: 0.2 }]} />
            <MaterialCommunityIcons name="trophy" size={58} color={colors.gold} />
          </View>
          <Text style={styles.reportTitle}>Great Flying!</Text>
          <View style={[styles.bandChip, { backgroundColor: band.color + '24', borderColor: band.color }]}>
            <Text style={[styles.bandText, { color: band.color }]}>{band.label}</Text>
          </View>
          <Text style={styles.reportBig}>{grandTotal}<Text style={styles.reportBigSub}> / 15</Text></Text>
          <Text style={styles.reportScaled}>Attention task score: {taskScore5}/5</Text>

          {results.map((r, i) => (
            <Glass key={r.key} style={styles.reportCard} tint="rgba(255,255,255,0.06)">
              <Text style={styles.reportCardTitle}>Level {i + 1} · {LEVELS[i].title}</Text>
              <Text style={styles.reportCardScore}>{r.total}/5</Text>
              {r.metrics.map((m) => (
                <View key={m.name} style={styles.reportMetric}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportMetricName}>{m.name}</Text>
                    <View style={styles.barTrack}>
                      <LinearGradient colors={[NEON, NEON_DEEP]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.barFill, { width: `${(m.score / m.max) * 100}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.reportMetricScore}>{m.score}/{m.max}</Text>
                </View>
              ))}
            </Glass>
          ))}

          <NeonButton label={embedded ? 'Continue Assessment →' : 'Finish'} onPress={onFinish} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05091C' },

  // HUD
  hud: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 6, gap: 10, zIndex: 20 },
  hudBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  hudCenter: { flex: 1, flexShrink: 1, minWidth: 0, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 18 },
  hudLevel: { color: '#fff', fontWeight: '800', fontSize: 12, letterSpacing: 0.6 },
  ruleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5, backgroundColor: 'rgba(0,0,0,0.25)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  ruleDot: { width: 12, height: 12, borderRadius: 6, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 6, elevation: 4 },
  ruleText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  hudScore: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, height: 42, borderRadius: 21 },
  hudScoreText: { color: '#fff', fontWeight: '900', fontSize: 17 },

  // Timer
  timerTrack: { height: 5, marginHorizontal: 16, marginTop: 10, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden', zIndex: 20 },
  timerFill: { height: '100%', borderRadius: 3, overflow: 'hidden', shadowColor: NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6 },

  // Arena
  arena: { flex: 1, overflow: 'hidden' },
  ground: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 110 },

  // Firefly
  fireflyWrap: { position: 'absolute', left: 0, top: 0, width: 64, height: 64, marginLeft: -32, alignItems: 'center', justifyContent: 'center' },
  fireflyHit: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center' },
  aura: { position: 'absolute', width: 88, height: 88, borderRadius: 44 },
  glowOuter: { position: 'absolute', width: 56, height: 56, borderRadius: 28 },
  glowMid: { position: 'absolute', width: 34, height: 34, borderRadius: 17, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 16, elevation: 12 },
  core: { width: 18, height: 18, borderRadius: 9 },
  wing: { position: 'absolute', width: 14, height: 20, borderRadius: 10, top: 10 },
  wingL: { left: 6, transform: [{ rotate: '-24deg' }] },
  wingR: { right: 6, transform: [{ rotate: '24deg' }] },

  // Popper
  popper: { position: 'absolute', fontWeight: '900', fontSize: 24, textShadowRadius: 10 },

  // Freeze cue
  freezeVignette: { ...StyleSheet.absoluteFillObject, borderWidth: 12, borderColor: '#FF1E56', borderRadius: 2 },
  owlBanner: { position: 'absolute', top: '28%', alignSelf: 'center', left: 24, right: 24, alignItems: 'center' },
  owlGlass: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 28, borderRadius: 26 },
  owlRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  owlEmoji: { fontSize: 58 },
  soundWave: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: '#FFD54F' },
  freezeText: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: 3, marginTop: 4, textShadowColor: '#FF1E56', textShadowRadius: 16 },
  freezeSub: { color: '#FFE0E6', fontSize: 13, fontWeight: '600', marginTop: 2 },

  // Magic flash
  magicFlash: { alignItems: 'center', justifyContent: 'center', zIndex: 30 },
  magicText: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 2, textShadowColor: '#7C3AED', textShadowRadius: 16 },
  magicSub: { color: '#FFE082', fontSize: 15, fontWeight: '700', marginTop: 8 },

  // Overlays
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(4,6,18,0.72)', zIndex: 25, padding: 24 },
  narratorCard: { padding: 24, alignItems: 'center', maxWidth: 350, borderRadius: 26 },
  narratorLevel: { color: NEON, fontWeight: '800', fontSize: 12, letterSpacing: 1.5 },
  narratorTitle: { color: '#fff', fontWeight: '900', fontSize: 24, marginVertical: 5, textShadowColor: 'rgba(110,231,255,0.5)', textShadowRadius: 12 },
  narratorText: { color: '#C7CCE8', fontSize: 14, textAlign: 'center', lineHeight: 21 },
  countNum: { color: '#fff', fontSize: 104, fontWeight: '900', marginTop: 26, textShadowColor: NEON, textShadowRadius: 24 },

  // Summary
  summaryCard: { padding: 24, width: '100%', maxWidth: 390, borderRadius: 28 },
  summaryTitle: { fontSize: 21, fontWeight: '900', color: '#fff', textAlign: 'center' },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 12 },
  summaryScore: { fontSize: 40, fontWeight: '900', color: NEON, textAlign: 'center', marginBottom: 14, textShadowColor: 'rgba(110,231,255,0.5)', textShadowRadius: 14 },
  summaryScoreSub: { fontSize: 20, color: '#8890C0' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  metricName: { fontSize: 13, fontWeight: '700', color: '#fff' },
  metricNote: { fontSize: 11, color: '#9AA0C8', marginTop: 2 },
  metricScore: { fontSize: 15, fontWeight: '900', color: NEON },

  // Neon button
  neonBtn: { borderRadius: 18, overflow: 'hidden', marginTop: 20, width: '100%', shadowColor: NEON, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.7, shadowRadius: 16, elevation: 8 },
  neonBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 26 },
  neonBtnText: { color: '#05233A', fontWeight: '900', fontSize: 17 },

  // Intro
  introBack: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, gap: 2 },
  introBackText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  introContent: { padding: 22, paddingBottom: 44, alignItems: 'center' },
  introFly: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 14 },
  domainBadge: { backgroundColor: 'rgba(110,231,255,0.14)', borderWidth: 1, borderColor: 'rgba(110,231,255,0.4)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 12 },
  domainText: { color: NEON, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  introTitle: { color: '#fff', fontSize: 34, fontWeight: '900', textAlign: 'center', textShadowColor: 'rgba(110,231,255,0.4)', textShadowRadius: 18 },
  introSub: { color: '#B7BEE4', fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 10, marginBottom: 22, paddingHorizontal: 8 },
  howCard: { padding: 16, width: '100%', borderRadius: 22 },
  howRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 9 },
  howDot: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 8 },
  howTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  howText: { color: '#9AA0C8', fontSize: 12, marginTop: 1 },
  levelPreview: { flexDirection: 'row', gap: 8, marginTop: 18, width: '100%' },
  lvChip: { flex: 1, flexShrink: 1, minWidth: 0, padding: 10, alignItems: 'center', borderRadius: 16 },
  lvChipActive: {},
  lvChipNum: { color: '#8890C0', fontWeight: '900', fontSize: 13 },
  lvChipName: { color: '#B7BEE4', fontWeight: '700', fontSize: 10, textAlign: 'center', marginTop: 2 },
  lvChipMatch: { color: colors.gold, fontSize: 8, fontWeight: '800', marginTop: 3 },
  lvChipTextActive: { color: '#fff' },
  sciNote: { color: '#6870A0', fontSize: 10, textAlign: 'center', marginTop: 14 },

  // Report
  reportContent: { padding: 22, paddingBottom: 40, alignItems: 'center' },
  trophyWrap: { width: 110, height: 110, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  reportTitle: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 4, textShadowColor: 'rgba(245,197,24,0.4)', textShadowRadius: 16 },
  bandChip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 5, marginTop: 10 },
  bandText: { fontWeight: '800', fontSize: 13 },
  reportBig: { color: '#fff', fontSize: 58, fontWeight: '900', marginTop: 12 },
  reportBigSub: { fontSize: 22, color: '#8890C0', fontWeight: '700' },
  reportScaled: { color: '#B7BEE4', fontSize: 14, fontWeight: '600', marginBottom: 18 },
  reportCard: { padding: 16, width: '100%', marginBottom: 12, borderRadius: 20 },
  reportCardTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  reportCardScore: { color: colors.gold, fontWeight: '900', fontSize: 20, position: 'absolute', right: 16, top: 14 },
  reportMetric: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  reportMetricName: { color: '#C7CCE8', fontSize: 12, fontWeight: '600', marginBottom: 5 },
  barTrack: { height: 7, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  reportMetricScore: { color: '#fff', fontWeight: '800', fontSize: 13, width: 46, textAlign: 'right' },
});
