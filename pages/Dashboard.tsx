import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Link } from 'react-router-dom';
import { db } from '../services/mockDb';
import { Event, RelocationProfile } from '../types';
import { useI18n } from '../services/i18n';

const COUNTRY_KEYS: Record<string, string> = {
  Germany: 'country.germany',
  Austria: 'country.austria',
  'Czech Republic': 'country.czech_republic',
  Slovakia: 'country.slovakia',
  Romania: 'country.romania',
};

export default function Dashboard() {
  const { user } = useContext(AppContext);
  const [profile, setProfile] = useState<RelocationProfile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const { t, localeId } = useI18n();

  useEffect(() => {
    if (user) {
      db.getRelocationProfile(user.id).then(setProfile);
      db.getEvents().then(data => setEvents(data.slice(0, 3))); // Top 3 events
    }
  }, [user]);

  const completedSteps = profile?.plan?.filter(s => s.status === 'done').length || 0;
  const totalSteps = profile?.plan?.length || 0;
  const progress = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
  const destinationLabel = profile?.toCountry
    ? t(COUNTRY_KEYS[profile.toCountry] || profile.toCountry)
    : '';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.title')}</h1>
        <span className="text-slate-500">{new Date().toLocaleDateString(localeId)}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Relocation Widget */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('dashboard.planTitle')}</h2>
              <p className="text-slate-500 text-sm">
                {profile ? t('dashboard.movingTo', { country: destinationLabel }) : t('dashboard.notStarted')}
              </p>
            </div>
            <Link to="/relocation" className="text-indigo-600 text-sm font-medium hover:underline">{t('dashboard.viewPlan')}</Link>
          </div>
          
          {profile ? (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">{t('dashboard.progressLabel', { percent: progress })}</span>
                <span className="text-slate-500">{t('dashboard.stepsLabel', { done: completedSteps, total: totalSteps })}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="mt-6 flex gap-3">
                <Link to="/relocation" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition">
                  {t('dashboard.continue')}
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
              <p className="text-slate-600 mb-4">{t('dashboard.startCopy')}</p>
              <Link to="/relocation" className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition">
                {t('dashboard.createProfile')}
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-indigo-600 p-6 rounded-xl shadow-sm text-white flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-2">{t('dashboard.help.title')}</h2>
            <p className="text-indigo-100 text-sm mb-4">
              {t('dashboard.help.copy')}
            </p>
          </div>
          <div className="space-y-2">
             <Link to="/relocation" className="block w-full text-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-md text-sm font-medium transition backdrop-blur-sm">
              {t('dashboard.help.doc')}
            </Link>
            <Link to="/places" className="block w-full text-center px-4 py-2 bg-white text-indigo-600 rounded-md text-sm font-medium hover:bg-indigo-50 transition">
              {t('dashboard.help.places')}
            </Link>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex justify-between items-end mb-4">
           <h2 className="text-xl font-bold text-slate-900">{t('dashboard.recommendedEvents')}</h2>
           <Link to="/events" className="text-indigo-600 text-sm font-medium hover:underline">{t('dashboard.viewAll')}</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {events.map(evt => (
            <div key={evt.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition">
              <div className="p-5">
                <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-md mb-2">
                  {t(`events.category.${evt.category}`)}
                </span>
                <h3 className="font-bold text-slate-900 mb-1">{evt.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{evt.city} • {new Date(evt.date).toLocaleDateString(localeId)}</p>
                <p className="text-sm text-slate-600 line-clamp-2">{evt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
