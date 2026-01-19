import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Match, Like, UserProfile } from '@/types/user';

export const checkForMatch = async (like: Like): Promise<Match | null> => {
  const reciprocalLikeId = `${like.toUid}_${like.fromUid}`;
  const reciprocalLikeRef = doc(db, 'likes', reciprocalLikeId);
  const reciprocalLikeSnap = await getDoc(reciprocalLikeRef);

  if (!reciprocalLikeSnap.exists()) {
    return null;
  }

  const reciprocalLike = reciprocalLikeSnap.data() as Like;

  const matchId = [like.fromUid, like.toUid].sort().join('_');

  const targetProfile = await getDoc(doc(db, 'users', like.toUid));
  const targetData = targetProfile.data() as UserProfile;

  let targetContent = '';
  if (like.targetType === 'prompt') {
    const prompt = targetData.prompts.find(p => p.id === like.targetId);
    targetContent = prompt ? `${prompt.question}\n${prompt.answer}` : '';
  } else {
    targetContent = 'Photo';
  }

  const match: Match = {
    matchId,
    userA: like.fromUid,
    userB: like.toUid,
    matchedAt: new Date(),
    initiatingLike: {
      targetType: like.targetType,
      targetId: like.targetId,
      targetContent
    }
  };

  await setDoc(doc(db, 'matches', matchId), match);

  await deleteDoc(doc(db, 'likes', `${like.fromUid}_${like.toUid}`));
  await deleteDoc(doc(db, 'likes', reciprocalLikeId));

  return match;
};

export const getUserMatches = async (uid: string): Promise<Match[]> => {
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

  const matches: Match[] = [];
  matches1.forEach(doc => {
    const data = doc.data();
    matches.push({
      ...data,
      matchedAt: data.matchedAt?.toDate() || new Date()
    } as Match);
  });
  matches2.forEach(doc => {
    const data = doc.data();
    matches.push({
      ...data,
      matchedAt: data.matchedAt?.toDate() || new Date()
    } as Match);
  });

  return matches.sort((a, b) => b.matchedAt.getTime() - a.matchedAt.getTime());
};

export const getMatchById = async (matchId: string): Promise<Match | null> => {
  const matchRef = doc(db, 'matches', matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) {
    return null;
  }

  const data = matchSnap.data();
  return {
    ...data,
    matchedAt: data.matchedAt?.toDate() || new Date()
  } as Match;
};

export const isMatched = async (uid1: string, uid2: string): Promise<boolean> => {
  const matchId = [uid1, uid2].sort().join('_');
  const matchRef = doc(db, 'matches', matchId);
  const matchSnap = await getDoc(matchRef);
  return matchSnap.exists();
};
