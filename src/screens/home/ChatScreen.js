import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, ScrollView,
  KeyboardAvoidingView, Platform, Animated, Easing, Dimensions,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { FadeInUp, PressableScale, Pulse } from '../../components/anim';
import { loadGLTF } from '../../components/gltfLoader';
import { storage } from '../../utils/storage';
import { MINDFULNESS_DOMAINS } from '../assess/MindfulnessAssessScreen';

const { width: W, height: H } = Dimensions.get('window');

const HOLOGRAM = require('../../../assets/models/brain_hologram.glb');

const PURPLE = '#7C3AED';
const CYAN   = '#7DE3FF';
const TEXT   = '#EFEBFF';
const SUB    = '#B4A5EE';
const GLASS  = 'rgba(255,255,255,0.07)';
const GLASS_BORDER = 'rgba(196,181,253,0.22)';

const DEFAULT_CHIPS = [
  'Explain my scores',
  'What should I improve?',
  'Give me a growth tip',
  "What's my next step?",
];

const STARTERS = [
  { icon: 'chart-donut',          label: 'Explain my scores',      sub: 'Your profile, decoded',    color: '#A78BFA' },
  { icon: 'trending-up',          label: 'What should I improve?', sub: 'Your biggest opportunity', color: '#7DE3FF' },
  { icon: 'lightbulb-on-outline', label: 'Give me a growth tip',   sub: 'Science-backed habits',    color: '#FDE68A' },
  { icon: 'flag-checkered',       label: "What's my next step?",   sub: 'Continue the journey',     color: '#6EE7B7' },
];

