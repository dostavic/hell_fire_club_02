import { User, Event, Place, RelocationProfile, UserRole, TargetCountry, RelocationStep } from '../types';

// Seed Data
const SEED_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Berlin Newcomers Meetup',
    description: 'A casual evening for people who just moved to Berlin. Share stories and make friends.',
    country: 'Germany',
    city: 'Berlin',
    category: 'support_group',
    date: '2024-06-15T18:00:00',
    location: 'Community Center Mitte',
    languages: ['English', 'German'],
    attendeesCount: 24,
  },
  {
    id: '2',
    title: 'Deutsch Café - Practice German',
    description: 'Practice your German skills in a relaxed atmosphere with native speakers.',
    country: 'Germany',
    city: 'Munich',
    category: 'language_club',
    date: '2024-06-18T17:00:00',
    location: 'Café Glockenspiel',
    languages: ['German'],
    attendeesCount: 12,
  },
  {
    id: '3',
    title: 'Ukrainian Cultural Evening',
    description: 'Traditional music, food, and art exhibition supporting Ukrainian artists.',
    country: 'Czech Republic',
    city: 'Prague',
    category: 'cultural',
    date: '2024-06-20T19:00:00',
    location: 'National House of Vinohrady',
    languages: ['Ukrainian', 'Czech', 'English'],
    attendeesCount: 150,
  }
];

const SEED_PLACES: Place[] = [
  {
    id: '1',
    title: 'Municipal Library of Prague',
    description: 'Central library with a large collection of foreign language books and free WiFi.',
    country: 'Czech Republic',
    city: 'Prague',
    category: 'library',
    address: 'Mariánské nám. 1, 110 00 Josefov',
    priceLevel: 'free',
    tags: ['quiet', 'study', 'wifi'],
  },
  {
    id: '2',
    title: 'Café Kyiv',
    description: 'Authentic Ukrainian cuisine and coffee. A hub for the local community.',
    country: 'Germany',
    city: 'Berlin',
    category: 'cafe',
    address: 'Torstraße 123, 10119 Berlin',
    priceLevel: 'medium',
    tags: ['coffee', 'ukrainian', 'food'],
  }
];

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDb {
  private get<T>(key: string, defaultVal: T): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  }

  private set(key: string, val: any) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  async login(email: string): Promise<User> {
    await delay(500);
    // Auto-create user if not exists for demo simplicity
    let users = this.get<User[]>('users', []);
    let user = users.find(u => u.email === email);
    
    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0],
        role: UserRole.REGULAR,
        interests: []
      };
      users.push(user);
      this.set('users', users);
    }
    
    // Set session
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }

  getCurrentUser(): User | null {
    return this.get<User | null>('currentUser', null);
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  async getEvents(): Promise<Event[]> {
    await delay(300);
    const stored = this.get<Event[]>('events', []);
    return stored.length ? stored : SEED_EVENTS;
  }

  async getPlaces(): Promise<Place[]> {
    await delay(300);
    const stored = this.get<Place[]>('places', []);
    return stored.length ? stored : SEED_PLACES;
  }

  async getRelocationProfile(userId: string): Promise<RelocationProfile | null> {
    await delay(300);
    const profiles = this.get<RelocationProfile[]>('relocationProfiles', []);
    return profiles.find(p => p.userId === userId) || null;
  }

  async saveRelocationProfile(profile: RelocationProfile): Promise<RelocationProfile> {
    await delay(500);
    let profiles = this.get<RelocationProfile[]>('relocationProfiles', []);
    const idx = profiles.findIndex(p => p.userId === profile.userId);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    this.set('relocationProfiles', profiles);
    return profile;
  }

  async updateStepStatus(userId: string, stepId: string, status: RelocationStep['status']): Promise<void> {
    const profile = await this.getRelocationProfile(userId);
    if (profile && profile.plan) {
      const step = profile.plan.find(s => s.id === stepId);
      if (step) {
        step.status = status;
        await this.saveRelocationProfile(profile);
      }
    }
  }
}

export const db = new MockDb();
