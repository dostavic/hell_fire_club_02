import React from 'react';
import { FileText, LucideIcon, MapPin, Users } from 'lucide-react';

type FeatureCardProps = {
  title: string;
  description: string;
  detail: string;
  Icon: LucideIcon;
  badge?: string;
};

interface LandingFeaturesProps {
  onGetStarted?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, detail, Icon, badge }) => (
  <div className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-slate-100 hover:border-primary-100 transition-all duration-300 flex flex-col h-full relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-indigo-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

    <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
      <Icon size={28} />
    </div>

    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-700 transition-colors">{title}</h3>
    <p className="text-slate-600 leading-relaxed mb-6 flex-grow">{description}</p>

    <div className="mt-auto">
      <p className="text-sm text-slate-500 italic mb-4 border-l-2 border-primary-200 pl-3">"{detail}"</p>
      {badge && (
        <span className="inline-flex items-center rounded-full bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 mb-3">
          {badge}
        </span>
      )}
      <div className="flex items-center gap-2 text-primary-600 font-semibold group-hover:gap-3 transition-all text-sm uppercase tracking-wide">
        Learn more
      </div>
    </div>
  </div>
);

const LandingFeatures: React.FC<LandingFeaturesProps> = ({ onGetStarted }) => {
  return (
    <section id="features" className="py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything you need to <span className="text-primary-600">settle in</span>
          </h2>
          <p className="text-lg text-slate-600">
            We do not just help you move; we help you build a life. From paperwork to finding your favorite coffee shop,
            ImmiPath is with you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="Personal relocation plan"
            description="Step-by-step guidance with required documents, deadlines, and links to official resources for your destination country."
            detail="Never miss a deadline with our reminders."
            Icon={FileText}
            badge="Legal ready"
          />
          <FeatureCard
            title="Find events and people"
            description="Local meetups, language clubs, and support groups filtered to the city in your plan so you land with a community."
            detail="10k+ expats are already here."
            Icon={Users}
            badge="Community"
          />
          <FeatureCard
            title="Explore places by interests"
            description="Curated restaurants, parks, faith places, and kid-friendly spots so the new city feels familiar from day one."
            detail="Matched to your hobbies and family needs."
            Icon={MapPin}
            badge="City buddy"
          />
        </div>

        <div className="mt-14 text-center">
          <button
            onClick={onGetStarted}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-primary-600 text-white font-semibold shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:-translate-y-0.5 transition-all"
          >
            Build my plan
          </button>
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
