import React, { useState, useEffect, useContext } from 'react';
import { db } from '../services/mockDb';
import { Event, RelocationProfile } from '../types';
import { AppContext } from '../App';
import { Link } from 'react-router-dom';
import { useI18n } from '../services/i18n';

const COUNTRY_KEYS: Record<string, string> = {
  Germany: 'country.germany',
  Austria: 'country.austria',
  'Czech Republic': 'country.czech_republic',
  Slovakia: 'country.slovakia',
  Romania: 'country.romania',
};

export default function Events() {
  const { user } = useContext(AppContext);
  const [events, setEvents] = useState<Event[]>([]);
  const [profile, setProfile] = useState<RelocationProfile | null>(null);
  const [filterLang, setFilterLang] = useState('');
  const { t, localeId } = useI18n();
  
  useEffect(() => {
    // Load events and user profile
    const loadData = async () => {
      const [allEvents, userProfile] = await Promise.all([
        db.getEvents(),
        user ? db.getRelocationProfile(user.id) : null
      ]);
      setEvents(allEvents);
      setProfile(userProfile);
    };
    loadData();
  }, [user]);

  const filteredEvents = events.filter(e => {
    // 1. Show only current/upcoming events
    const eventDate = new Date(e.date);
    const now = new Date();
    // Use a small buffer or strictly current date. Assuming 'upcoming' means future.
    if (eventDate < now) return false;

    // 2. Filter by Language (manual filter)
    if (filterLang && !e.languages.some(l => l.toLowerCase().includes(filterLang.toLowerCase()))) {
      return false;
    }

    // 3. Filter by Relocation Profile (Country & City) if it exists
    if (profile) {
      if (e.country !== profile.toCountry) return false;
      
      if (profile.destinationCity) {
        // Simple case-insensitive match. In a real app, use fuzzy matching or IDs.
        if (!e.city.toLowerCase().includes(profile.destinationCity.toLowerCase())) {
          return false;
        }
      }
    }

    return true;
  });

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          {/* TODO: add i18n */}
           <h1 className="text-2xl font-bold text-slate-900">Community Events</h1>
           <p className="text-slate-500">
             {profile 
               ? `Showing upcoming events in ${profile.toCountry}${profile.destinationCity ? `, ${profile.destinationCity}` : ''}`
               : "Find support groups, language clubs, and cultural activities."
             }
           </p>
        </div>
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder={t('events.filterPlaceholder')} 
            className="px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={filterLang}
            onChange={e => setFilterLang(e.target.value)}
          />
        </div>
      </div>

      <div className="relative">
        {filteredEvents.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map(evt => (
              <div key={evt.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                <div className="h-32 bg-indigo-100 flex items-center justify-center">
                  <span className="text-4xl">🗓️</span>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                      {/* TODO: add i18n */}
                     <span className="text-xs font-bold uppercase text-indigo-600 tracking-wide">{evt.country}</span>
                     {/* TODO: add i18n */}
                     <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{evt.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{evt.title}</h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">{evt.description}</p>
                  
                  <div className="mt-auto space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                       <span>📍 {evt.city}, {evt.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span>🕒 {new Date(evt.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span>🗣️ {evt.languages.join(', ')}</span>
                    </div>
                  </div>

                  <button className="mt-6 w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
                    {/* TODO: add i18n */}
                    Register ({evt.attendeesCount} attending)
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            {/* TODO: add i18n */}
            <p className="text-slate-500 mb-4">No upcoming events found matching your criteria.</p>
            {!profile && (
              <Link to="/relocation" className="text-indigo-600 font-medium hover:underline">
                {/* TODO: add i18n */}
                Create a relocation profile to see events near you.
              </Link>
            )}
            {profile && (
              <p className="text-sm text-slate-400">Try changing your filter or check back later.</p>
            )}
          </div>
        )}
        
        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-lg min-h-[400px]">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-700 mb-4">Coming Soon</div>
            <p className="text-slate-500 text-lg">Events feature is under development</p>
            <p className="text-slate-400 text-sm mt-2">Check back later for community events and activities</p>
          </div>
        </div>
      </div>
    </div>
  );
}
