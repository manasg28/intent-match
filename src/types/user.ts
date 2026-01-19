export type Intent = 'casual' | 'serious' | 'marriage';

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
