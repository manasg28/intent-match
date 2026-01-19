import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const readEnv = (key: string) => {
  const raw = (import.meta.env as any)[key] as string | undefined;
  if (!raw) return undefined;
  // Secrets sometimes get pasted with quotes/newlines; normalize.
  return raw.trim().replace(/^"|"$/g, "").replace(/^'|'$/g, "");
};

const firebaseConfig = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
};

// Fail fast with a clear message (instead of Firebase's generic invalid-api-key)
if (!firebaseConfig.apiKey || !firebaseConfig.apiKey.startsWith('AIza')) {
  throw new Error(
    'Firebase config missing/invalid: VITE_FIREBASE_API_KEY. Re-check the key in Firebase Console → Project settings → Your apps.'
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
