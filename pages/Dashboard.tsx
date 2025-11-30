import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { Link } from 'react-router-dom';
import { db } from '../services/mockDb';
import { Event, RelocationProfile, ConsulateInfo } from '../types';
import { useI18n } from '../services/i18n';
import { AIService } from '../services/ai';

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
  const [consulate, setConsulate] = useState<ConsulateInfo | null>(null);
  const [consulateStatus, setConsulateStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const { t, localeId, language } = useI18n();

  useEffect(() => {
    if (user) {
      db.getRelocationProfile(user.id).then(setProfile);
      db.getEvents().then(data => setEvents(data.slice(0, 3))); // Top 3 events
    }
  }, [user]);

  useEffect(() => {
    if (!profile || !profile.toCountry) {
      setConsulate(null);
      setConsulateStatus('idle');
      return;
    }

    const fetchConsulate = async () => {
      try {
        setConsulateStatus('loading');
        const info = await AIService.findNearestConsulate(profile, language);
        setConsulate(info);
        setConsulateStatus('idle');
      } catch (err) {
        console.error('Failed to fetch consulate info', err);
        setConsulateStatus('error');
      }
    };

    fetchConsulate();
  }, [profile, language]);

  const completedSteps = profile?.plan?.filter(s => s.status === 'done').length || 0;
  const totalSteps = profile?.plan?.length || 0;
  const progress = totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
  const destinationLabel = profile?.toCountry
    ? t(COUNTRY_KEYS[profile.toCountry] || profile.toCountry)
    : '';
  const consulateCountry = profile?.citizenship || '';
  const locationCountry = profile
    ? (profile.isAlreadyInDestination ? profile.toCountry : profile.currentResidence)
    : '';
  const locationCity = profile?.isAlreadyInDestination
    ? profile?.destinationCity || destinationLabel || profile?.toCountry
    : profile?.destinationCity || profile?.currentResidence || '';
  const locationCountryLabel = locationCountry ? t(COUNTRY_KEYS[locationCountry] || locationCountry) : '';
  const mapSearchLink = profile && profile.citizenship
    ? `https://www.google.com/maps/search/${encodeURIComponent(`${consulateCountry} consulate in ${locationCity || locationCountry}`)}`
    : '';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.title')}</h1>
        <span className="text-slate-500">{new Date().toLocaleDateString(localeId)}</span>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-start gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-indigo-600 tracking-wide mb-1">
              {t('dashboard.consulate.badge')}
            </p>
            <h2 className="text-lg font-bold text-slate-900">{t('dashboard.consulate.title')}</h2>
            <p className="text-slate-500 text-sm">
              {profile
                ? t('dashboard.consulate.subtitle', {
                    city: locationCity || locationCountryLabel || destinationLabel || profile.toCountry,
                    country: locationCountryLabel || locationCountry || profile.toCountry,
                  })
                : t('dashboard.consulate.noProfile')}
            </p>
          </div>
          {profile && (
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-semibold">
              {consulateCountry}
            </span>
          )}
        </div>

        {profile && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="px-2 py-1 bg-slate-100 rounded-md">
              {t('dashboard.consulate.destination')}: {destinationLabel || profile.toCountry || t('dashboard.consulate.notSet')}
            </span>
            <span className="px-2 py-1 bg-slate-100 rounded-md">
              {t('dashboard.consulate.location')}: {locationCity || locationCountryLabel || locationCountry || t('dashboard.consulate.notSet')}
            </span>
            {profile.destinationCity && (
              <span className="px-2 py-1 bg-slate-100 rounded-md">
                {t('dashboard.consulate.city')}: {profile.destinationCity}
              </span>
            )}
          </div>
        )}

        {!profile && (
          <div className="mt-4">
            <Link
              to="/relocation"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition"
            >
              {t('dashboard.createProfile')}
            </Link>
          </div>
        )}

        {profile && !profile.toCountry && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-md border border-amber-200 bg-amber-50 text-sm text-amber-900">
            <span>{t('dashboard.consulate.incomplete')}</span>
            <Link
              to="/relocation"
              className="inline-flex items-center px-3 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 transition"
            >
              {t('dashboard.consulate.updateProfile')}
            </Link>
          </div>
        )}

        {profile && consulateStatus === 'loading' && (
          <p className="mt-4 text-sm text-slate-500">{t('dashboard.consulate.loading')}</p>
        )}

        {profile && consulateStatus === 'error' && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
            <span>{t('dashboard.consulate.error')}</span>
            {mapSearchLink && (
              <a
                href={mapSearchLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3 py-2 bg-white text-red-700 border border-red-200 rounded-md hover:bg-red-100"
              >
                {t('dashboard.consulate.map')}
              </a>
            )}
          </div>
        )}

        {profile && consulate && consulateStatus === 'idle' && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">{consulate.name}</p>
              <p className="text-sm text-slate-600">{consulate.address}</p>
              {consulate.note && <p className="text-xs text-slate-500">{consulate.note}</p>}
            </div>
            <div className="flex gap-3 flex-wrap">
              <a
                href={consulate.mapLink || mapSearchLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition"
              >
                {t('dashboard.consulate.map')}
              </a>
              {consulate.website && (
                <a
                  href={consulate.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-white text-indigo-700 border border-indigo-200 rounded-md text-sm font-medium hover:bg-indigo-50 transition"
                >
                  {t('dashboard.consulate.website')}
                </a>
              )}
            </div>
          </div>
        )}
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
                {/* TODO: add i18n */}

                <span className="font-medium text-slate-700">{progress}% Completed</span>
                <span className="text-slate-500">{completedSteps}/{totalSteps} steps</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="mt-6 flex gap-3">
                {/* TODO: add i18n */}
                {progress === 100 ? (
                  <button 
                    disabled 
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium cursor-not-allowed opacity-90"
                  >
                    All tasks done
                  </button>
                ) : (
                  <Link to="/relocation" className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-100 transition">
                    Continue Tasks
                  </Link>
                )}
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
        <div className="relative">
          <div className="grid md:grid-cols-3 gap-6">
            {events.map(evt => (
              <div key={evt.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition">
                <div className="p-5">
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-md mb-2">
                    {/* TODO: add i18n */}
                    {evt.category.replace('_', ' ')}
                  </span>
                  <h3 className="font-bold text-slate-900 mb-1">{evt.title}</h3>
                  {/* TODO: add i18n */}
                  <p className="text-sm text-slate-500 mb-3">{evt.city} • {new Date(evt.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Coming Soon Overlay */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700 mb-2">Coming Soon</div>
              <p className="text-slate-500">Events feature is under development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
