import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA0HO6wxfzV2oy0iAWVX759zfVetXwxMp8",
  authDomain: "intent-match-28.firebaseapp.com",
  projectId: "intent-match-28",
  storageBucket: "intent-match-28.firebasestorage.app",
  messagingSenderId: "140614625588",
  appId: "1:140614625588:web:02f5e129aa1385a624dd61"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
