// RiAura · Domain 1 — playable attention-task engines.
//
// Each Domain-1 activity maps to one cognitive paradigm (activity.engine).
// This screen resolves difficulty from the user's score band (Easy <40 /
// Moderate 40–60 / Hard >60), runs the interactive task, captures real metrics
// (reaction times, omission/commission errors, switch cost, Stroop
// interference, time-on-target…) and returns a normalized 0–100 score to the
// activity list via the onComplete route callback.

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, Pressable, TouchableOpacity, StyleSheet, StatusBar,
  useWindowDimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ui, dark } from '../../theme/colors';
import { rf, scale, ms } from '../../utils/responsive';

// ── helpers ──────────────────────────────────────────────
const rand   = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const clamp  = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const avg    = arr => (arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0);
const pct    = (n, d) => (d ? Math.round((n / d) * 100) : 0);
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = randInt(0, i);[a[i], a[j]] = [a[j], a[i]]; } return a; };

// Timeout registry that auto-clears on unmount — prevents state updates after
// the player leaves mid-task.
function useTimeouts() {
  const ref = useRef([]);
  useEffect(() => () => ref.current.forEach(clearTimeout), []);
  const set = useCallback((fn, delay) => { const id = setTimeout(fn, delay); ref.current.push(id); return id; }, []);
  const clearAll = useCallback(() => { ref.current.forEach(clearTimeout); ref.current = []; }, []);
  return { set, clearAll };
}

// ── difficulty config per engine × band ──────────────────
function resolveConfig(engine, band) {
  const B = band === 'easy' ? 0 : band === 'hard' ? 2 : 1;
  const pick = (e, m, h) => [e, m, h][B];
  switch (engine) {
    case 'vigilance':
      return { trials: pick(12, 16, 20), targetProb: pick(0.55, 0.42, 0.32),
        isiMin: pick(900, 800, 700), isiMax: pick(2400, 3400, 4200),
        stimMs: pick(900, 700, 550), responseWindow: pick(1100, 950, 820) };
    case 'gonogo':
      return { trials: pick(16, 22, 28), goProb: pick(0.72, 0.77, 0.8),
        stimMs: pick(1100, 850, 680), isi: pick(520, 430, 360) };
    case 'search':
      return { trials: pick(5, 7, 9), gridN: pick(6, 9, 12), similar: pick(0, 1, 2) };
    case 'switch':
      return { trials: pick(14, 18, 22), switchProb: pick(0.3, 0.42, 0.52), responseWindow: pick(3200, 2400, 1900) };
    case 'hold':
      return { durationMs: pick(20000, 25000, 30000), flashEvery: pick(3200, 2200, 1500) };
    case 'stroop':
      return { trials: pick(12, 16, 20), incongruentProb: pick(0.35, 0.55, 0.7), colors: pick(3, 4, 4), responseWindow: pick(3000, 2300, 1800) };
    case 'dual':
      return { beats: pick(14, 18, 22), window: pick(1400, 1050, 850), secProb: pick(0.3, 0.45, 0.6) };
    default:
      return {};
  }
}

const ENGINE_HOWTO = {
  vigilance: 'Watch the centre. Tap anywhere the moment the GOLD star pulses. Ignore the dim blue distractor pulses.',
  gonogo:    'Tap to catch the GREEN targets as fast as you can. When a RED one appears, do NOT tap — hold back.',
  search:    'A target is shown at the top. Find and tap the matching item in the grid as fast as you can.',
  switch:    'Follow the current rule at the top (COLOUR or SHAPE) and sort each item Left or Right. The rule will change without warning.',
  hold:      'Press and hold your finger on the pad. Keep holding through every distraction — do not lift off.',
  stroop:    'Tap the button for the INK COLOUR the word is written in — ignore what the word says.',
  dual:      'Two lanes at once: tap the TOP target every time it flashes, and also tap the BOTTOM target whenever it appears.',
};

