import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NeuralBackground from './components/NeuralBackground';

export default function App() {
  const [user, setUser]       = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async fbUser => {
      if (!fbUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setUser(fbUser);
      const snap = await getDoc(doc(db, 'users', fbUser.uid));
      setIsAdmin(snap.exists() && snap.data().role === 'admin');
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <>
      <NeuralBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        {loading
          ? <FullScreenMsg>Loading...</FullScreenMsg>
          : !user
            ? <Login />
            : !isAdmin
              ? <FullScreenMsg>Access Denied — you are not an admin.</FullScreenMsg>
              : <Dashboard adminUser={user} />}
      </div>
    </>
  );
}

function FullScreenMsg({ children }) {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B4A5EE', fontSize: 16, textAlign: 'center', padding: 24 }}>
      {children}
    </div>
  );
}
