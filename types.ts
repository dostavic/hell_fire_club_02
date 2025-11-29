export enum UserRole {
  REGULAR = 'REGULAR',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN'
}

export enum TargetCountry {
  GERMANY = 'Germany',
  AUSTRIA = 'Austria',
  CZECH_REPUBLIC = 'Czech Republic',
  SLOVAKIA = 'Slovakia',
  ROMANIA = 'Romania'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  country?: string;
  city?: string;
  interests: string[];
}

export interface RelocationStepItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface RelocationStep {
  id: string;
  title: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'done';
  priority: number;
  officialLinks?: string[];
  type?: 'checklist' | 'default';
  checklistItems?: RelocationStepItem[];
  suggestedQuestions?: string[];
}

export interface RelocationProfile {
  id: string;
  userId: string;
  citizenship: string;
  currentResidence: string; // Formerly fromCountry, simplified mapping
  toCountry: TargetCountry;
  destinationCity?: string;
  purpose: 'work' | 'study' | 'protection' | 'family' | 'other';
  isAlreadyInDestination: boolean;
  plan?: RelocationStep[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  country: string;
  city: string;
  category: 'cultural' | 'language_club' | 'support_group' | 'volunteering' | 'family' | 'other';
  date: string;
  location: string;
  languages: string[];
  attendeesCount: number;
  isRegistered?: boolean;
}

export interface Place {
  id: string;
  title: string;
  description: string;
  country: string;
  city: string;
  category: 'restaurant' | 'cafe' | 'park' | 'library' | 'faith' | 'other';
  address: string;
  priceLevel: 'low' | 'medium' | 'high' | 'free' | 'unknown';
  tags: string[];
  isFavorite?: boolean;
  website?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}