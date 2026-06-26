import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace these values with your Firebase project config
const firebaseConfig = {
  apiKey: 'AIzaSyCYI9auAp3wnWyJMX2EQqgx0DEMyZ6PDx0',
  authDomain: 'riaura-rhims.firebaseapp.com',
  projectId: 'riaura-rhims',
  storageBucket: 'riaura-rhims.firebasestorage.app',
  messagingSenderId: '258011213465',
  appId: '1:258011213465:web:133b24d659dada07059208',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);
