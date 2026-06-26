import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>🧠</div>
        <h1 style={s.title}>RiAura Admin</h1>
        <p style={s.sub}>Sign in with your admin account</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>Email</label>
          <input
            style={s.input}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@example.com"
            required
          />

          <label style={s.label}>Password</label>
          <input
            style={s.input}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {error && <p style={s.error}>{error}</p>}

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

const s = {
  page:  { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6FA' },
  card:  { background: '#fff', borderRadius: 20, padding: '40px 36px', width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' },
  logo:  { fontSize: 40, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: 800, textAlign: 'center', color: '#1A1A2E', marginBottom: 4 },
  sub:   { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 28 },
  form:  { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 12, fontWeight: 600, color: '#6B7280', marginTop: 8 },
  input: { padding: '11px 14px', borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none', color: '#1A1A2E' },
  error: { color: '#EF4444', fontSize: 13, margin: '4px 0' },
  btn:   { marginTop: 16, padding: '13px', borderRadius: 28, background: '#2B4EFF', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none' },
};
