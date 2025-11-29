import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { AIService } from '../services/ai';
import { Place } from '../types';
import { useI18n } from '../services/i18n';

export default function Places() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);
  const [cityInput, setCityInput] = useState('Berlin');
  const { t, language } = useI18n();

  useEffect(() => {
    db.getPlaces().then(setPlaces);
  }, []);

  const handleCityBuddy = async () => {
    setLoadingAi(true);
    setAiSuggestions([]);
    try {
      // Hardcoded interests for demo
      const results = await AIService.getCitySuggestions(cityInput, 'medium', ['culture', 'coffee', 'meeting people'], language);
      setAiSuggestions(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-lg">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">{t('places.heading')}</h1>
          <p className="text-indigo-200 mb-6">{t('places.lead')}</p>
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={cityInput}
              onChange={e => setCityInput(e.target.value)}
              className="flex-grow px-4 py-3 rounded-lg text-slate-900 focus:outline-none bg-white"
              placeholder={t('places.placeholder')}
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

      {aiSuggestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            {t('places.aiTitle', { city: cityInput })}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {aiSuggestions.map((s, i) => (
              <div key={i} className="bg-green-50 border border-green-200 p-6 rounded-xl">
                 {s.rawText ? (
                    <div className="prose prose-sm text-slate-700 whitespace-pre-wrap">{s.rawText}</div>
                 ) : (
                    <>
                      <h3 className="font-bold text-green-900">{s.title}</h3>
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
        <h2 className="text-xl font-bold text-slate-900 mb-4">{t('places.curated')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {places.map(place => (
            <div key={place.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition group">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${place.priceLevel === 'free' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                   {place.priceLevel === 'free' ? t('common.free') : t(`common.price.${place.priceLevel}`)}
                </span>
                <button className="text-slate-300 hover:text-red-500 transition">♥</button>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{place.title}</h3>
              <p className="text-sm text-slate-500 mb-2">{place.category}</p>
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{place.description}</p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {place.tags.map(tag => (
                  <span key={tag} className="text-xs bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100">#{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
