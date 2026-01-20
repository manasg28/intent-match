import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { UserProfile, UserPlace, UserPrompt, Intent } from '@/types/user';

const MIN_PLACES_REQUIRED = 3;
const MAX_PHOTOS = 3;
const MAX_PROMPTS = 3;

export const uploadPhoto = async (uid: string, file: File, order: number): Promise<string> => {
  const photoId = `${Date.now()}_${order}`;
  const storageRef = ref(storage, `photos/${uid}/${photoId}`);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  return url;
};

export const validatePlaces = (places: UserPlace[]): boolean => {
  return places.length >= MIN_PLACES_REQUIRED;
};

export const createProfile = async (
  uid: string,
  data: {
    name: string;
    age: number;
    gender: 'male' | 'female' | 'non-binary';
    intent: Intent;
    city: string;
    neighborhood?: string;
    places: UserPlace[];
    prompts: UserPrompt[];
    photoUrls: { id: string; url: string; order: number }[];
  }
): Promise<void> => {
  if (!validatePlaces(data.places)) {
    throw new Error(`Please add at least ${MIN_PLACES_REQUIRED} places`);
  }

  const profile: Omit<UserProfile, 'uid'> = {
    name: data.name,
    age: data.age,
    gender: data.gender,
    intent: data.intent,
    city: data.city,
    neighborhood: data.neighborhood,
    places: data.places,
    prompts: data.prompts.slice(0, MAX_PROMPTS),
    photos: data.photoUrls.slice(0, MAX_PHOTOS),
    profileComplete: true,
    replyRate: 1,
    ghostingCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'users', uid), profile);
};

export const updateProfile = async (
  uid: string,
  updates: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>
): Promise<void> => {
  await updateDoc(doc(db, 'users', uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const PROMPT_OPTIONS = [
  "A perfect Sunday looks like...",
  "I'm looking for someone who...",
  "My simple pleasures include...",
  "I feel most alive when...",
  "Something I'm proud of...",
  "I geek out about...",
];
