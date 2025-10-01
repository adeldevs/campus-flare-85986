export type UserRole = 'user' | 'lowLevelAdmin' | 'ultimateAdmin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export type EventCategory = 'seminar' | 'fest' | 'workshop' | 'competition' | 'cultural' | 'sports' | 'other';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  bannerURL: string;
  category: EventCategory;
  createdBy: string;
  createdByName: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
  registrations?: string[];
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: Date;
  reminderSet: boolean;
}
