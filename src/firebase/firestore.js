import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, fbStorage } from './config';

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

export async function saveMindfulnessDomainsToCloud(uid, domainScores) {
  await setDoc(doc(db, 'users', uid), { mindfulnessDomains: domainScores }, { merge: true });
}

export async function saveRiauraDomainsToCloud(uid, domainScores) {
  await setDoc(doc(db, 'users', uid), { riauraDomains: domainScores }, { merge: true });
}

export async function savePhase4ToCloud(uid, marks) {
  await setDoc(doc(db, 'users', uid), { phase4Marks: marks, phase: 4 }, { merge: true });
}

export async function updateUserProfileFields(uid, profile) {
  await setDoc(doc(db, 'users', uid), { profile }, { merge: true });
}

// ── Profile photo (Firebase Storage + Firestore URL) ──
// Uploads the base64 data URI to Storage at profilePhotos/<uid>.jpg and saves
// the resulting download URL on the user doc, so it syncs across devices.
export async function uploadProfilePhoto(uid, dataUri) {
  const r = ref(fbStorage, `profilePhotos/${uid}.jpg`);
  await uploadString(r, dataUri, 'data_url');
  const url = await getDownloadURL(r);
  await setDoc(doc(db, 'users', uid), { photoUrl: url }, { merge: true });
  return url;
}

export async function removeProfilePhotoFromCloud(uid) {
  await setDoc(doc(db, 'users', uid), { photoUrl: null }, { merge: true });
  try {
    await deleteObject(ref(fbStorage, `profilePhotos/${uid}.jpg`));
  } catch (_) { /* already gone — ignore */ }
}

export async function saveGoalsToCloud(uid, goals) {
  await setDoc(doc(db, 'users', uid), { devGoals: goals }, { merge: true });
}

export async function saveReflectionsToCloud(uid, reflections) {
  await setDoc(doc(db, 'users', uid), { reflections }, { merge: true });
}
