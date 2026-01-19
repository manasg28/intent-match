import {
  collection,
  doc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message } from '@/types/user';

export const sendMessage = async (
  matchId: string,
  senderUid: string,
  text: string
): Promise<void> => {
  const messagesRef = collection(db, 'messages', matchId, 'messages');
  await addDoc(messagesRef, {
    senderUid,
    text,
    timestamp: Timestamp.now()
  });
};

export const subscribeToMessages = (
  matchId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const messagesRef = collection(db, 'messages', matchId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        messageId: doc.id,
        matchId,
        senderUid: data.senderUid,
        text: data.text,
        timestamp: data.timestamp?.toDate() || new Date()
      });
    });
    callback(messages);
  });
};

export const validateFirstMessage = (text: string): { valid: boolean; error?: string } => {
  const trimmedText = text.trim();

  if (trimmedText.length < 10) {
    return { valid: false, error: 'Message must be at least 10 characters' };
  }

  const emojiOnlyRegex = /^[\p{Emoji}\s]+$/u;
  if (emojiOnlyRegex.test(trimmedText)) {
    return { valid: false, error: 'Message cannot be only emojis' };
  }

  const lowerText = trimmedText.toLowerCase();
  if (lowerText === 'hi' || lowerText === 'hey' || lowerText === 'hello') {
    return { valid: false, error: 'Please write a more thoughtful first message' };
  }

  return { valid: true };
};
