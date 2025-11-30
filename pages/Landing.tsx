import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingFeatures from '../components/landing/LandingFeatures';
import LandingFooter from '../components/landing/LandingFooter';
import LandingHeader from '../components/landing/LandingHeader';
import LandingHero from '../components/landing/LandingHero';

export default function Landing() {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);

  const scrollToFeatures = () => {
    if (featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToLogin = () => navigate('/auth?mode=login');
  const goToRegister = () => navigate('/auth?mode=register');

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingHeader
        onLogin={goToLogin}
        onRegister={goToRegister}
        onScrollToFeatures={scrollToFeatures}
        onGoHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
      <main>
        <LandingHero onRegister={goToRegister} onScrollToFeatures={scrollToFeatures} />
        <div ref={featuresRef}>
          <LandingFeatures onGetStarted={goToRegister} />
        </div>
      </main>
      <LandingFooter onLogin={goToLogin} />
    </div>
  );
}
