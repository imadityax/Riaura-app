import React from 'react';

// Static decoration data — module scope so re-renders anywhere in the app
// (typing in a form, table re-sorting, etc.) never re-randomize / restart
// the animation.
const NEURONS = [
  { top: 8,  left: 12, size: 5, color: '#4CC9F0', delay: 0,   duration: 7   },
  { top: 22, left: 82, size: 7, color: '#D946EF', delay: 1.2, duration: 9   },
  { top: 68, left: 6,  size: 4, color: '#2EF3FF', delay: 2.4, duration: 6   },
  { top: 85, left: 75, size: 6, color: '#6C4DFF', delay: 0.6, duration: 8   },
  { top: 15, left: 48, size: 4, color: '#2EF3FF', delay: 3,   duration: 10  },
  { top: 40, left: 90, size: 5, color: '#4CC9F0', delay: 1.8, duration: 7.5 },
  { top: 55, left: 20, size: 6, color: '#D946EF', delay: 0.3, duration: 9.5 },
  { top: 78, left: 40, size: 3, color: '#6C4DFF', delay: 2.1, duration: 6.5 },
  { top: 5,  left: 65, size: 5, color: '#2EF3FF', delay: 1.5, duration: 8.5 },
  { top: 92, left: 15, size: 4, color: '#4CC9F0', delay: 2.7, duration: 7   },
  { top: 30, left: 5,  size: 6, color: '#D946EF', delay: 0.9, duration: 9   },
  { top: 60, left: 95, size: 5, color: '#6C4DFF', delay: 3.3, duration: 6.8 },
  { top: 10, left: 30, size: 3, color: '#4CC9F0', delay: 1.1, duration: 11  },
  { top: 48, left: 58, size: 4, color: '#2EF3FF', delay: 2.9, duration: 8   },
];

const CONNECTIONS = [
  [0, 4], [4, 8], [1, 5], [5, 11], [2, 6], [6, 9],
  [3, 11], [7, 9], [10, 6], [12, 4], [13, 5], [9, 2],
];

const PARTICLES = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 71) % 100,
  size: 2 + (i % 3),
  delay: (i * 0.37) % 8,
  duration: 10 + (i % 6) * 2,
  color: ['#4CC9F0', '#2EF3FF', '#D946EF', '#6C4DFF'][i % 4],
}));

const WAVE_D_1 =
  'M0,60 C20,30 40,90 60,60 C80,20 100,100 120,50 C140,10 160,110 180,55 ' +
  'C200,25 220,95 240,60 C260,35 280,85 300,60 C320,15 340,105 360,50 ' +
  'C380,20 400,100 420,60 C440,40 460,80 480,60 C500,10 520,110 540,55 ' +
  'C560,30 580,90 600,60 C620,20 640,100 660,50 C680,30 700,90 720,60';

const WAVE_D_2 =
  'M0,60 C30,90 50,20 90,60 C110,90 150,20 180,60 C210,95 240,15 270,60 ' +
  'C300,90 330,25 360,60 C390,95 420,20 450,60 C480,90 510,20 540,60 ' +
  'C570,95 600,15 630,60 C660,90 690,25 720,60';

// Fixed, full-viewport decorative layer: floating neurons + synapse lines,
// glowing drifting particles, animated EEG-style brain waves, and pulsing
// gradient light blobs. Mount once at the app root so it persists (and
// keeps animating smoothly) across every screen/navigation.
export default function NeuralBackground() {
  return (
    <div className="neural-bg" aria-hidden="true">
      <div className="neural-blob blob-1" />
      <div className="neural-blob blob-2" />
      <div className="neural-blob blob-3" />

      <svg className="neural-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
        {CONNECTIONS.map(([a, b], i) => (
          <line
            key={i}
            x1={NEURONS[a].left} y1={NEURONS[a].top}
            x2={NEURONS[b].left} y2={NEURONS[b].top}
            style={{ animationDelay: `${(i * 0.4) % 5}s` }}
          />
        ))}
      </svg>

      {NEURONS.map((n, i) => (
        <span
          key={i}
          className="neural-neuron"
          style={{
            top: `${n.top}%`,
            left: `${n.left}%`,
            width: n.size,
            height: n.size,
            background: n.color,
            boxShadow: `0 0 ${n.size * 3}px ${n.size}px ${n.color}55, 0 0 ${n.size}px ${n.color}`,
            animationDelay: `${n.delay}s`,
            animationDuration: `${n.duration}s`,
          }}
        />
      ))}

      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="neural-particle"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      <div className="wave-layer" style={{ top: '18%' }}>
        <div className="wave-track" style={{ animationDuration: '22s' }}>
          <svg className="wave-svg" viewBox="0 0 720 120" preserveAspectRatio="none">
            <path d={WAVE_D_1} stroke="#4CC9F0" />
          </svg>
          <svg className="wave-svg" viewBox="0 0 720 120" preserveAspectRatio="none">
            <path d={WAVE_D_1} stroke="#4CC9F0" />
          </svg>
        </div>
      </div>

      <div className="wave-layer" style={{ top: '78%' }}>
        <div className="wave-track" style={{ animationDuration: '30s', animationDirection: 'reverse' }}>
          <svg className="wave-svg" viewBox="0 0 720 120" preserveAspectRatio="none">
            <path d={WAVE_D_2} stroke="#D946EF" />
          </svg>
          <svg className="wave-svg" viewBox="0 0 720 120" preserveAspectRatio="none">
            <path d={WAVE_D_2} stroke="#D946EF" />
          </svg>
        </div>
      </div>
    </div>
  );
}
