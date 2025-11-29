import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, icon, to }: { title: string, description: string, icon: string, to: string }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col h-full">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <p className="text-slate-600 mb-6 flex-grow">{description}</p>
    <Link to={to} className="text-indigo-600 font-semibold hover:text-indigo-700 inline-flex items-center">
      Get Started &rarr;
    </Link>
  </div>
);

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
          Your Companion for <span className="text-indigo-600">Life in Europe</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
          Simplify your relocation, connect with local communities, and discover welcoming places in Germany, Austria, Czech Republic, Slovakia, and Romania.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/auth" className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold shadow hover:bg-indigo-700 transition">
            Join Now
          </Link>
          <Link to="/auth" className="px-8 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 transition">
            Log In
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon="🗺️"
          title="Relocation Copilot"
          description="AI-powered personalized checklists for visas, housing, and bureaucracy."
          to="/auth"
        />
        <FeatureCard 
          icon="🤝"
          title="Community & Events"
          description="Find language clubs, cultural meetups, and support groups near you."
          to="/auth"
        />
        <FeatureCard 
          icon="📍"
          title="Local Discovery"
          description="Discover immigrant-friendly places, libraries, and services with our City Buddy."
          to="/auth"
        />
      </div>
    </div>
  );
}
