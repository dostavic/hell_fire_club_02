import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingHeroProps {
  onRegister: () => void;
  onScrollToFeatures?: () => void;
}

const LandingHero: React.FC<LandingHeroProps> = ({ onRegister, onScrollToFeatures }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-16 pb-24 lg:pt-28 lg:pb-36">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-[480px] h-[480px] bg-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-[420px] h-[420px] bg-indigo-200/30 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-primary-700 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
              </span>
              Relocation made human-first
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Your trusted path
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                to a new life in Europe
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              We guide relocations to Slovakia, Germany, Czechia, Austria, and Romania. We decode bureaucracy, surface
              events, and map friendly places so you feel at home faster.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onRegister}
                className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white rounded-full font-bold text-lg shadow-lg shadow-primary-500/30 hover:bg-primary-700 hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2 group"
              >
                Start my plan
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onScrollToFeatures}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold text-lg hover:bg-slate-50 transition-colors duration-200"
              >
                Explore the product
              </button>
            </div>

            <div className="mt-10 flex flex-wrap justify-center lg:justify-start gap-y-2 gap-x-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Verified official sources</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Community support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Step-by-step guides</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-indigo-100 rounded-[2rem] transform rotate-3 scale-95 group-hover:rotate-1 transition-transform duration-500" />

            <img
              src="https://picsum.photos/800/600?random=21"
              alt="Relocation success story"
              className="relative rounded-[2rem] shadow-2xl w-full object-cover aspect-[4/3] transform transition-transform duration-500 hover:-translate-y-2"
            />

            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl hidden md:block animate-bounce">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Status</p>
                  <p className="text-sm font-bold text-slate-800">Visa approved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
