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
        Learn more
      </div>
    </div>
  </div>
);

const LandingFeatures: React.FC<LandingFeaturesProps> = ({ onGetStarted }) => {
  return (
    <>
      <section id="features" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to <span className="text-indigo-600">settle in</span>
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
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              Build my plan
            </button>
          </div>
        </div>
      </section>
      {/* About Project Section */}
      <div className="bg-white py-20 border-t border-slate-200 mt-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">Our Story</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">About The Project</h2>
          </div>

          <div className="space-y-12">
            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Inspiration</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Moving to a new country is one of the most stressful experiences in life. Between deciphering foreign bureaucracy, finding housing, and combating loneliness, many immigrants feel overwhelmed. We were inspired by the millions of people moving to Europe who need a knowledgeable, empathetic friend to guide them—not just a search engine, but a companion that understands their specific context.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">What it does</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                ImmiPath is an all-in-one integration platform. It uses AI to generate <strong>personalized relocation plans</strong> based on citizenship and goals. Its <strong>Document Explainer</strong> allows users to upload photos or PDFs of bureaucratic letters and get instant, simple summaries. The <strong>City Buddy</strong> feature helps users find welcoming spaces (cafes, libraries) using Google Maps data, and the Events section connects them with local support groups.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Accomplishments that we're proud of</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                We're particularly proud of the <strong>Document Explainer</strong>. Seeing the AI correctly identify a German tax form from a photo or PDF and explain it in simple English was a "magic moment." We also love how the Dashboard dynamically updates as users complete tasks, giving them a real sense of progress.
              </p>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">What's next for ImmiPath</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Next, we plan to add <strong>Real-time Voice Translation</strong> for users visiting government offices. We also want to integrate a <strong>"Human Loop"</strong> feature where users can book 15-minute consultations with verified immigration experts for complex cases.
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
