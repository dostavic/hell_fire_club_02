import React from 'react';
import { FileText, LucideIcon, MapPin, Users } from 'lucide-react';
import { useI18n } from '../../services/i18n';

type FeatureCardProps = {
  title: string;
  description: string;
  detail: string;
  Icon: LucideIcon;
  badge?: string;
  learnMoreText: string;
};

interface LandingFeaturesProps {
  onGetStarted?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, detail, Icon, badge, learnMoreText }) => (
  <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-100 hover:border-indigo-100 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

    <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
      <Icon size={28} />
    </div>

    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">{title}</h3>
    <p className="text-slate-600 leading-relaxed mb-6 flex-grow">{description}</p>

    <div className="mt-auto">
      <p className="text-sm text-slate-500 italic mb-4 border-l-2 border-indigo-200 pl-3">"{detail}"</p>
      {badge && (
        <span className="inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 mb-3">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-3 transition-all text-sm uppercase tracking-wide">
        {learnMoreText}
      </div>
    </div>
  </div>
);

const LandingFeatures: React.FC<LandingFeaturesProps> = ({ onGetStarted }) => {
  const { t } = useI18n();
  return (
    <>
      <section id="features" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4" dangerouslySetInnerHTML={{ __html: t('landing.features.title') }}>
            </h2>
            <p className="text-lg text-slate-600">
              {t('landing.features.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title={t('landing.features.card1.title')}
              description={t('landing.features.card1.description')}
              detail={t('landing.features.card1.detail')}
              Icon={FileText}
              badge={t('landing.features.card1.badge')}
              learnMoreText={t('landing.features.learnMore')}
            />
            <FeatureCard
              title={t('landing.features.card2.title')}
              description={t('landing.features.card2.description')}
              detail={t('landing.features.card2.detail')}
              Icon={Users}
              badge={t('landing.features.card2.badge')}
              learnMoreText={t('landing.features.learnMore')}
            />
            <FeatureCard
              title={t('landing.features.card3.title')}
              description={t('landing.features.card3.description')}
              detail={t('landing.features.card3.detail')}
              Icon={MapPin}
              badge={t('landing.features.card3.badge')}
              learnMoreText={t('landing.features.learnMore')}
            />
          </div>

          <div className="mt-14 text-center">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              {t('landing.features.buildPlan')}
            </button>
          </div>
        </div>
      </section>
      {/* About Project Section */}
      <div className="bg-white py-20 border-t border-slate-200 mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">{t('landing.about.ourStory')}</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">{t('landing.about.title')}</h2>
          </div>

          <div className="space-y-12">
            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('landing.about.inspiration')}</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                {t('landing.about.inspirationText')}
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('landing.about.whatItDoes')}</h3>
              <p className="text-slate-600 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: t('landing.about.whatItDoesText') }}>
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('landing.about.accomplishments')}</h3>
              <p className="text-slate-600 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: t('landing.about.accomplishmentsText') }}>
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">{t('landing.about.next')}</h3>
              <p className="text-slate-600 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: t('landing.about.nextText') }}>
              </p>
            </section>
          </div>
        </div>
      </div>
      {/* End About Project Section */}
    </>
  );
};

export default LandingFeatures;
