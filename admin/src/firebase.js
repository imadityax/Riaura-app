import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCYI9auAp3wnWyJMX2EQqgx0DEMyZ6PDx0',
  authDomain: 'riaura-rhims.firebaseapp.com',
  projectId: 'riaura-rhims',
  storageBucket: 'riaura-rhims.firebasestorage.app',
  messagingSenderId: '258011213465',
  appId: '1:258011213465:web:133b24d659dada07059208',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
