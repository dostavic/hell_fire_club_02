import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher, useI18n } from '../services/i18n';

const FeatureCard = ({ title, description, icon, to }: { title: string, description: string, icon: string, to: string }) => {
  const { t } = useI18n();
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col h-full">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 flex-grow">{description}</p>
      <Link to={to} className="text-indigo-600 font-semibold hover:text-indigo-700 inline-flex items-center">
        {t('landing.getStarted')}
      </Link>
    </div>
  );
};

export default function Landing() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 pt-6 flex justify-end">
        <LanguageSwitcher />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          {t('landing.heroPrefix')} <span className="text-indigo-600">{t('landing.heroHighlight')}</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          {t('landing.subtitle')}
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/auth" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition">
            {t('landing.join')}
          </Link>
          <Link to="/auth" className="px-8 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition">
            {t('landing.login')}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon="🗺️"
          title={t('landing.feature.copilot.title')}
          description={t('landing.feature.copilot.desc')}
          to="/auth"
        />
        <FeatureCard 
          icon="🤝"
          title={t('landing.feature.community.title')}
          description={t('landing.feature.community.desc')}
          to="/auth"
        />
        <FeatureCard 
          icon="📍"
          title={t('landing.feature.discovery.title')}
          description={t('landing.feature.discovery.desc')}
          to="/auth"
        />
      </div>
    </div>
  );
}
