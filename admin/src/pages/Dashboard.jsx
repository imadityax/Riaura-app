import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import UserDetail from './UserDetail';

export default function Dashboard({ adminUser }) {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snap => {
      const data = snap.docs.map(d => ({ uid: d.id, ...d.data() }));
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.profile?.fullName?.toLowerCase().includes(q) ||
      u.profile?.email?.toLowerCase().includes(q) ||
      u.profile?.city?.toLowerCase().includes(q)
    );
  });

  const completed = users.filter(u => u.scores).length;
  const avgScore  = users.length
    ? Math.round(users.filter(u => u.scores?.combined?.percent).reduce((a, u) => a + u.scores.combined.percent, 0) / (completed || 1))
    : 0;
  const highPerf  = users.filter(u => u.scores?.combined?.isHighPerformance).length;

  if (selected) return <UserDetail user={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.logo}>🧠</span>
          <div>
            <div style={s.brand}>RiAura RHIMS</div>
            <div style={s.brandSub}>Admin Dashboard</div>
          </div>
        </div>
        <div style={s.headerRight}>
          <span style={s.adminEmail}>{adminUser.email}</span>
          <button style={s.signOutBtn} onClick={() => signOut(auth)}>Sign Out</button>
        </div>
      </div>

      <div style={s.content} className="scroll-area">
        {/* Stats row */}
        <div style={s.statsRow}>
          <StatCard label="Total Users" value={users.length} icon="👥" color="#2B4EFF" />
          <StatCard label="Assessments Done" value={completed} icon="✅" color="#10B981" />
          <StatCard label="High Performance" value={highPerf} icon="🏆" color="#F59E0B" />
          <StatCard label="Avg Combined Score" value={`${avgScore}%`} icon="📊" color="#8B5CF6" />
        </div>

        {/* Users table */}
        <div style={s.tableCard}>
          <div style={s.tableHeader}>
            <h2 style={s.tableTitle}>All Users</h2>
            <input
              className="neural-input"
              style={s.search}
              placeholder="Search by name, email or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={s.center}>Loading users...</div>
          ) : filtered.length === 0 ? (
            <div style={s.center}>No users found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Age', 'Gender', 'City', 'Phase', 'Combined %', 'CIS', 'HII', 'Mindfulness'].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.uid} style={s.tr} onClick={() => setSelected(u)}>
                      <td style={s.td}><span style={s.nameCell}>{u.profile?.fullName || '—'}</span></td>
                      <td style={s.td}>{u.profile?.email || '—'}</td>
                      <td style={s.td}>{u.profile?.age || '—'}</td>
                      <td style={s.td}>{u.profile?.gender || '—'}</td>
                      <td style={s.td}>{u.profile?.city || '—'}</td>
                      <td style={s.td}><PhaseBadge phase={u.phase} /></td>
                      <td style={s.td}><ScorePill value={u.scores?.combined?.percent} /></td>
                      <td style={s.td}>{u.scores?.cis ?? '—'}</td>
                      <td style={s.td}>{u.scores?.hii ?? '—'}</td>
                      <td style={s.td}>{u.mindfulness?.score != null ? `${u.mindfulness.score}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div style={s.statCard}>
      <div style={{ ...s.statIcon, background: color + '2A' }}>{icon}</div>
      <div style={{ ...s.statValue, color }}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

function PhaseBadge({ phase }) {
  const labels = { 0: 'Registered', 1: 'Phase 1', 2: 'Phase 2', 3: 'Phase 3', 4: 'Complete' };
  const colors = { 0: '#6B7280', 1: '#3B82F6', 2: '#8B5CF6', 3: '#F59E0B', 4: '#10B981' };
  const p = phase ?? 0;
  return (
    <span style={{ ...s.badge, background: (colors[p] || '#6B7280') + '2A', color: colors[p] || '#6B7280' }}>
      {labels[p] || 'Unknown'}
    </span>
  );
}

function ScorePill({ value }) {
  if (value == null) return <span style={{ color: '#9CA3AF' }}>—</span>;
  const pct = Math.round(value);
  const color = pct >= 60 ? '#10B981' : '#F59E0B';
  return <span style={{ ...s.badge, background: color + '2A', color }}>{pct}%</span>;
}

const s = {
  page:       { height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header:     {
    flexShrink: 0, flexWrap: 'wrap', gap: 12, padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  logo:       { fontSize: 28, filter: 'drop-shadow(0 0 10px rgba(76,201,240,0.5))' },
  brand:      { fontWeight: 800, fontSize: 16, color: '#F1EDFF' },
  brandSub:   { fontSize: 11, color: '#B4A5EE', fontWeight: 600, letterSpacing: 0.5 },
  headerRight:{ display: 'flex', alignItems: 'center', gap: 14 },
  adminEmail: { fontSize: 13, color: '#B4A5EE' },
  signOutBtn: { padding: '7px 16px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', color: '#FF8A8A', border: '1px solid rgba(239,68,68,0.3)', fontWeight: 700, fontSize: 13 },

  content:    { flex: 1, minHeight: 0, padding: '24px 28px' },
  statsRow:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 },
  statCard:   {
    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '20px 18px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  },
  statIcon:   { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 12 },
  statValue:  { fontSize: 26, fontWeight: 900, marginBottom: 4 },
  statLabel:  { fontSize: 12, color: '#B4A5EE', fontWeight: 600 },

  tableCard:    {
    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  },
  tableHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  tableTitle:   { fontSize: 16, fontWeight: 800, color: '#F1EDFF' },
  search:       { padding: '9px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', fontSize: 13, width: 280, maxWidth: '100%', flex: '1 1 220px', outline: 'none', color: '#F1EDFF', background: 'rgba(255,255,255,0.06)' },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#B4A5EE', letterSpacing: 0.5, background: 'rgba(255,255,255,0.03)', whiteSpace: 'nowrap' },
  tr:           { borderTop: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'background 0.15s' },
  td:           { padding: '12px 14px', fontSize: 13, color: '#D9D4F0', whiteSpace: 'nowrap' },
  nameCell:     { fontWeight: 700, color: '#F1EDFF' },
  badge:        { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  center:       { padding: 40, textAlign: 'center', color: '#B4A5EE' },
};