// ══════════════════════════════════════════════════════════
//  ENGINE 1 · VIGILANCE  (sustained attention / CPT)
// ══════════════════════════════════════════════════════════
function VigilanceGame({ cfg, theme, onFinish }) {
  const [disp, setDisp] = useState({ phase: 'rest', kind: null });
  const [progress, setProgress] = useState(0);
  const { set } = useTimeouts();
  const S = useRef({ i: 0, onset: 0, kind: null, tapped: false, hits: 0, omissions: 0, commissions: 0, targets: 0, nontargets: 0, rts: [], rtFirst: [], rtSecond: [] }).current;

  const finish = useCallback(() => {
    const meanRT = Math.round(avg(S.rts));
    const hitRate = S.targets ? S.hits / S.targets : 0;
    const faRate = clamp(S.commissions / Math.max(1, S.targets + S.nontargets), 0, 1);
    const rtScore = S.rts.length ? clamp((cfg.responseWindow - meanRT) / cfg.responseWindow, 0, 1) : 0;
    const score = clamp(Math.round(100 * (0.55 * hitRate + 0.30 * (1 - faRate) + 0.15 * rtScore)), 0, 100);
    const decrement = Math.round(avg(S.rtSecond) - avg(S.rtFirst));
    onFinish({
      score, correct: S.hits, total: S.targets,
      metrics: [
        { label: 'Omission Errors', value: `${S.omissions}` },
        { label: 'Commission Errors', value: `${S.commissions}` },
        { label: 'Mean Reaction Time', value: meanRT ? `${meanRT} ms` : '—' },
        { label: 'Vigilance Decrement', value: S.rtFirst.length && S.rtSecond.length ? `${decrement > 0 ? '+' : ''}${decrement} ms` : '—' },
      ],
    });
  }, [cfg, onFinish, S]);

  const runTrial = useCallback(() => {
    if (S.i >= cfg.trials) { finish(); return; }
    setProgress(S.i / cfg.trials);
    S.tapped = false; S.kind = null;
    setDisp({ phase: 'rest', kind: null });
    set(() => {
      const isTarget = Math.random() < cfg.targetProb;
      S.kind = isTarget ? 'target' : 'distractor';
      S.onset = Date.now();
      if (isTarget) S.targets++; else S.nontargets++;
      setDisp({ phase: 'show', kind: S.kind });
      set(() => setDisp(d => (d.phase === 'show' ? { phase: 'rest', kind: null } : d)), cfg.stimMs);
      set(() => {
        if (S.kind === 'target' && !S.tapped) S.omissions++;
        S.i++; runTrial();
      }, cfg.responseWindow);
    }, rand(cfg.isiMin, cfg.isiMax));
  }, [cfg, finish, set, S]);

  useEffect(() => { const t = setTimeout(runTrial, 400); return () => clearTimeout(t); }, [runTrial]);

  function onTap() {
    if (S.tapped) return;
    if (S.kind === 'target') {
      S.tapped = true;
      const rt = Date.now() - S.onset;
      S.hits++; S.rts.push(rt);
      (S.i < cfg.trials / 2 ? S.rtFirst : S.rtSecond).push(rt);
      setDisp(d => ({ ...d, kind: 'hit' }));
    } else { S.tapped = true; S.commissions++; }
  }

  const showing = disp.phase === 'show';
  const isTarget = disp.kind === 'target' || disp.kind === 'hit';
  return (
    <Pressable style={games.playArea} onPress={onTap}>
      <TaskHUD progress={progress} label="Tap on the gold pulse" theme={theme} />
      <View style={games.center}>
        <View style={[games.vigRing, showing && { borderColor: isTarget ? '#F5C518' : '#3B82F6' }]}>
          <View style={[
            games.vigDot,
            showing && isTarget && { backgroundColor: '#F5C518', width: scale(90), height: scale(90), borderRadius: scale(45) },
            showing && !isTarget && { backgroundColor: '#3B82F6', opacity: 0.5 },
            disp.kind === 'hit' && { backgroundColor: '#10B981' },
          ]}>
            {disp.kind === 'hit' && <Ionicons name="checkmark" size={scale(34)} color="#fff" />}
          </View>
        </View>
        <Text style={games.hint}>{showing ? (isTarget ? 'TAP!' : 'ignore') : 'watch…'}</Text>
      </View>
    </Pressable>
  );
}

// ══════════════════════════════════════════════════════════
//  ENGINE 2 · GO / NO-GO  (response inhibition)
// ══════════════════════════════════════════════════════════
function GoNoGoGame({ cfg, theme, onFinish }) {
  const [stim, setStim] = useState(null); // 'go' | 'nogo' | null
  const [flash, setFlash] = useState(null); // 'hit'|'miss'|'bad'|'good'
  const [progress, setProgress] = useState(0);
  const { set } = useTimeouts();
  const S = useRef({ i: 0, onset: 0, kind: null, tapped: false, hits: 0, omissions: 0, commissions: 0, correctRej: 0, goTrials: 0, nogoTrials: 0, rts: [] }).current;

  const finish = useCallback(() => {
    const meanRT = Math.round(avg(S.rts));
    const inhibition = S.nogoTrials ? S.correctRej / S.nogoTrials : 1;
    const goAcc = S.goTrials ? S.hits / S.goTrials : 0;
    const score = clamp(Math.round(100 * (0.45 * goAcc + 0.45 * inhibition + 0.10 * (meanRT ? clamp((cfg.stimMs - meanRT) / cfg.stimMs, 0, 1) : 0))), 0, 100);
    onFinish({
      score, correct: S.hits + S.correctRej, total: cfg.trials,
      metrics: [
        { label: 'Commission Errors', value: `${S.commissions}` },
        { label: 'Omission Errors', value: `${S.omissions}` },
        { label: 'Inhibition Accuracy', value: `${pct(S.correctRej, S.nogoTrials)}%` },
        { label: 'Mean Reaction Time', value: meanRT ? `${meanRT} ms` : '—' },
      ],
    });
  }, [cfg, onFinish, S]);

  const runTrial = useCallback(() => {
    if (S.i >= cfg.trials) { finish(); return; }
    setProgress(S.i / cfg.trials);
    S.tapped = false; setStim(null); setFlash(null);
    set(() => {
      const go = Math.random() < cfg.goProb;
      S.kind = go ? 'go' : 'nogo';
      if (go) S.goTrials++; else S.nogoTrials++;
      S.onset = Date.now(); setStim(S.kind);
      set(() => {
        if (S.kind === 'go' && !S.tapped) { S.omissions++; setFlash('miss'); }
        if (S.kind === 'nogo' && !S.tapped) { S.correctRej++; setFlash('good'); }
        setStim(null); S.i++;
        set(runTrial, 260);
      }, cfg.stimMs);
    }, cfg.isi);
  }, [cfg, finish, set, S]);

  useEffect(() => { const t = setTimeout(runTrial, 400); return () => clearTimeout(t); }, [runTrial]);

  function onTap() {
    if (S.tapped || !S.kind) return;
    S.tapped = true;
    if (S.kind === 'go') { S.hits++; S.rts.push(Date.now() - S.onset); setFlash('hit'); }
    else { S.commissions++; setFlash('bad'); }
  }

  const bg = flash === 'bad' ? '#FCA5A5' : flash === 'miss' ? '#FED7AA' : 'transparent';
  return (
    <Pressable style={[games.playArea, { backgroundColor: bg }]} onPress={onTap}>
      <TaskHUD progress={progress} label="Catch green · hold on red" theme={theme} />
      <View style={games.center}>
        <View style={[
          games.gngOrb,
          stim === 'go' && { backgroundColor: '#10B981', borderColor: '#059669' },
          stim === 'nogo' && { backgroundColor: '#EF4444', borderColor: '#B91C1C' },
        ]}>
          <Ionicons
            name={stim === 'nogo' ? 'hand-left' : 'sparkles'}
            size={scale(46)}
            color={stim ? '#fff' : 'transparent'}
          />
        </View>
        <Text style={games.hint}>
          {stim === 'go' ? 'TAP!' : stim === 'nogo' ? 'STOP' : 'get ready…'}
        </Text>
      </View>
    </Pressable>
  );
}