// ── Local coach engine ──────────────────────────────────────────
// Builds answers from the user's actual stored results — no network needed.
// Every reply returns { text, scores?, chips? } so the UI can render rich
// score cards and contextual follow-up suggestions.
function buildCoach(profile) {
  const { name, overall, domainMap, phase2Done, phase3Done, phase4Done } = profile;

  const domains = Object.entries(domainMap).map(([num, e]) => ({
    num: Number(num),
    label: MINDFULNESS_DOMAINS.find(d => d.num === Number(num))?.label || `Domain ${num}`,
    score: e.score,
  }));
  const sorted   = [...domains].sort((a, b) => b.score - a.score);
  const strongest = sorted[0];
  const weakest   = sorted[sorted.length - 1];
  const doneCount = domains.length;

  const TIPS = {
    1: 'Try single-tasking: pick one task, silence notifications, and hold attention on it for 15 minutes a day. Attention is a muscle — it strengthens with focused reps.',
    2: 'Use spaced repetition and "memory palace" visualisation. Reviewing something after 1 day, 3 days, then a week moves it into long-term storage.',
    3: 'Processing speed grows with timed practice — quick puzzles, speed-reading drills, or fast-paced card games for 10 minutes daily.',
    4: 'Reasoning sharpens with logic puzzles and by writing out the "why" behind decisions. Explaining your reasoning out loud exposes weak links.',
    5: 'Before big choices, list options, note the best and worst outcome for each, and set a deadline for deciding. Structure defeats decision paralysis.',
    6: 'Name your emotions precisely as they happen ("frustrated", not "bad"). Emotion labelling measurably calms the amygdala and builds emotional control.',
    7: 'Do one divergent-thinking drill daily: pick an everyday object and list 10 unusual uses. Original thinking is trainable.',
    8: 'End each day with two questions: "What did I learn?" and "What would I do differently?" Metacognition grows through structured reflection.',
  };

  function scoresAnswer() {
    if (!doneCount) {
      return {
        text: `You haven't completed any mindfulness domains yet, ${name}. Head to the Assess tab and start with Domain 1 — it takes just a few minutes, and I'll have real insights for you right after.`,
        chips: ["What's my next step?", 'What is RHIMS?'],
      };
    }
    let summary = `Here's your profile so far (${doneCount}/8 domains):`;
    if (overall != null) summary += `\n\nOverall mindfulness score: ${overall}/100.`;
    if (strongest && weakest && strongest.num !== weakest.num) {
      summary += ` Your standout strength is ${strongest.label}, while ${weakest.label} has the most room to grow.`;
    }
    return {
      text: summary,
      scores: sorted,
      chips: ['What should I improve?', "What's my next step?"],
    };
  }

  function improveAnswer() {
    if (!doneCount) {
      return {
        text: 'Once you complete a few assessment domains I can pinpoint exactly what to work on. Start with the Assess tab — even one domain gives me something to coach you on.',
        chips: ["What's my next step?"],
      };
    }
    return {
      text: `Your biggest opportunity is ${weakest.label} (${weakest.score}/100).\n\n${TIPS[weakest.num]}\n\nSmall daily reps beat occasional marathons — 10 focused minutes a day will move this score.`,
      chips: ['Give me a growth tip', 'Explain my scores'],
    };
  }

  function tipAnswer() {
    const pool = Object.values(TIPS);
    const tip = doneCount ? TIPS[weakest.num] : pool[Math.floor(Math.random() * pool.length)];
    return {
      text: `Here's a science-backed tip:\n\n${tip}`,
      chips: ['Another tip', 'What should I improve?'],
    };
  }

  function progressAnswer() {
    const steps = [
      `Mindfulness domains: ${doneCount}/8 complete`,
      `WHO Psychometric (Phase 2): ${phase2Done ? 'done ✓' : 'not started'}`,
      `Cognitive tasks (Phase 3): ${phase3Done ? 'done ✓' : 'not started'}`,
      `Expert interview (Phase 4): ${phase4Done ? 'done ✓' : 'not booked'}`,
    ];
    const next = doneCount < 8
      ? 'Your next step: finish the remaining mindfulness domains in the Assess tab.'
      : !phase2Done ? 'Your next step: take the WHO Psychometric from the Home screen.'
      : !phase3Done ? 'Your next step: complete the 8 cognitive tasks (Brain Challenge on Home).'
      : !phase4Done ? 'Your next step: book your Phase 4 expert interview.'
      : 'You have completed the full RHIMS journey — outstanding work!';
    return {
      text: `Here's where you are, ${name}:\n\n${steps.map(s => `• ${s}`).join('\n')}\n\n${next}`,
      chips: ['Explain my scores', 'What is RHIMS?'],
    };
  }

  const say = (text, chips) => () => ({ text, chips });

  const RULES = [
    { match: /score|result|profile|how (am|did) i/i, answer: scoresAnswer },
    { match: /improve|weak|better|work on|develop|grow/i, answer: improveAnswer },
    { match: /tip|advice|suggest|help me|exercise|practice|another/i, answer: tipAnswer },
    { match: /progress|next|step|phase|journey|status|left|remaining/i, answer: progressAnswer },
    { match: /rhims|riaura|about|what is this|app/i, answer: say(
      'RHIMS (RiAura Human Intelligence Mapping System) measures your intelligence across 8 science-backed domains — attention, memory, processing, reasoning, decision-making, emotional, social/originality and metacognition — using validated frameworks like FFMQ, PRMQ, GDMS and MAI. It combines mindfulness self-assessment, psychometrics, cognitive tasks and an expert interview into one Human Intelligence Index.',
      ['Explain my scores', "What's my next step?"]) },
    { match: /hello|hi|hey|good (morning|afternoon|evening)/i, answer: say(
      `Hey ${name}! I'm your RHIMS coach. Ask me about your scores, what to improve, or your next step in the journey.`) },
    { match: /thank|thanks|great|awesome|nice/i, answer: say(
      `Anytime, ${name}! Consistency is the whole game — see you tomorrow to keep the streak alive.`) },
    { match: /stress|anxious|anxiety|overwhelm|tired|calm/i, answer: say(
      'Try box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s — repeat for 2 minutes. Slow breathing activates the vagus nerve and shifts your brain out of threat mode. The Mindfulness domains in Assess can also help you understand your baseline.',
      ['Give me a growth tip']) },
    { match: /sleep|insomnia|rest/i, answer: say(
      'Sleep is when your brain consolidates memories and clears metabolic waste. Three levers that work: a consistent wake-up time (even weekends), no screens 45 minutes before bed, and keeping the room cool (~18°C). Deep sleep in the first half of the night does most of the memory work.',
      ['Give me a growth tip', 'What should I improve?']) },
    { match: /motivat|lazy|procrastinat|habit|consisten/i, answer: say(
      "Motivation follows action, not the other way round. Shrink the task until it's almost silly — \"open the app and do one domain\" — and let momentum do the rest. Habit research shows consistency beats intensity: same time, same trigger, every day.",
      ["What's my next step?"]) },
    { match: /streak|daily/i, answer: say(
      'Your streak grows every day you open RiAura and do one meaningful thing — a domain, a brain challenge, or a reflection. Protect it: streaks are the single best predictor of long-term improvement in training apps.',
      ["What's my next step?"]) },
    { match: /iq|intelligen(ce|t)|smart/i, answer: say(
      "Classic IQ captures only a slice of intelligence. RHIMS maps eight domains — including emotional, social and metacognitive intelligence — because real-world performance depends on the whole profile, not one number. Your strengths profile matters more than any single score.",
      ['Explain my scores']) },
    { match: /memory|forget/i, answer: say(`About memory: ${TIPS[2]}`, ['Give me a growth tip']) },
    { match: /focus|attention|distract/i, answer: say(`About attention: ${TIPS[1]}`, ['Give me a growth tip']) },
    { match: /emotion|feel/i, answer: say(`About emotional intelligence: ${TIPS[6]}`, ['Give me a growth tip']) },
    { match: /decide|decision|choice/i, answer: say(`About decision-making: ${TIPS[5]}`, ['Give me a growth tip']) },
    { match: /creativ|original|idea/i, answer: say(`About creative thinking: ${TIPS[7]}`, ['Give me a growth tip']) },
  ];

  return function reply(text) {
    for (const rule of RULES) {
      if (rule.match.test(text)) return rule.answer();
    }
    return {
      text: `I can help with your scores, growth tips, and your RHIMS journey. Try asking:\n\n• "Explain my scores"\n• "What should I improve?"\n• "What's my next step?"`,
    };
  };
}

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Ambient hologram brain floating behind the chat ─────────────
const TINTS = { Particle_1: '#B79CFF', Particle_2: '#7DE3FF' };

