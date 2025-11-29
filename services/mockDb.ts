import { User, Event, Place, RelocationProfile, UserRole, TargetCountry, RelocationStep } from '../types';

// Helper to get a future date ISO string
const getFutureDate = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString();
};

// Seed Data
const SEED_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Berlin Newcomers Meetup',
    description: 'A casual evening for people who just moved to Berlin. Share stories and make friends.',
    country: 'Germany',
    city: 'Berlin',
    category: 'support_group',
    date: getFutureDate(5), // 5 days from now
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
    date: getFutureDate(10), // 10 days from now
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
    date: getFutureDate(15), // 15 days from now
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

  async updateUser(user: User): Promise<void> {
    await delay(300);
    let users = this.get<User[]>('users', []);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      this.set('users', users);
      
      // Update session if it's the current user
      const currentUser = this.get<User | null>('currentUser', null);
      if (currentUser && currentUser.id === user.id) {
        this.set('currentUser', user);
      }
    }
  }

  async deleteUser(userId: string): Promise<void> {
    await delay(300);
    let users = this.get<User[]>('users', []);
    users = users.filter(u => u.id !== userId);
    this.set('users', users);
    
    // Cleanup related data
    let profiles = this.get<RelocationProfile[]>('relocationProfiles', []);
    profiles = profiles.filter(p => p.userId !== userId);
    this.set('relocationProfiles', profiles);
    
    let favs = this.get<any[]>('user_favorites', []);
    favs = favs.filter(f => f.userId !== userId);
    this.set('user_favorites', favs);

    // If current user is deleted, clear session
    const currentUser = this.get<User | null>('currentUser', null);
    if (currentUser && currentUser.id === userId) {
      this.logout();
    }
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

  async getFavoritePlaces(userId: string): Promise<Place[]> {
    await delay(300);
    const all = this.get<{userId: string, place: Place}[]>('user_favorites', []);
    return all.filter(item => item.userId === userId).map(item => item.place);
  }

  async addFavoritePlace(userId: string, place: Place): Promise<void> {
    await delay(200);
    const all = this.get<{userId: string, place: Place}[]>('user_favorites', []);
    // Prevent duplicates by ID
    const exists = all.some(item => item.userId === userId && item.place.id === place.id);
    if (!exists) {
      all.push({ userId, place });
      this.set('user_favorites', all);
    }
  }

  async removeFavoritePlace(userId: string, placeId: string): Promise<void> {
    await delay(200);
    let all = this.get<{userId: string, place: Place}[]>('user_favorites', []);
    all = all.filter(item => !(item.userId === userId && item.place.id === placeId));
    this.set('user_favorites', all);
  }
}

export const db = new MockDb();