// ══════════════════════════════════════════════════════════
//  ENGINE 3 · VISUAL SEARCH  (selective attention)
// ══════════════════════════════════════════════════════════
const SEARCH_COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
const SEARCH_SHAPES = ['circle', 'square', 'triangle'];

function SearchGame({ cfg, theme, onFinish }) {
  const [trial, setTrial] = useState(0);
  const [cells, setCells] = useState([]);
  const [targetSpec, setTargetSpec] = useState(null);
  const [wrongIdx, setWrongIdx] = useState(null);
  const { width } = useWindowDimensions();
  const S = useRef({ latencies: [], decoys: [], onset: 0, firstTryOK: 0 }).current;

  const build = useCallback((t) => {
    const target = { color: SEARCH_COLORS[0], shape: cfg.similar >= 1 ? 'triangle' : 'circle' };
    const n = cfg.gridN;
    const targetIdx = randInt(0, n - 1);
    const arr = [];
    for (let k = 0; k < n; k++) {
      if (k === targetIdx) { arr.push({ ...target, target: true }); continue; }
      let color, shape;
      if (cfg.similar >= 2) { color = Math.random() < 0.6 ? target.color : SEARCH_COLORS[randInt(1, 3)]; shape = SEARCH_SHAPES[randInt(0, 2)]; }
      else if (cfg.similar === 1) { color = SEARCH_COLORS[randInt(0, 3)]; shape = SEARCH_SHAPES[randInt(0, 2)]; }
      else { color = SEARCH_COLORS[randInt(1, SEARCH_COLORS.length - 1)]; shape = target.shape; }
      // never accidentally clone the exact target
      if (color === target.color && shape === target.shape) color = SEARCH_COLORS[randInt(1, 3)];
      arr.push({ color, shape, target: false });
    }
    setTargetSpec(target); setCells(arr); setWrongIdx(null);
    S.onset = Date.now(); S.tapped = false;
  }, [cfg, S]);

  useEffect(() => { build(0); }, [build]);

  function onCell(i, cell) {
    if (cell.target) {
      S.latencies.push(Date.now() - S.onset);
      if (!S.tapped) S.firstTryOK++;
      const next = trial + 1;
      if (next >= cfg.trials) {
        const meanLat = Math.round(avg(S.latencies));
        const decoyTotal = S.decoys.reduce((a, b) => a + b, 0);
        const accuracy = pct(S.firstTryOK, cfg.trials);
        const speed = clamp((3000 - meanLat) / 2600, 0, 1);
        const score = clamp(Math.round(100 * (0.45 * (accuracy / 100) + 0.55 * speed)), 0, 100);
        onFinish({
          score, correct: S.firstTryOK, total: cfg.trials,
          metrics: [
            { label: 'Mean Identification Latency', value: `${meanLat} ms` },
            { label: 'Decoy Susceptibility', value: `${decoyTotal} taps` },
            { label: 'First-Try Accuracy', value: `${accuracy}%` },
          ],
        });
      } else { setTrial(next); build(next); }
    } else {
      S.tapped = true;
      S.decoys[trial] = (S.decoys[trial] || 0) + 1;
      setWrongIdx(i);
    }
  }

  const cols = cfg.gridN <= 6 ? 3 : 4;
  const size = Math.min(scale(84), (width - scale(40) - (cols - 1) * scale(12)) / cols);
  return (
    <View style={games.playArea}>
      <TaskHUD progress={trial / cfg.trials} label={`Find ${trial + 1} of ${cfg.trials}`} theme={theme} />
      <View style={games.searchPrompt}>
        <Text style={games.searchPromptText}>Find this target:</Text>
        {targetSpec && <Shape shape={targetSpec.shape} color={targetSpec.color} size={scale(40)} />}
      </View>
      <View style={[games.grid, { width: cols * size + (cols - 1) * scale(12) }]}>
        {cells.map((c, i) => (
          <Pressable key={i} onPress={() => onCell(i, c)}
            style={[games.gridCell, { width: size, height: size }, wrongIdx === i && games.gridCellWrong]}>
            <Shape shape={c.shape} color={c.color} size={size * 0.5} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Shape({ shape, color, size }) {
  if (shape === 'circle') return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
  if (shape === 'square') return <View style={{ width: size, height: size, borderRadius: size * 0.16, backgroundColor: color }} />;
  // triangle
  return <View style={{ width: 0, height: 0, borderLeftWidth: size / 2, borderRightWidth: size / 2, borderBottomWidth: size, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color }} />;
}

// ══════════════════════════════════════════════════════════
//  ENGINE 4 · TASK SWITCHING  (cognitive flexibility)
// ══════════════════════════════════════════════════════════
function SwitchGame({ cfg, theme, onFinish }) {
  const [rule, setRule] = useState('COLOUR');
  const [stim, setStim] = useState(null);
  const [isSwitch, setIsSwitch] = useState(false);
  const [flash, setFlash] = useState(null);
  const [progress, setProgress] = useState(0);
  const { set } = useTimeouts();
  const S = useRef({ i: 0, rule: 'COLOUR', prevRule: null, onset: 0, answered: false, correct: 0, persev: 0, switchRTs: [], repeatRTs: [] }).current;

  const sideFor = (r, st) => r === 'COLOUR' ? (st.color === 'red' ? 'L' : 'R') : (st.shape === 'circle' ? 'L' : 'R');

  const finish = useCallback(() => {
    const accuracy = pct(S.correct, cfg.trials);
    const sc = Math.round(avg(S.switchRTs)), rc = Math.round(avg(S.repeatRTs));
    const switchCost = sc && rc ? sc - rc : 0;
    const switchScore = clamp(1 - Math.max(0, switchCost) / 1200, 0, 1);
    const score = clamp(Math.round(100 * (0.7 * (accuracy / 100) + 0.3 * switchScore)), 0, 100);
    onFinish({
      score, correct: S.correct, total: cfg.trials,
      metrics: [
        { label: 'Accuracy', value: `${accuracy}%` },
        { label: 'Switch-Cost Latency', value: `${switchCost > 0 ? '+' : ''}${switchCost} ms` },
        { label: 'Perseveration Errors', value: `${S.persev}` },
        { label: 'Mean Reaction Time', value: `${Math.round(avg([...S.switchRTs, ...S.repeatRTs]))} ms` },
      ],
    });
  }, [cfg, onFinish, S]);

  const runTrial = useCallback(() => {
    if (S.i >= cfg.trials) { finish(); return; }
    setProgress(S.i / cfg.trials);
    const sw = S.prevRule !== null && Math.random() < cfg.switchProb;
    S.rule = sw ? (S.prevRule === 'COLOUR' ? 'SHAPE' : 'COLOUR') : (S.prevRule || 'COLOUR');
    const st = { color: Math.random() < 0.5 ? 'red' : 'blue', shape: Math.random() < 0.5 ? 'circle' : 'square' };
    S.stim = st; S.answered = false; S.onset = Date.now();
    setRule(S.rule); setIsSwitch(sw); setStim(st); setFlash(null);
    set(() => {
      if (!S.answered) { S.prevRule = S.rule; S.i++; set(runTrial, 200); }
    }, cfg.responseWindow);
  }, [cfg, finish, set, S]);

  useEffect(() => { const t = setTimeout(runTrial, 400); return () => clearTimeout(t); }, [runTrial]);

  function choose(side) {
    if (S.answered || !S.stim) return;
    S.answered = true;
    const rt = Date.now() - S.onset;
    const correctSide = sideFor(S.rule, S.stim);
    const isSw = S.prevRule !== null && S.prevRule !== S.rule;
    if (side === correctSide) {
      S.correct++; setFlash('good');
      (isSw ? S.switchRTs : S.repeatRTs).push(rt);
    } else {
      setFlash('bad');
      const prevCorrect = S.prevRule ? sideFor(S.prevRule, S.stim) : null;
      if (isSw && side === prevCorrect) S.persev++;
    }
    S.prevRule = S.rule; S.i++;
    set(runTrial, 260);
  }

  const st = stim;
  return (
    <View style={games.playArea}>
      <TaskHUD progress={progress} label="Sort by the current rule" theme={theme} />
      <View style={[games.ruleBanner, isSwitch && { backgroundColor: theme + '22', borderColor: theme }]}>
        <Text style={[games.ruleText, { color: theme }]}>SORT BY {rule}</Text>
        {isSwitch && <Text style={games.ruleSwitch}>⚡ RULE CHANGED</Text>}
      </View>
      <View style={games.center}>
        {st ? <Shape shape={st.shape} color={st.color === 'red' ? '#EF4444' : '#3B82F6'} size={scale(96)} /> : <View style={{ height: scale(96) }} />}
        <Text style={games.switchHint}>
          {rule === 'COLOUR' ? 'Red → Left · Blue → Right' : 'Circle → Left · Square → Right'}
        </Text>
      </View>
      <View style={games.lrRow}>
        <Pressable style={[games.lrBtn, flash === 'bad' && games.lrBtnBad]} onPress={() => choose('L')}>
          <Ionicons name="arrow-back" size={scale(26)} color={'#1E1B33'} />
          <Text style={games.lrText}>LEFT</Text>
        </Pressable>
        <Pressable style={games.lrBtn} onPress={() => choose('R')}>
          <Ionicons name="arrow-forward" size={scale(26)} color={'#fff'} />
          <Text style={games.lrText}>RIGHT</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  ENGINE 5 · HOLD STEADY  (interference control / time-on-target)
// ══════════════════════════════════════════════════════════
function HoldGame({ cfg, theme, onFinish }) {
  const [held, setHeld] = useState(false);
  const [remaining, setRemaining] = useState(Math.round(cfg.durationMs / 1000));
  const [distract, setDistract] = useState(false);
  const [tot, setTot] = useState(0);
  const { set } = useTimeouts();
  const S = useRef({ heldMs: 0, holding: false, lastTick: 0, breaks: 0, startedAt: 0, curStreak: 0, bestStreak: 0 }).current;

  const finish = useCallback(() => {
    const timeOnTarget = clamp(Math.round((S.heldMs / cfg.durationMs) * 100), 0, 100);
    const score = clamp(timeOnTarget - S.breaks * 2, 0, 100);
    onFinish({
      score, correct: timeOnTarget, total: 100,
      metrics: [
        { label: 'Time-on-Target', value: `${timeOnTarget}%` },
        { label: 'Interference Breaks', value: `${S.breaks}` },
        { label: 'Longest Hold', value: `${(S.bestStreak / 1000).toFixed(1)} s` },
      ],
    });
  }, [cfg, onFinish, S]);

  useEffect(() => {
    S.startedAt = Date.now(); S.lastTick = Date.now();
    const tick = setInterval(() => {
      const now = Date.now();
      const dt = now - S.lastTick; S.lastTick = now;
      if (S.holding) { S.heldMs += dt; S.curStreak += dt; S.bestStreak = Math.max(S.bestStreak, S.curStreak); }
      const elapsed = now - S.startedAt;
      setRemaining(Math.max(0, Math.ceil((cfg.durationMs - elapsed) / 1000)));
      setTot(clamp(Math.round((S.heldMs / cfg.durationMs) * 100), 0, 100));
      if (elapsed >= cfg.durationMs) { clearInterval(tick); finish(); }
    }, 100);
    const dz = setInterval(() => { setDistract(true); setTimeout(() => setDistract(false), 450); }, cfg.flashEvery);
    return () => { clearInterval(tick); clearInterval(dz); };
  }, [cfg, finish, S]);

  function onIn() { S.holding = true; S.curStreak = 0; setHeld(true); }
  function onOut() { if (S.holding && Date.now() - S.startedAt < cfg.durationMs) S.breaks++; S.holding = false; setHeld(false); }

  return (
    <View style={[games.playArea, distract && { backgroundColor: '#1E1B4B' }]}>
      <TaskHUD progress={1 - remaining / (cfg.durationMs / 1000)} label={`Hold steady · ${remaining}s left`} theme={theme} />
      <View style={games.center}>
        <Pressable onPressIn={onIn} onPressOut={onOut}
          style={[games.holdPad, held && { backgroundColor: theme, borderColor: theme, transform: [{ scale: 1.05 }] }, distract && !held && games.holdPadShake]}>
          <Ionicons name={held ? 'flame' : 'flame-outline'} size={scale(56)} color={held ? '#fff' : theme} />
          <Text style={[games.holdText, held && { color: '#1E1B33' }]}>{held ? 'HOLDING' : 'PRESS & HOLD'}</Text>
        </Pressable>
        <Text style={[games.hint, distract && { color: '#1E1B33' }]}>Time on target: {tot}%</Text>
        {distract && <Text style={games.distractText}>⚡ stay focused!</Text>}
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  ENGINE 6 · STROOP  (conflict resolution)
// ══════════════════════════════════════════════════════════
const STROOP = [
  { key: 'RED', hex: '#EF4444' }, { key: 'BLUE', hex: '#3B82F6' },
  { key: 'GREEN', hex: '#10B981' }, { key: 'YELLOW', hex: '#F59E0B' },
];
function StroopGame({ cfg, theme, onFinish }) {
  const palette = STROOP.slice(0, cfg.colors);
  const [word, setWord] = useState(null);
  const [ink, setInk] = useState(null);
  const [flash, setFlash] = useState(null);
  const [progress, setProgress] = useState(0);
  const { set } = useTimeouts();
  const S = useRef({ i: 0, onset: 0, answered: false, correct: 0, congRT: [], incongRT: [] }).current;

  const finish = useCallback(() => {
    const accuracy = pct(S.correct, cfg.trials);
    const cong = Math.round(avg(S.congRT)), incong = Math.round(avg(S.incongRT));
    const interference = cong && incong ? incong - cong : 0;
    const meanRT = Math.round(avg([...S.congRT, ...S.incongRT]));
    const speed = meanRT ? clamp((cfg.responseWindow - meanRT) / cfg.responseWindow, 0, 1) : 0;
    const score = clamp(Math.round(100 * (0.7 * (accuracy / 100) + 0.3 * speed)), 0, 100);
    onFinish({
      score, correct: S.correct, total: cfg.trials,
      metrics: [
        { label: 'Accuracy', value: `${accuracy}%` },
        { label: 'Stroop Interference', value: `${interference > 0 ? '+' : ''}${interference} ms` },
        { label: 'Mean Reaction Time', value: meanRT ? `${meanRT} ms` : '—' },
      ],
    });
  }, [cfg, onFinish, S]);

  const runTrial = useCallback(() => {
    if (S.i >= cfg.trials) { finish(); return; }
    setProgress(S.i / cfg.trials);
    const w = palette[randInt(0, palette.length - 1)];
    const incong = Math.random() < cfg.incongruentProb;
    let inkC = w;
    if (incong) { do { inkC = palette[randInt(0, palette.length - 1)]; } while (inkC.key === w.key); }
    S.word = w; S.ink = inkC; S.incong = incong; S.answered = false; S.onset = Date.now();
    setWord(w); setInk(inkC); setFlash(null);
    set(() => { if (!S.answered) { S.i++; set(runTrial, 200); } }, cfg.responseWindow);
  }, [cfg, finish, palette, set, S]);

  useEffect(() => { const t = setTimeout(runTrial, 400); return () => clearTimeout(t); }, [runTrial]);

  function choose(colorKey) {
    if (S.answered || !S.ink) return;
    S.answered = true;
    const rt = Date.now() - S.onset;
    if (colorKey === S.ink.key) { S.correct++; setFlash('good'); (S.incong ? S.incongRT : S.congRT).push(rt); }
    else setFlash('bad');
    S.i++; set(runTrial, 240);
  }

  return (
    <View style={games.playArea}>
      <TaskHUD progress={progress} label="Tap the INK colour" theme={theme} />
      <View style={games.center}>
        <Text style={[games.stroopWord, { color: ink?.hex || '#fff' }]}>{word?.key || '···'}</Text>
        <Text style={games.hint}>ignore the word — match the colour it’s printed in</Text>
      </View>
      <View style={games.stroopBtns}>
        {palette.map(c => (
          <Pressable key={c.key} onPress={() => choose(c.key)} style={[games.stroopBtn, { backgroundColor: c.hex }]}>
            <Text style={games.stroopBtnText}>{c.key}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ══════════════════════════════════════════════════════════
//  ENGINE 7 · DUAL TASK  (divided attention)
// ══════════════════════════════════════════════════════════
function DualGame({ cfg, theme, onFinish }) {
  const [top, setTop] = useState(false);
  const [bot, setBot] = useState(false);
  const [progress, setProgress] = useState(0);
  const { set } = useTimeouts();
  const S = useRef({ i: 0, onset: 0, topLive: false, botLive: false, topTapped: false, botTapped: false,
    pHits: 0, pTrials: 0, sHits: 0, sTrials: 0, soloRT: [], dualRT: [] }).current;

  const finish = useCallback(() => {
    const pAcc = pct(S.pHits, S.pTrials), sAcc = pct(S.sHits, S.sTrials);
    const solo = Math.round(avg(S.soloRT)), dual = Math.round(avg(S.dualRT));
    const cost = solo && dual ? dual - solo : 0;
    const score = clamp(Math.round(0.5 * pAcc + 0.5 * sAcc), 0, 100);
    onFinish({
      score, correct: S.pHits + S.sHits, total: S.pTrials + S.sTrials,
      metrics: [
        { label: 'Primary Accuracy', value: `${pAcc}%` },
        { label: 'Secondary Accuracy', value: `${sAcc}%` },
        { label: 'Dual-Task Cost', value: `${cost > 0 ? '+' : ''}${cost} ms` },
        { label: 'Total Misses', value: `${(S.pTrials - S.pHits) + (S.sTrials - S.sHits)}` },
      ],
    });
  }, [onFinish, S]);

  const runBeat = useCallback(() => {
    if (S.i >= cfg.beats) { finish(); return; }
    setProgress(S.i / cfg.beats);
    const withSec = Math.random() < cfg.secProb;
    S.topLive = true; S.botLive = withSec; S.topTapped = false; S.botTapped = false;
    S.onset = Date.now(); S.pTrials++; if (withSec) S.sTrials++;
    setTop(true); setBot(withSec);
    set(() => {
      setTop(false); setBot(false); S.topLive = false; S.botLive = false; S.i++;
      set(runBeat, 260);
    }, cfg.window);
  }, [cfg, finish, set, S]);

  useEffect(() => { const t = setTimeout(runBeat, 400); return () => clearTimeout(t); }, [runBeat]);

  function tapTop() {
    if (!S.topLive || S.topTapped) return;
    S.topTapped = true; S.pHits++;
    (S.botLive ? S.dualRT : S.soloRT).push(Date.now() - S.onset);
    setTop(false);
  }
  function tapBot() {
    if (!S.botLive || S.botTapped) return;
    S.botTapped = true; S.sHits++; setBot(false);
  }

  return (
    <View style={games.playArea}>
      <TaskHUD progress={progress} label="Watch both lanes" theme={theme} />
      <Pressable style={[games.dualLane, { borderColor: theme + '55' }]} onPress={tapTop}>
        <Text style={games.dualLabel}>PRIMARY</Text>
        <View style={[games.dualTarget, top && { backgroundColor: '#10B981', borderColor: '#059669' }]}>
          <Ionicons name="radio-button-on" size={scale(40)} color={top ? '#fff' : 'transparent'} />
        </View>
      </Pressable>
      <Pressable style={[games.dualLane, { borderColor: '#F59E0B55' }]} onPress={tapBot}>
        <Text style={games.dualLabel}>SECONDARY</Text>
        <View style={[games.dualTarget, bot && { backgroundColor: '#F59E0B', borderColor: '#D97706' }]}>
          <Ionicons name="notifications" size={scale(34)} color={bot ? '#fff' : 'transparent'} />
        </View>
      </Pressable>
    </View>
  );
}

// ── shared HUD ───────────────────────────────────────────
function TaskHUD({ progress, label, theme }) {
  return (
    <View style={games.hud}>
      <View style={games.hudTrack}>
        <View style={[games.hudFill, { width: `${clamp(progress * 100, 0, 100)}%`, backgroundColor: theme }]} />
      </View>
      <Text style={games.hudLabel}>{label}</Text>
    </View>
  );
}

const ENGINES = {
  vigilance: VigilanceGame, gonogo: GoNoGoGame, search: SearchGame,
  switch: SwitchGame, hold: HoldGame, stroop: StroopGame, dual: DualGame,
};

// ══════════════════════════════════════════════════════════
//  SCREEN WRAPPER · intro → countdown → play → result
// ══════════════════════════════════════════════════════════
export default function ActivityGameScreen({ navigation, route }) {
  const { activity, band = 'moderate', color = dark.neon, onComplete } = route.params || {};
  const [phase, setPhase] = useState('intro'); // intro | countdown | play | result
  const [count, setCount] = useState(3);
  const [result, setResult] = useState(null);
  const cfg = useRef(resolveConfig(activity?.engine, band)).current;
  const Engine = ENGINES[activity?.engine];

  useEffect(() => {
    if (phase !== 'countdown') return;
    setCount(3);
    let c = 3;
    const id = setInterval(() => { c -= 1; if (c <= 0) { clearInterval(id); setPhase('play'); } else setCount(c); }, 800);
    return () => clearInterval(id);
  }, [phase]);

  const bandLabel = band === 'easy' ? 'Easy (<40%)' : band === 'hard' ? 'Hard (>60%)' : 'Moderate (40–60%)';

  const handleFinish = useCallback((r) => { setResult(r); setPhase('result'); }, []);

  if (!activity || !Engine) {
    return (
      <SafeAreaView style={games.safe}><View style={games.center}><Text style={games.hint}>Activity unavailable.</Text>
        <TouchableOpacity style={[games.cta, { backgroundColor: color }]} onPress={() => navigation.goBack()}><Text style={games.ctaText}>Back</Text></TouchableOpacity>
      </View></SafeAreaView>
    );
  }

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <SafeAreaView style={games.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <View style={games.introHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={games.backBtn}>
            <Ionicons name="close" size={scale(22)} color={'#fff'} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={games.introBody} showsVerticalScrollIndicator={false}>
          <View style={[games.introIcon, { backgroundColor: color + '18' }]}>
            <Ionicons name="game-controller" size={scale(34)} color={color} />
          </View>
          <Text style={games.introKicker}>{activity.focus} · {activity.framework}</Text>
          <Text style={games.introTitle}>{activity.title}</Text>
          <Text style={games.introDesc}>{activity.desc}</Text>

          <View style={games.howBox}>
            <Text style={games.howLabel}>HOW TO PLAY</Text>
            <Text style={games.howText}>{ENGINE_HOWTO[activity.engine]}</Text>
          </View>

          <View style={[games.bandPill, { borderColor: color + '55', backgroundColor: color + '10' }]}>
            <Ionicons name="options-outline" size={scale(14)} color={color} />
            <Text style={[games.bandText, { color }]}>Difficulty: {bandLabel}</Text>
          </View>
        </ScrollView>
        <View style={games.introFooter}>
          <TouchableOpacity style={[games.cta, { backgroundColor: color }]} onPress={() => setPhase('countdown')} activeOpacity={0.85}>
            <Text style={games.ctaText}>Start Activity</Text>
            <Ionicons name="arrow-forward" size={scale(18)} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── COUNTDOWN ──
  if (phase === 'countdown') {
    return (
      <SafeAreaView style={[games.safe, games.center]}>
        <StatusBar barStyle="dark-content" />
        <Text style={games.introKicker}>Get ready…</Text>
        <Text style={[games.countNum, { color }]}>{count}</Text>
      </SafeAreaView>
    );
  }

  // ── RESULT ──
  if (phase === 'result') {
    return (
      <SafeAreaView style={games.safe} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={games.resultBody} showsVerticalScrollIndicator={false}>
          <View style={[games.scoreRing, { borderColor: color }]}>
            <Text style={[games.scoreNum, { color }]}>{result.score}</Text>
            <Text style={games.scoreOf}>/ 100</Text>
          </View>
          <Text style={games.resultTitle}>{activity.title}</Text>
          <Text style={games.resultSub}>Nice work — here’s how you performed.</Text>

          <View style={games.metricCard}>
            {result.metrics.map(m => (
              <View key={m.label} style={games.metricLine}>
                <Text style={games.metricLbl}>{m.label}</Text>
                <Text style={[games.metricVal, { color }]}>{m.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={[games.cta, { backgroundColor: color }]}
            onPress={() => { onComplete?.({ score: result.score, metrics: result.metrics }); navigation.goBack(); }} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={scale(18)} color="#fff" />
            <Text style={games.ctaText}>Save & Continue</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setResult(null); setPhase('countdown'); }} style={games.retryBtn}>
            <Ionicons name="refresh" size={scale(15)} color={dark.textSub} />
            <Text style={games.retryText}>Try again</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── PLAY ──
  return (
    <SafeAreaView style={games.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <Engine cfg={cfg} theme={color} onFinish={handleFinish} />
    </SafeAreaView>
  );
}

const games = StyleSheet.create({
  safe: { flex: 1, backgroundColor: dark.bgSolid },
  playArea: { flex: 1, paddingHorizontal: scale(20) },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: scale(14) },
  hint: { fontSize: rf(13), color: dark.textSub, fontWeight: '600', textAlign: 'center' },

  // HUD
  hud: { paddingTop: ms(12), paddingBottom: ms(6) },
  hudTrack: { height: 6, backgroundColor: dark.glassBorder, borderRadius: 3, overflow: 'hidden' },
  hudFill: { height: '100%', borderRadius: 3 },
  hudLabel: { fontSize: rf(11.5), color: dark.textSub, fontWeight: '700', marginTop: ms(6), textAlign: 'center', letterSpacing: 0.3 },

  // vigilance
  vigRing: { width: scale(180), height: scale(180), borderRadius: scale(90), borderWidth: 3, borderColor: dark.glassBorder, alignItems: 'center', justifyContent: 'center' },
  vigDot: { width: scale(40), height: scale(40), borderRadius: scale(20), backgroundColor: dark.glassBorder, alignItems: 'center', justifyContent: 'center' },

  // go/no-go
  gngOrb: { width: scale(150), height: scale(150), borderRadius: scale(75), borderWidth: 4, borderColor: dark.glassBorder, backgroundColor: dark.glass, alignItems: 'center', justifyContent: 'center' },

  // search
  searchPrompt: { alignItems: 'center', gap: scale(8), paddingVertical: ms(12), marginBottom: ms(6) },
  searchPromptText: { fontSize: rf(12.5), color: dark.textSub, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(12), alignSelf: 'center', justifyContent: 'center' },
  gridCell: { borderRadius: 16, backgroundColor: dark.glass, borderWidth: 1.5, borderColor: dark.glassBorder, alignItems: 'center', justifyContent: 'center' },
  gridCellWrong: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },

  // switch
  ruleBanner: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: scale(10), backgroundColor: dark.glass, borderWidth: 1.5, borderColor: dark.glassBorder, borderRadius: 14, paddingHorizontal: scale(18), paddingVertical: ms(10), marginTop: ms(6) },
  ruleText: { fontSize: rf(17), fontWeight: '900', letterSpacing: 0.5 },
  ruleSwitch: { fontSize: rf(10.5), fontWeight: '800', color: '#EF4444' },
  switchHint: { fontSize: rf(12.5), color: dark.textSub, fontWeight: '600' },
  lrRow: { flexDirection: 'row', gap: scale(14), paddingBottom: ms(10) },
  lrBtn: { flex: 1, backgroundColor: dark.glass, borderWidth: 2, borderColor: dark.glassBorder, borderRadius: 18, paddingVertical: ms(20), alignItems: 'center', gap: scale(4) },
  lrBtnBad: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
  lrText: { fontSize: rf(14), fontWeight: '800', color: '#fff' },

  // hold
  holdPad: { width: scale(180), height: scale(180), borderRadius: scale(28), borderWidth: 3, borderColor: dark.glassBorder, backgroundColor: dark.glass, alignItems: 'center', justifyContent: 'center', gap: scale(10) },
  holdPadShake: { borderColor: '#F59E0B', transform: [{ rotate: '1.5deg' }] },
  holdText: { fontSize: rf(13), fontWeight: '800', color: dark.textSub, letterSpacing: 0.5 },
  distractText: { fontSize: rf(13), fontWeight: '800', color: '#FCD34D' },

  // stroop
  stroopWord: { fontSize: rf(56), fontWeight: '900', letterSpacing: 1 },
  stroopBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(10), justifyContent: 'center', paddingBottom: ms(12) },
  stroopBtn: { minWidth: scale(120), borderRadius: 14, paddingVertical: ms(16), alignItems: 'center' },
  stroopBtnText: { fontSize: rf(15), fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  // dual
  dualLane: { flex: 1, margin: scale(6), borderRadius: 20, borderWidth: 2, backgroundColor: dark.glass, alignItems: 'center', justifyContent: 'center', gap: scale(12) },
  dualLabel: { fontSize: rf(11), fontWeight: '800', color: dark.textMute, letterSpacing: 1 },
  dualTarget: { width: scale(72), height: scale(72), borderRadius: scale(36), borderWidth: 3, borderColor: dark.glassBorder, alignItems: 'center', justifyContent: 'center' },

  // intro
  introHeader: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: scale(16), paddingTop: ms(8) },
  backBtn: { width: scale(38), height: scale(38), borderRadius: scale(12), backgroundColor: dark.glass, alignItems: 'center', justifyContent: 'center' },
  introBody: { paddingHorizontal: scale(24), paddingBottom: ms(20), alignItems: 'center' },
  introIcon: { width: scale(72), height: scale(72), borderRadius: scale(22), alignItems: 'center', justifyContent: 'center', marginBottom: ms(14) },
  introKicker: { fontSize: rf(11.5), fontWeight: '800', color: dark.textMute, letterSpacing: 0.6, textTransform: 'uppercase' },
  introTitle: { fontSize: rf(24), fontWeight: '900', color: '#1E1B33', textAlign: 'center', marginTop: ms(4) },
  introDesc: { fontSize: rf(13.5), color: dark.textSub, lineHeight: rf(21), textAlign: 'center', marginTop: ms(10) },
  howBox: { alignSelf: 'stretch', backgroundColor: dark.glass, borderRadius: 16, borderWidth: 1, borderColor: dark.glassBorder, padding: scale(16), marginTop: ms(18) },
  howLabel: { fontSize: rf(11), fontWeight: '800', color: dark.textMute, letterSpacing: 0.8, marginBottom: ms(6) },
  howText: { fontSize: rf(13.5), color: '#1E1B33', lineHeight: rf(21), fontWeight: '500' },
  bandPill: { flexDirection: 'row', alignItems: 'center', gap: scale(6), borderWidth: 1, borderRadius: 20, paddingHorizontal: scale(14), paddingVertical: ms(8), marginTop: ms(16) },
  bandText: { fontSize: rf(12.5), fontWeight: '800' },
  introFooter: { padding: scale(20) },

  // countdown
  countNum: { fontSize: rf(96), fontWeight: '900', marginTop: ms(10) },

  // result
  resultBody: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: scale(24) },
  scoreRing: { width: scale(150), height: scale(150), borderRadius: scale(75), borderWidth: 6, alignItems: 'center', justifyContent: 'center', marginBottom: ms(18) },
  scoreNum: { fontSize: rf(46), fontWeight: '900' },
  scoreOf: { fontSize: rf(13), color: dark.textSub, fontWeight: '700', marginTop: -ms(4) },
  resultTitle: { fontSize: rf(21), fontWeight: '900', color: '#1E1B33', textAlign: 'center' },
  resultSub: { fontSize: rf(13), color: dark.textSub, marginTop: ms(6), marginBottom: ms(20), textAlign: 'center' },
  metricCard: { alignSelf: 'stretch', backgroundColor: dark.glass, borderRadius: 16, borderWidth: 1, borderColor: dark.glassBorder, padding: scale(6), marginBottom: ms(22) },
  metricLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: ms(12), paddingHorizontal: scale(12), borderBottomWidth: 1, borderBottomColor: dark.bgSolid },
  metricLbl: { fontSize: rf(13), color: dark.textSub, fontWeight: '600', flex: 1 },
  metricVal: { fontSize: rf(14.5), fontWeight: '900' },

  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scale(8), borderRadius: 16, paddingVertical: ms(16), alignSelf: 'stretch' },
  ctaText: { fontSize: rf(15.5), fontWeight: '800', color: '#fff' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: scale(6), marginTop: ms(16), padding: scale(8) },
  retryText: { fontSize: rf(13.5), fontWeight: '700', color: dark.textSub },
});
