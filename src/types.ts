export interface UserProfile {
  uid: string;
  telegramId?: string;
  codename: string;
  age: number;
  bio: string;
  interests: string[];
  avatarColor: string;
  createdAt?: any;
  receivedLikes?: number;
  availableLikesToGive?: number;
  lastLikeClaimAt?: string;
  lastNameChangeAt?: string;
  avatarUrl?: string;
  referralsCount?: number;
  isLocationVisible?: boolean;
}

export interface MapUser extends UserProfile {
  lat?: number;
  lng?: number;
  isOnline?: boolean;
  updatedAt?: any; // Firestore Timestamp
}

export interface CityChatMessage {
  id: string;
  text: string;
  userId: string;
  codename: string;
  avatarColor: string;
  createdAt: any;
}
