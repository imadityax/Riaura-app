import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

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

  if (loading) return <FullScreenMsg>Loading...</FullScreenMsg>;
  if (!user)   return <Login />;
  if (!isAdmin) return <FullScreenMsg>Access Denied — you are not an admin.</FullScreenMsg>;

  return <Dashboard adminUser={user} />;
}

function FullScreenMsg({ children }) {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: 16 }}>
      {children}
    </div>
  );
}
