import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';

export default function CircularProgress({ percent, size = 100, strokeWidth = 8, color = colors.gold, label, sublabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#ECE8F5" strokeWidth={strokeWidth} fill="none"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90" originX={size / 2} originY={size / 2}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.percent, { fontSize: size * 0.22 }]}>{Math.round(percent)}%</Text>
        {label ? <Text style={[styles.label, { fontSize: size * 0.1 }]}>{label}</Text> : null}
      </View>
      {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  percent: { color: '#1E1B33', fontWeight: '800' },
  label: { color: '#6E6A80', fontWeight: '600' },
  sublabel: { color: '#A8A5B5', fontSize: 10, marginTop: 4 },
});
