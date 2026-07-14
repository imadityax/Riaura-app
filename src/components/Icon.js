import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BrainIcon from './BrainIcon';

// Drop-in for <MaterialCommunityIcons name={...} />: renders the premium
// custom brain for `brain`, and falls through to MaterialCommunityIcons for
// every other glyph. So any brain that appears through data (domains, facts,
// badges, courses) upgrades automatically and stays consistent.
export default function Icon({ name, size = 24, color, style }) {
  if (name === 'brain') {
    return <BrainIcon size={size} color={color} style={style} />;
  }
  return <MaterialCommunityIcons name={name} size={size} color={color} style={style} />;
}
