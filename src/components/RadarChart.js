import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../theme/colors';

const SHORT_LABELS = ['Attn', 'Mem', 'Proc', 'Reas', 'Dec', 'Emot', 'Soc', 'Meta'];

export default function RadarChart({ scores, size = 280 }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;
  const n = 8;
  const levels = 4;

  function getPoint(i, r) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const r = (maxR / levels) * (l + 1);
    return Array.from({ length: n }, (_, i) => getPoint(i, r))
      .map(p => `${p.x},${p.y}`)
      .join(' ');
  });

  const dataPoints = scores.map((s, i) => {
    const r = (s / 100) * maxR;
    return getPoint(i, r);
  });
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {gridPolygons.map((pts, l) => (
          <Polygon key={l} points={pts} fill="none" stroke={colors.navyLight} strokeWidth={1} />
        ))}
        {Array.from({ length: n }, (_, i) => {
          const outer = getPoint(i, maxR);
          return <Line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke={colors.navyLight} strokeWidth={1} />;
        })}
        <Polygon points={dataPolygon} fill={colors.gold + '30'} stroke={colors.gold} strokeWidth={2} />
        {dataPoints.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={colors.gold} />
        ))}
        {Array.from({ length: n }, (_, i) => {
          const lp = getPoint(i, maxR + 22);
          return (
            <SvgText key={i} x={lp.x} y={lp.y} textAnchor="middle" alignmentBaseline="middle"
              fill={colors.textSub} fontSize={9} fontWeight="600">
              {SHORT_LABELS[i]}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