function HoloBrain({ dim }) {
  const group = useRef();
  const [scene, setScene] = useState(null);
  const mats = useRef([]);
  const t = useRef(0);
  const dimRef = useRef(dim);
  dimRef.current = dim;

  useEffect(() => {
    let alive = true;
    loadGLTF(HOLOGRAM)
      .then(gltf => {
        if (!alive) return;
        const s = gltf.scene.clone(true);
        const box = new THREE.Box3().setFromObject(s);
        const dims = box.getSize(new THREE.Vector3());
        s.scale.setScalar(1.55 / Math.max(dims.x, dims.y, dims.z));
        box.setFromObject(s);
        s.position.sub(box.getCenter(new THREE.Vector3()));
        s.traverse(obj => {
          if (!obj.isMesh) return;
          const mat = obj.material.clone();
          mat.transparent = true;
          const tint = TINTS[obj.material.name];
          if (tint && mat.color) mat.color.set(tint);
          obj.material = mat;
          mats.current.push({ mat, base: mat.opacity ?? 1 });
        });
        setScene(s);
      })
      .catch(err => console.warn('Coach hologram failed to load:', err?.message || err));
    return () => { alive = false; };
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    t.current += delta;
    group.current.rotation.y += delta * 0.22;
    group.current.position.y = Math.sin(t.current * 1.2) * 0.05;
    const flicker = 0.85 + 0.15 * Math.sin(t.current * 24 + Math.sin(t.current * 6) * 3);
    const strength = (dimRef.current ? 0.34 : 0.6) * flicker;
    mats.current.forEach(({ mat, base }) => { mat.opacity = base * strength; });
  });

  if (!scene) return null;
  return (
    <group ref={group} rotation={[0.15, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function HoloBackdrop({ dim }) {
  return (
    <View pointerEvents="none" style={styles.holoWrap}>
      <View style={[styles.holoGlow, dim && { opacity: 0.5 }]} />
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 2.9], fov: 45 }}
        style={{ flex: 1 }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
      >
        <ambientLight intensity={1.1} />
        <pointLight position={[-3, -1, 2]} intensity={1.2} color="#8B5CF6" />
        <directionalLight position={[2, 3, 4]} intensity={1.0} color="#C4B5FD" />
        <HoloBrain dim={dim} />
      </Canvas>
      {/* scanlines over the projection */}
      {[...Array(7)].map((_, i) => (
        <View key={i} style={[styles.scanline, { top: 40 + i * 46 }]} />
      ))}
    </View>
  );
}

// ── Cosmic backdrop stars ───────────────────────────────────────
function Stars() {
  const stars = useRef(
    Array.from({ length: 46 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: Math.random() * 2 + 0.8,
      o: Math.random() * 0.4 + 0.1,
      tint: Math.random() > 0.75 ? CYAN : '#E9E2FF',
    }))
  ).current;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {stars.map((st, i) => (
        <View key={i} style={{
          position: 'absolute', left: st.x, top: st.y,
          width: st.s, height: st.s, borderRadius: st.s,
          backgroundColor: st.tint, opacity: st.o,
        }} />
      ))}
    </View>
  );
}

