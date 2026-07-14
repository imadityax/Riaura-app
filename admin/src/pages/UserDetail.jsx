import React from 'react';

export default function UserDetail({ user, onBack }) {
  const p = user.profile || {};
  const scores = user.scores || {};
  const combined = scores.combined || {};
  const isHigh = combined.isHighPerformance;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Back to Dashboard</button>
        <div style={s.headerRight}>
          {isHigh !== undefined && (
            <span style={{ ...s.badge, background: isHigh ? '#D1FAE5' : '#FEF3C7', color: isHigh ? '#065F46' : '#92400E' }}>
              {isHigh ? '🏆 High Performance' : '📈 Development Pathway'}
            </span>
          )}
        </div>
      </div>

      <div style={s.content} className="scroll-area">
        {/* Profile card */}
        <div style={s.card}>
          <div style={s.avatar}>{p.fullName?.[0]?.toUpperCase() || '?'}</div>
          <div>
            <h2 style={s.name}>{p.fullName || '—'}</h2>
            <p style={s.email}>{p.email || '—'}</p>
          </div>
          <PhaseBadge phase={user.phase} />
        </div>

        <div style={s.grid}>
          {/* Personal info */}
          <Section title="Personal Info">
            <Row label="Age"        value={p.age} />
            <Row label="Gender"     value={p.gender} />
            <Row label="Mobile"     value={p.mobile} />
            <Row label="Education"  value={p.education} />
            <Row label="Occupation" value={p.occupation} />
            <Row label="City"       value={p.city} />
            <Row label="State"      value={p.state} />
            <Row label="Country"    value={p.country} />
          </Section>

          {/* Scores */}
          <Section title="Assessment Scores">
            <ScoreBar label="Combined Score" value={combined.percent} color={isHigh ? '#10B981' : '#F59E0B'} />
            <ScoreBar label="Phase 2 (WHO)" value={scores.phase2?.percent} color="#8B5CF6" />
            <ScoreBar label="Phase 3 (Cognitive)" value={scores.phase3?.percent} color="#3B82F6" />
            <div style={s.scoreGrid}>
              <ScoreStat label="CIS" value={scores.cis} />
              <ScoreStat label="GPS" value={scores.gps} />
              <ScoreStat label="HII" value={scores.hii} />
              <ScoreStat label="P2 Marks" value={scores.phase2?.marks != null ? `${scores.phase2.marks}/40` : null} />
              <ScoreStat label="P3 Marks" value={scores.phase3?.marks != null ? `${scores.phase3.marks}/40` : null} />
              <ScoreStat label="Mindfulness" value={user.mindfulness?.score != null ? `${user.mindfulness.score}%` : null} />
            </div>
          </Section>

          {/* Domain breakdown */}
          {scores.domainPercents && (
            <Section title="Domain Breakdown (Phase 2)">
              {DOMAINS.map((d, i) => (
                <ScoreBar key={d} label={d} value={scores.domainPercents[i]} color="#8B5CF6" small />
              ))}
            </Section>
          )}

          {/* Lab readiness */}
          {scores.labReadiness && (
            <Section title="Lab Readiness Scores">
              {Object.entries(scores.labReadiness).map(([key, val]) => (
                <Row key={key} label={key} value={`${val}%`} />
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

const DOMAINS = [
  'Analytical Intelligence', 'Emotional Intelligence', 'Creative Intelligence',
  'Social Intelligence', 'Practical Intelligence', 'Spiritual Intelligence',
  'Digital Intelligence', 'Metacognitive Intelligence',
];

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <h3 style={s.sectionTitle}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={s.row}>
      <span style={s.rowLabel}>{label}</span>
      <span style={s.rowValue}>{value ?? '—'}</span>
    </div>
  );
}

function ScoreBar({ label, value, color, small }) {
  const pct = value != null ? Math.round(value) : null;
  return (
    <div style={{ marginBottom: small ? 8 : 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: small ? 12 : 13, color: '#374151', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: small ? 12 : 13, fontWeight: 700, color: pct != null ? color : '#9CA3AF' }}>
          {pct != null ? `${pct}%` : '—'}
        </span>
      </div>
      <div style={s.barTrack}>
        <div style={{ ...s.barFill, width: pct != null ? `${pct}%` : '0%', background: color }} />
      </div>
    </div>
  );
}

function ScoreStat({ label, value }) {
  return (
    <div style={s.scoreStat}>
      <div style={s.scoreStatVal}>{value ?? '—'}</div>
      <div style={s.scoreStatLbl}>{label}</div>
    </div>
  );
}

function PhaseBadge({ phase }) {
  const labels = { 0: 'Registered', 1: 'Phase 1', 2: 'Phase 2', 3: 'Phase 3', 4: 'Complete' };
  const colors = { 0: '#6B7280', 1: '#3B82F6', 2: '#8B5CF6', 3: '#F59E0B', 4: '#10B981' };
  const p = phase ?? 0;
  return (
    <span style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: (colors[p] || '#6B7280') + '18', color: colors[p] || '#6B7280', marginLeft: 'auto' }}>
      {labels[p] || 'Unknown'}
    </span>
  );
}

const s = {
  page:       { height: '100vh', display: 'flex', flexDirection: 'column', background: '#F4F6FA', overflow: 'hidden' },
  header:     { flexShrink: 0, flexWrap: 'wrap', gap: 12, background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  backBtn:    { background: 'none', border: 'none', color: '#2B4EFF', fontWeight: 700, fontSize: 14 },
  headerRight:{ display: 'flex', alignItems: 'center', gap: 12 },
  badge:      { padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700 },

  content:    { flex: 1, minHeight: 0, padding: '24px 28px' },
  card:       { background: '#fff', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  avatar:     { width: 52, height: 52, borderRadius: 14, background: '#2B4EFF', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 900, flexShrink: 0 },
  name:       { fontSize: 20, fontWeight: 800, color: '#1A1A2E', marginBottom: 2 },
  email:      { fontSize: 13, color: '#6B7280' },

  grid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 },
  section:    { background: '#fff', borderRadius: 16, padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 13, fontWeight: 800, color: '#1A1A2E', marginBottom: 14, letterSpacing: 0.3 },

  row:        { display: 'flex', justifyContent: 'space-between', paddingBottom: 10, borderBottom: '1px solid #F3F4F6', marginBottom: 10 },
  rowLabel:   { fontSize: 12, color: '#6B7280', fontWeight: 600 },
  rowValue:   { fontSize: 13, color: '#1A1A2E', fontWeight: 600 },

  barTrack:   { height: 6, background: '#F3F4F6', borderRadius: 3, overflow: 'hidden' },
  barFill:    { height: '100%', borderRadius: 3, transition: 'width 0.4s ease' },

  scoreGrid:  { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 },
  scoreStat:  { background: '#F9FAFB', borderRadius: 10, padding: '10px 12px', textAlign: 'center' },
  scoreStatVal: { fontSize: 18, fontWeight: 900, color: '#1A1A2E', marginBottom: 2 },
  scoreStatLbl: { fontSize: 10, color: '#6B7280', fontWeight: 700, letterSpacing: 0.5 },
};
