import React from 'react';
import Svg, { Path } from 'react-native-svg';

// A cleanly structured brain: two symmetric hemispheres with a central stem
// and cortical folds. Vector paths (scale crisply at any size), so it reads
// well from a 12px badge up to a 120px hero. Outline style matches the app's
// icon system and looks more premium than the stock font glyph.
export const BRAIN_PATHS = [
  'M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z',
  'M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z',
  'M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4',
  'M17.599 6.5a3 3 0 0 0 .399-1.375',
  'M6.003 5.125A3 3 0 0 0 6.401 6.5',
  'M3.477 10.896a4 4 0 0 1 .585-.396',
  'M19.938 10.5a4 4 0 0 1 .585.396',
  'M6 18a4 4 0 0 1-1.967-.516',
  'M19.967 17.484A4 4 0 0 1 18 18',
];

export default function BrainIcon({ size = 24, color = '#fff', strokeWidth = 1.8, style }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      {BRAIN_PATHS.map((d, i) => (
        <Path
          key={i}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
