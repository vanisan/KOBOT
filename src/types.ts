export interface UserProfile {
  uid: string;
  telegramId?: string;
  codename: string;
  age: number;
  bio: string;
  interests: string[];
  avatarColor: string;
}

export interface MapUser extends UserProfile {
  lat?: number;
  lng?: number;
  isOnline?: boolean;
  updatedAt?: any; // Firestore Timestamp
  createdAt?: any;
}

export interface CityChatMessage {
  id: string;
  text: string;
  userId: string;
  codename: string;
  avatarColor: string;
  createdAt: any;
}
