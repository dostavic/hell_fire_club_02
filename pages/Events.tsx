import React, { useState, useEffect } from 'react';
import { db } from '../services/mockDb';
import { Event } from '../types';
import { useI18n } from '../services/i18n';

const COUNTRY_KEYS: Record<string, string> = {
  Germany: 'country.germany',
  Austria: 'country.austria',
  'Czech Republic': 'country.czech_republic',
  Slovakia: 'country.slovakia',
  Romania: 'country.romania',
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filterLang, setFilterLang] = useState('');
  const { t, localeId } = useI18n();
  
  useEffect(() => {
    db.getEvents().then(setEvents);
  }, []);

  const filteredEvents = events.filter(e => 
    filterLang ? e.languages.some(l => l.toLowerCase().includes(filterLang.toLowerCase())) : true
  );

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">{t('events.title')}</h1>
           <p className="text-slate-500">{t('events.subtitle')}</p>
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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(evt => (
          <div key={evt.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
            <div className="h-32 bg-indigo-100 flex items-center justify-center">
              <span className="text-4xl">🗓️</span>
            </div>
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-xs font-bold uppercase text-indigo-600 tracking-wide">
                   {t(COUNTRY_KEYS[evt.country] || evt.country)}
                 </span>
                 <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{t(`events.category.${evt.category}`)}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{evt.title}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">{evt.description}</p>
              
              <div className="mt-auto space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                   <span>📍 {evt.city}, {evt.location}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span>🕒 {new Date(evt.date).toLocaleString(localeId)}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span>🗣️ {evt.languages.join(', ')}</span>
                </div>
              </div>

              <button className="mt-6 w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
                {t('events.register', { count: evt.attendeesCount })}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