// ── Animated typing indicator (three bouncing dots) ─────────────
function TypingDots() {
  const dots = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  useEffect(() => {
    const loops = dots.map((v, i) =>
      Animated.loop(Animated.sequence([
        Animated.delay(i * 140),
        Animated.timing(v, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 300, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        Animated.delay((2 - i) * 140),
      ]))
    );
    loops.forEach(l => l.start());
    return () => loops.forEach(l => l.stop());
  }, []);
  return (
    <View style={styles.typingRow}>
      {dots.map((v, i) => (
        <Animated.View
          key={i}
          style={[styles.typingDot, {
            transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -5] }) }],
            opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] }),
          }]}
        />
      ))}
    </View>
  );
}

// ── Inline score card rendered inside a coach bubble ────────────
function ScoreBars({ scores }) {
  return (
    <View style={styles.scoreCard}>
      {scores.map(d => (
        <View key={d.num} style={styles.scoreRow}>
          <Text style={styles.scoreLabel} numberOfLines={1}>{d.label}</Text>
          <View style={styles.scoreTrack}>
            <View style={[styles.scoreFill, {
              width: `${Math.max(d.score, 4)}%`,
              backgroundColor: d.score >= 70 ? '#6EE7B7' : d.score >= 45 ? '#A78BFA' : '#FDE68A',
            }]} />
          </View>
          <Text style={styles.scoreVal}>{d.score}</Text>
        </View>
      ))}
    </View>
  );
}

function CoachAvatar({ size = 28 }) {
  return (
    <LinearGradient
      colors={['#8B5CF6', '#6D28D9']}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }}
    >
      <MaterialCommunityIcons name="robot-happy" size={size * 0.58} color="#fff" />
    </LinearGradient>
  );
}

