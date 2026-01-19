import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, Like, DailyLikeCount, Intent, Match } from '@/types/user';
import { checkForMatch } from './matchingService';

const DAILY_LIKE_LIMIT = 5;

export const getTodayDateString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const getDailyLikeCount = async (uid: string): Promise<number> => {
  const today = getTodayDateString();
  const docRef = doc(db, 'dailyLikes', `${uid}_${today}`);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return (docSnap.data() as DailyLikeCount).count;
  }
  return 0;
};

export const canSendLike = async (uid: string): Promise<boolean> => {
  const count = await getDailyLikeCount(uid);
  return count < DAILY_LIKE_LIMIT;
};

export const getRemainingLikes = async (uid: string): Promise<number> => {
  const count = await getDailyLikeCount(uid);
  return Math.max(0, DAILY_LIKE_LIMIT - count);
};

export const incrementDailyLikeCount = async (uid: string): Promise<void> => {
  const today = getTodayDateString();
  const docRef = doc(db, 'dailyLikes', `${uid}_${today}`);
  const currentCount = await getDailyLikeCount(uid);
  
  await setDoc(docRef, {
    uid,
    date: today,
    count: currentCount + 1
  });
};

export const sendLike = async (like: Omit<Like, 'timestamp'>): Promise<{ success: boolean; match?: Match }> => {
  const canLike = await canSendLike(like.fromUid);
  if (!canLike) {
    return { success: false };
  }

  const likeId = `${like.fromUid}_${like.toUid}`;
  const likeRef = doc(db, 'likes', likeId);

  const likeWithTimestamp = {
    ...like,
    timestamp: new Date()
  };

  await setDoc(likeRef, likeWithTimestamp);

  await incrementDailyLikeCount(like.fromUid);

  const match = await checkForMatch(likeWithTimestamp as Like);

  return { success: true, match: match || undefined };
};

export const hasLikedUser = async (fromUid: string, toUid: string): Promise<boolean> => {
  const likeId = `${fromUid}_${toUid}`;
  const likeRef = doc(db, 'likes', likeId);
  const docSnap = await getDoc(likeRef);
  return docSnap.exists();
};

export const hasBlockedUser = async (uid: string, targetUid: string): Promise<boolean> => {
  const blockId = `${uid}_${targetUid}`;
  const blockRef = doc(db, 'blocks', blockId);
  const docSnap = await getDoc(blockRef);
  return docSnap.exists();
};

export const isMatchedWith = async (uid: string, targetUid: string): Promise<boolean> => {
  // Check both directions for match
  const matchId1 = `${uid}_${targetUid}`;
  const matchId2 = `${targetUid}_${uid}`;
  
  const [match1, match2] = await Promise.all([
    getDoc(doc(db, 'matches', matchId1)),
    getDoc(doc(db, 'matches', matchId2))
  ]);
  
  return match1.exists() || match2.exists();
};

export const getExcludedUserIds = async (uid: string): Promise<Set<string>> => {
  const excluded = new Set<string>();
  excluded.add(uid); // Exclude self

  // Get users already liked
  const likesQuery = query(
    collection(db, 'likes'),
    where('fromUid', '==', uid)
  );
  const likesSnap = await getDocs(likesQuery);
  likesSnap.forEach(doc => {
    const like = doc.data() as Like;
    excluded.add(like.toUid);
  });

  // Get blocked users (both directions)
  const blockedByMeQuery = query(
    collection(db, 'blocks'),
    where('blockerUid', '==', uid)
  );
  const blockedMeQuery = query(
    collection(db, 'blocks'),
    where('blockedUid', '==', uid)
  );
  
  const [blockedByMe, blockedMe] = await Promise.all([
    getDocs(blockedByMeQuery),
    getDocs(blockedMeQuery)
  ]);
  
  blockedByMe.forEach(doc => {
    excluded.add(doc.data().blockedUid);
  });
  blockedMe.forEach(doc => {
    excluded.add(doc.data().blockerUid);
  });

  // Get matched users
  const matchesQuery1 = query(
    collection(db, 'matches'),
    where('userA', '==', uid)
  );
  const matchesQuery2 = query(
    collection(db, 'matches'),
    where('userB', '==', uid)
  );

  const [matches1, matches2] = await Promise.all([
    getDocs(matchesQuery1),
    getDocs(matchesQuery2)
  ]);

  matches1.forEach(doc => {
    excluded.add(doc.data().userB);
  });
  matches2.forEach(doc => {
    excluded.add(doc.data().userA);
  });

  return excluded;
};

export const getDiscoveryProfiles = async (
  currentUserUid: string,
  userIntent: Intent
): Promise<UserProfile[]> => {
  const excluded = await getExcludedUserIds(currentUserUid);

  // Query users with same intent, prioritize by profileComplete, replyRate, ghostingCount
  const usersQuery = query(
    collection(db, 'users'),
    where('intent', '==', userIntent),
    where('profileComplete', '==', true),
    orderBy('replyRate', 'desc'),
    orderBy('ghostingCount', 'asc'),
    limit(20)
  );

  const usersSnap = await getDocs(usersQuery);
  const profiles: UserProfile[] = [];

  usersSnap.forEach(doc => {
    const profile = { uid: doc.id, ...doc.data() } as UserProfile;
    if (!excluded.has(profile.uid)) {
      profiles.push(profile);
    }
  });

  return profiles;
};

export const getCurrentUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { uid: userSnap.id, ...userSnap.data() } as UserProfile;
  }
  return null;
};
