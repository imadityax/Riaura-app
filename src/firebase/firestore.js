import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export async function saveUserProfile(uid, profile) {
  await setDoc(doc(db, 'users', uid), {
    profile,
    phase: 1,
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export async function getUserData(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserPhase(uid, phase) {
  await updateDoc(doc(db, 'users', uid), { phase });
}

export async function savePhase2DataToCloud(uid, answers, domainIndex) {
  await updateDoc(doc(db, 'users', uid), {
    phase2Answers: { answers, domainIndex },
    phase: 2,
  });
}

export async function savePhase3DataToCloud(uid, scores, taskIndex) {
  await updateDoc(doc(db, 'users', uid), {
    phase3Scores: { scores, taskIndex },
    phase: 3,
  });
}

export async function saveScoresToCloud(uid, scores) {
  await updateDoc(doc(db, 'users', uid), { scores });
}

export async function saveMindfulnessToCloud(uid, score) {
  await updateDoc(doc(db, 'users', uid), {
    mindfulness: { score, done: true },
  });
}
