export type Intent = 'casual' | 'serious' | 'marriage';

export type PlaceType = 'cafe' | 'gym' | 'park' | 'library' | 'campus' | 'club' | 'other';

export interface UserPlace {
  id: string;
  name: string;
  type: PlaceType;
  addedAt: Date;
}

export interface UserPrompt {
  id: string;
  question: string;
  answer: string;
}

export interface UserPhoto {
  id: string;
  url: string;
  order: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  intent: Intent;
  city: string;
  neighborhood?: string;
  places: UserPlace[];
  prompts: UserPrompt[];
  photos: UserPhoto[];
  profileComplete: boolean;
  replyRate: number; // 0-1
  ghostingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  fromUid: string;
  toUid: string;
  targetType: 'prompt' | 'photo';
  targetId: string;
  comment?: string;
  timestamp: Date;
}

export interface DailyLikeCount {
  uid: string;
  date: string; // YYYY-MM-DD
  count: number;
}

export interface Match {
  matchId: string;
  userA: string;
  userB: string;
  matchedAt: Date;
  initiatingLike: {
    targetType: 'prompt' | 'photo';
    targetId: string;
    targetContent: string;
  };
}

export interface Message {
  messageId: string;
  matchId: string;
  senderUid: string;
  text: string;
  timestamp: Date;
}
