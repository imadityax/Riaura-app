import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase';

export default function Login() {
  const [mode, setMode]         = useState('signin'); // 'signin' | 'signup'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const isSignup = mode === 'signup';

  function switchMode(next) {
    setMode(next);
    setError('');
    setPassword('');
    setConfirm('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (isSignup) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirm) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignup) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) {
          await updateProfile(cred.user, { displayName: name.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err) {
      setError(mapAuthError(err?.code, isSignup));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page} className="scroll-area">
      <div style={s.card} className="neural-card">
        <div style={s.logo}>🧠</div>
        <h1 style={s.title}>RiAura Admin</h1>
        <p style={s.sub}>
          {isSignup ? 'Create an admin account' : 'Sign in to your admin account'}
        </p>

        <div style={s.tabs}>
          <button
            type="button"
            onClick={() => switchMode('signin')}
            style={{ ...s.tab, ...(!isSignup ? s.tabActive : {}) }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            style={{ ...s.tab, ...(isSignup ? s.tabActive : {}) }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {isSignup && (
            <div style={s.field}>
              <label style={s.label} htmlFor="name">Full name</label>
              <input
                id="name"
                className="auth-input neural-input"
                style={s.input}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="your name"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div style={s.field}>
            <label style={s.label} htmlFor="email">Email</label>
            <input
              id="email"
              className="auth-input neural-input"
              style={s.input}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="yourmail@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div style={s.field}>
            <label style={s.label} htmlFor="password">Password</label>
            <div style={s.pwWrap}>
              <input
                id="password"
                className="auth-input neural-input"
                style={{ ...s.input, paddingRight: 64 }}
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={s.pwToggle}
                tabIndex={-1}
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {isSignup && (
            <div style={s.field}>
              <label style={s.label} htmlFor="confirm">Confirm password</label>
              <input
                id="confirm"
                className="auth-input neural-input"
                style={s.input}
                type={showPw ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {error && <p style={s.error}>{error}</p>}

          <button style={s.btn} type="submit" disabled={loading}>
            {loading
              ? (isSignup ? 'Creating account...' : 'Signing in...')
              : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <p style={s.footer}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => switchMode(isSignup ? 'signin' : 'signup')}
            style={s.link}
          >
            {isSignup ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}

function mapAuthError(code, isSignup) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak (use at least 6 characters).';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return isSignup
        ? 'Could not create account. Please try again.'
        : 'Could not sign in. Please try again.';
  }
}

const s = {
  page:  {
    minHeight: '100vh', display: 'flex', padding: 24,
  },
  card:  {
    margin: 'auto', position: 'relative', zIndex: 1,
    background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: 20, padding: '40px 36px', width: 400, maxWidth: '100%',
    boxShadow: '0 8px 40px rgba(0,0,0,0.45), 0 0 60px rgba(108,77,255,0.15)',
  },
  logo:  { fontSize: 40, textAlign: 'center', marginBottom: 12, filter: 'drop-shadow(0 0 14px rgba(76,201,240,0.6))' },
  title: { fontSize: 24, fontWeight: 800, textAlign: 'center', color: '#F1EDFF', marginBottom: 4 },
  sub:   { fontSize: 13, color: '#B4A5EE', textAlign: 'center', marginBottom: 24 },

  tabs:  { display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, marginBottom: 24 },
  tab:   { flex: 1, padding: '10px 0', borderRadius: 9, border: 'none', background: 'transparent', color: '#B4A5EE', fontWeight: 600, fontSize: 14, transition: 'all .15s ease' },
  tabActive: { background: 'rgba(255,255,255,0.14)', color: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' },

  form:  { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#B4A5EE' },
  input: { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.14)', fontSize: 14, outline: 'none', color: '#F1EDFF', background: 'rgba(255,255,255,0.06)', transition: 'border-color .15s ease, box-shadow .15s ease' },

  pwWrap:   { position: 'relative', display: 'flex', alignItems: 'center' },
  pwToggle: { position: 'absolute', right: 12, background: 'none', border: 'none', color: '#2EF3FF', fontSize: 12, fontWeight: 600, padding: 4 },

  error: { color: '#FF8A8A', fontSize: 13, margin: 0 },
  btn:   {
    marginTop: 4, padding: '13px', borderRadius: 28, color: '#fff', fontWeight: 700, fontSize: 15, border: 'none',
    background: 'linear-gradient(135deg, #6C4DFF, #4CC9F0)',
    boxShadow: '0 4px 20px rgba(108,77,255,0.5)',
  },

  footer: { textAlign: 'center', fontSize: 13, color: '#B4A5EE', marginTop: 24 },
  link:   { background: 'none', border: 'none', color: '#2EF3FF', fontWeight: 700, fontSize: 13, padding: 0 },
};