export default function ChatScreen({ navigation }) {
  const isFocused = useIsFocused();
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [coach, setCoach]       = useState(null);
  const [chips, setChips]       = useState(DEFAULT_CHIPS);
  const [userName, setUserName] = useState('there');
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      const reg       = await storage.getRegistration();
      const domainMap = await storage.getMindfulnessDomainScores();
      const overall   = await storage.getMindfulnessScore();
      const { answers } = await storage.getPhase2Answers();
      const { scores }  = await storage.getPhase3Scores();
      const p4        = await storage.getPhase4Marks();
      const name      = reg?.fullName?.split(' ')[0] || 'there';
      setUserName(name);

      setCoach(() => buildCoach({
        name, overall, domainMap,
        phase2Done: answers.length >= 40,
        phase3Done: scores.length >= 8,
        phase4Done: p4 !== null,
      }));

      const history = await storage.getChatHistory();
      if (history.length) setMessages(history);
    })();
  }, []);

  useEffect(() => {
    if (messages.length) storage.saveChatHistory(messages);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  }, [messages, typing]);

  function send(text) {
    const clean = text.trim();
    if (!clean || !coach || typing) return;
    setInput('');
    setMessages(m => [...m, { from: 'user', text: clean }]);
    setTyping(true);
    // Small human-feeling delay before the coach "types" its answer
    setTimeout(() => {
      const res = coach(clean);
      const answer = typeof res === 'string' ? { text: res } : res;
      setMessages(m => [...m, { from: 'ai', text: answer.text, scores: answer.scores }]);
      setChips(answer.chips?.length ? answer.chips : DEFAULT_CHIPS);
      setTyping(false);
    }, 700 + Math.random() * 500);
  }

  const isFresh = messages.length === 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0B0620" />
      <LinearGradient colors={['#0B0620', '#17104A', '#060312']} style={StyleSheet.absoluteFill} />
      <Stars />
      {/* the hologram brain floats behind the whole conversation */}
      {isFocused && <HoloBackdrop dim={!isFresh} />}

      {/* ── Header ── */}
      <View style={styles.topBar}>
        {navigation.canGoBack() ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.glassBtn}>
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </TouchableOpacity>
        ) : <View style={{ width: 40 }} />}
        <View style={styles.titleWrap}>
          <View>
            <CoachAvatar size={42} />
            <Pulse to={1.25} duration={1100} style={styles.onlineBadge} />
          </View>
          <View>
            <Text style={styles.pageTitle}>AI Coach</Text>
            <View style={styles.linkRow}>
              <View style={styles.linkDot} />
              <Text style={styles.linkText}>NEURAL LINK ACTIVE</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.glassBtn}
          onPress={async () => {
            await storage.clearChatHistory();
            setMessages([]);
            setChips(DEFAULT_CHIPS);
          }}
        >
          <Ionicons name="refresh" size={18} color={SUB} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Fresh-chat hero: greeting + starter cards ── */}
          {isFresh && (
            <View style={styles.hero}>
              {/* space for the hologram to shine through */}
              <View style={{ height: H * 0.30 }} />
              <FadeInUp>
                <Text style={styles.heroTitle}>{greetingWord()}, {userName}</Text>
                <Text style={styles.heroSub}>
                  Welcome to your neural dimension. I read your real RHIMS results and turn
                  them into plain-language insights and daily practice.
                </Text>
              </FadeInUp>
              <View style={styles.starterGrid}>
                {STARTERS.map((s, i) => (
                  <FadeInUp key={s.label} delay={120 + i * 70} style={styles.starterCell}>
                    <PressableScale style={styles.starterCard} onPress={() => send(s.label)}>
                      <View style={[styles.starterIcon, { backgroundColor: s.color + '26', borderColor: s.color + '66' }]}>
                        <MaterialCommunityIcons name={s.icon} size={18} color={s.color} />
                      </View>
                      <Text style={styles.starterLabel}>{s.label}</Text>
                      <Text style={styles.starterSub}>{s.sub}</Text>
                    </PressableScale>
                  </FadeInUp>
                ))}
              </View>
            </View>
          )}

          {/* ── Conversation ── */}
          {messages.map((m, i) => (
            <FadeInUp key={i} distance={10} duration={260}>
              <View style={[styles.bubbleRow, m.from === 'user' && styles.bubbleRowUser]}>
                {m.from === 'ai' && <CoachAvatar />}
                {m.from === 'user' ? (
                  <LinearGradient
                    colors={['#8B5CF6', '#6D28D9']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    style={[styles.bubble, styles.userBubble]}
                  >
                    <Text style={[styles.bubbleText, styles.userBubbleText]}>{m.text}</Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.bubble, styles.aiBubble]}>
                    <Text style={styles.bubbleText}>{m.text}</Text>
                    {m.scores?.length ? <ScoreBars scores={m.scores} /> : null}
                  </View>
                )}
              </View>
            </FadeInUp>
          ))}

          {typing && (
            <View style={styles.bubbleRow}>
              <CoachAvatar />
              <View style={[styles.bubble, styles.aiBubble, { paddingVertical: 14 }]}>
                <TypingDots />
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Contextual quick chips ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          keyboardShouldPersistTaps="handled"
        >
          {chips.map(q => (
            <PressableScale key={q} style={styles.chip} onPress={() => send(q)}>
              <MaterialCommunityIcons name="lightning-bolt" size={13} color={CYAN} />
              <Text style={styles.chipText}>{q}</Text>
            </PressableScale>
          ))}
        </ScrollView>

        {/* ── Input bar ── */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Transmit a thought…"
            placeholderTextColor="rgba(180,165,238,0.55)"
            onSubmitEditing={() => send(input)}
            returnKeyType="send"
          />
          <PressableScale
            style={[styles.sendBtn, (!input.trim() || typing) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || typing}
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </PressableScale>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0B0620', paddingTop: 54 },

  holoWrap: {
    position: 'absolute', top: 40, left: 0, right: 0, height: H * 0.46,
  },
  holoGlow: {
    position: 'absolute', alignSelf: 'center', top: '16%',
    width: W * 0.62, height: W * 0.62, borderRadius: W * 0.31,
    backgroundColor: 'rgba(124,58,237,0.16)',
  },
  scanline: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(125,227,255,0.045)',
  },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  glassBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pageTitle: { fontSize: 17, fontWeight: '800', color: TEXT },
  onlineBadge: {
    position: 'absolute', bottom: -1, right: -1,
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#34D399',
    borderWidth: 2, borderColor: '#0B0620',
  },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  linkDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: CYAN },
  linkText: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.5, color: CYAN },

  chatContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 10 },

  // Fresh-chat hero
  hero: { paddingBottom: 6 },
  heroTitle: { fontSize: 24, fontWeight: '900', color: TEXT, textAlign: 'center' },
  heroSub: {
    fontSize: 13.5, color: SUB, textAlign: 'center', lineHeight: 20,
    marginTop: 8, marginBottom: 18, paddingHorizontal: 18,
  },
  starterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  starterCell: { width: '48%', flexGrow: 1 },
  starterCard: {
    borderRadius: 18, padding: 14, minHeight: 108,
    backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_BORDER,
  },
  starterIcon: {
    width: 34, height: 34, borderRadius: 17, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  starterLabel: { fontSize: 13.5, fontWeight: '800', color: TEXT },
  starterSub: { fontSize: 11, color: SUB, marginTop: 3 },

  // Bubbles
  bubbleRow:     { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '88%' },
  bubbleRowUser: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubble:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  aiBubble: {
    backgroundColor: 'rgba(20,14,52,0.82)', borderBottomLeftRadius: 6,
    borderWidth: 1, borderColor: GLASS_BORDER,
  },
  userBubble:     { borderBottomRightRadius: 6 },
  bubbleText:     { fontSize: 14, color: TEXT, lineHeight: 21 },
  userBubbleText: { color: '#FFFFFF', fontWeight: '600' },

  // Typing dots
  typingRow: { flexDirection: 'row', gap: 5, alignItems: 'flex-end' },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: CYAN },

  // Inline score card
  scoreCard: { marginTop: 10, gap: 7 },
  scoreRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreLabel:{ width: 108, fontSize: 11, fontWeight: '600', color: SUB },
  scoreTrack:{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 3 },
  scoreVal:  { width: 26, fontSize: 11, fontWeight: '800', color: TEXT, textAlign: 'right' },

  // Chips
  chipsRow: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_BORDER,
    borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8,
  },
  chipText: { fontSize: 13, fontWeight: '700', color: '#C4B5FD' },

  // Input
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingBottom: 90, paddingTop: 4,
  },
  input: {
    flex: 1, backgroundColor: GLASS, borderRadius: 24,
    paddingHorizontal: 18, paddingVertical: 12, fontSize: 14, color: TEXT,
    borderWidth: 1, borderColor: GLASS_BORDER,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: PURPLE,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: PURPLE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 12, elevation: 6,
  },
  sendBtnDisabled: { backgroundColor: 'rgba(124,58,237,0.35)', shadowOpacity: 0 },
});
