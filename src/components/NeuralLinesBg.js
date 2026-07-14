import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Circle } from 'react-native-svg';
import { Float } from './anim';

// ─────────────────────────────────────────────────────────────────────────────
// NeuralLinesBg — ambient white neuron web behind test/assessment screens.
// Two constellations (top-right and bottom-left) drift slowly while the user
// answers. Each connection is drawn twice — a wide lavender under-stroke with
// a crisp white line on top — so the white web stays visible on light pages
// and reads as softly embossed. Non-interactive; put it as the first child of
// the screen container so content scrolls above it.
// ─────────────────────────────────────────────────────────────────────────────

const NODES = [
  [168, 22], [128, 58], [186, 76], [92, 96], [150, 118], [40, 60],
  [200, 140], [104, 156], [58, 128], [176, 186], [124, 202],
];
const LINKS = [
  [0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [5, 8],
  [4, 6], [4, 7], [7, 8], [6, 9], [7, 10], [9, 10],
];

function Web({ size = 220, flip = false }) {
  return (
    <Svg
      width={size} height={size} viewBox="0 0 220 220"
      style={flip ? { transform: [{ rotate: '180deg' }] } : null}
    >
      {/* lavender under-strokes give the white web its visibility */}
      {LINKS.map(([a, b], i) => (
        <Line
          key={`u${i}`}
          x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}
          stroke="rgba(139,92,246,0.12)" strokeWidth="4"
        />
      ))}
      {LINKS.map(([a, b], i) => (
        <Line
          key={`w${i}`}
          x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]}
          stroke="rgba(255,255,255,0.95)" strokeWidth="1.4"
        />
      ))}
      {NODES.map(([x, y], i) => (
        <React.Fragment key={i}>
          <Circle cx={x} cy={y} r={i % 3 === 0 ? 7 : 5.5} fill="rgba(139,92,246,0.14)" />
          <Circle cx={x} cy={y} r={i % 3 === 0 ? 3 : 2.2} fill="#FFFFFF" />
        </React.Fragment>
      ))}
    </Svg>
  );
}

export default function NeuralLinesBg() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Float distance={10} duration={5600} style={styles.topRight}>
        <Web />
      </Float>
      <Float distance={12} duration={7000} style={styles.bottomLeft}>
        <Web flip />
      </Float>
    </View>
  );
}

const styles = StyleSheet.create({
  topRight:   { position: 'absolute', top: -26, right: -40, opacity: 0.9 },
  bottomLeft: { position: 'absolute', bottom: -30, left: -46, opacity: 0.75 },
});
