import React, { useState, useEffect, useContext } from 'react';
import { db } from '../services/mockDb';
import { AIService } from '../services/ai';
import { Place, RelocationProfile } from '../types';
import { AppContext } from '../App';
import { useI18n } from '../services/i18n';

export default function Places() {
  const { user } = useContext(AppContext);
  const [places, setPlaces] = useState<Place[]>([]);
  const [profile, setProfile] = useState<RelocationProfile | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [cityInput, setCityInput] = useState('Berlin');
  const [searchQuery, setSearchQuery] = useState('');
  const { t, language } = useI18n();

  useEffect(() => {
    if (user) {
      db.getFavoritePlaces(user.id).then(setPlaces);
      db.getRelocationProfile(user.id).then(setProfile);
    }
  }, [user]);

  const handleCityBuddy = async () => {
    setLoadingAi(true);
    setAiSuggestions([]);
    try {
      // Use search query if provided, otherwise use default interests
      const interests = searchQuery.trim() 
        ? [searchQuery] 
        : ['culture', 'coffee', 'meeting people'];
      const results = await AIService.getCitySuggestions(cityInput, 'medium', interests, searchQuery, language);
      setAiSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleAddToFavorites = async (suggestion: any) => {
    if (!user) return;
    
    // Check if already in favorites by title matching to prevent simple duplicates from UI
    if (places.some(p => p.title === suggestion.title)) return;

    // Try to guess category from description and title
    let category: Place['category'] = 'other';
    const text = (suggestion.description + ' ' + suggestion.title).toLowerCase();
    
    if (text.includes('coffee') || text.includes('cafe') || text.includes('bakery')) category = 'cafe';
    else if (text.includes('restaurant') || text.includes('food') || text.includes('cuisine') || text.includes('dining')) category = 'restaurant';
    else if (text.includes('library') || text.includes('books')) category = 'library';
    else if (text.includes('park') || text.includes('garden') || text.includes('nature')) category = 'park';
    else if (text.includes('church') || text.includes('mosque') || text.includes('temple') || text.includes('synagogue')) category = 'faith';

    const newPlace: Place = {
      id: Math.random().toString(36).substr(2, 9),
      title: suggestion.title,
      description: suggestion.description || "Found via City Buddy",
      country: profile?.toCountry || 'Unknown',
      city: cityInput,
      category: category,
      address: suggestion.address || '',
      priceLevel: 'unknown',
      tags: ['ai-suggested'],
      website: suggestion.address // Google maps places usually have the uri as the link
    };

    await db.addFavoritePlace(user.id, newPlace);
    setPlaces(prev => [...prev, newPlace]);
  };

  const handleRemoveFromFavorites = async (placeId: string) => {
    if (!user) return;
    await db.removeFavoritePlace(user.id, placeId);
    setPlaces(prev => prev.filter(p => p.id !== placeId));
  };

  const isFavorite = (title: string) => places.some(p => p.title === title);

  return (
    <div className="space-y-8">
      <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">{t('places.heading')}</h1>
          <p className="text-indigo-200 mb-6">{t('places.lead')}</p>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={cityInput}
                onChange={e => setCityInput(e.target.value)}
                className="flex-grow px-4 py-3 rounded-lg text-slate-900 focus:outline-none bg-white"
                placeholder={t('places.placeholder')}
              />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-grow px-4 py-3 rounded-lg text-slate-900 focus:outline-none bg-white"
                placeholder="Що шукаєте? (кафе, бібліотека, храм...)"
              />
              <button 
                onClick={handleCityBuddy}
                disabled={loadingAi}
                className="bg-indigo-500 hover:bg-indigo-400 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {loadingAi ? t('places.searching') : t('places.askBuddy')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {aiSuggestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            {searchQuery.trim() 
              ? t('places.aiTitleSearch', { city: cityInput, query: searchQuery })
              : t('places.aiTitle', { city: cityInput })}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="bg-green-50 border border-green-200 p-6 rounded-xl relative group">
                 {s.rawText ? (
                    <div className="prose prose-sm text-slate-700 whitespace-pre-wrap">{s.rawText}</div>
                 ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-green-900 pr-8">{s.title}</h3>
                        <button 
                          onClick={() => handleAddToFavorites(s)}
                          disabled={isFavorite(s.title)}
                          className="absolute top-4 right-4 text-slate-400 hover:text-yellow-500 transition disabled:text-yellow-500"
                          title="Add to Favorites"
                        >
                          {isFavorite(s.title) ? '★' : '☆'}
                        </button>
                      </div>
                      <p className="text-sm text-green-800 mt-2">{s.description}</p>
                      {s.address && (
                          <a href={s.address} target="_blank" rel="noreferrer" className="block mt-4 text-xs text-green-700 underline">
                              {t('places.viewMaps')}
                          </a>
                      )}
                    </>
                 )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Favorite Places</h2>
        {places.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-slate-500 mb-2">You haven't added any favorite places yet.</p>
            <p className="text-sm text-slate-400">Search for a city above and add AI recommendations to your list.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {places.map(place => (
              <div key={place.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition group relative">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${place.priceLevel === 'free' ? 'bg-green-100 text-green-700' : place.priceLevel === 'unknown' ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-600'}`}>
                     {place.priceLevel === 'free' ? 'Free' : place.priceLevel === 'unknown' ? '?' : place.priceLevel}
                  </span>
                  <button 
                    onClick={() => handleRemoveFromFavorites(place.id)}
                    className="text-yellow-500 hover:text-slate-300 transition"
                    title="Remove from Favorites"
                  >
                    ★
                  </button>
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{place.title}</h3>
                {place.category !== 'other' && (
                  <p className="text-sm text-slate-500 mb-2 capitalize">{place.category}</p>
                )}
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{place.description}</p>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {place.tags.map(tag => (
                    <span key={tag} className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">#{tag}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}