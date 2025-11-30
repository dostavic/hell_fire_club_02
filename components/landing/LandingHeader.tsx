import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LanguageSwitcher, useI18n } from '../../services/i18n';

interface LandingHeaderProps {
  onLogin: () => void;
  onRegister: () => void;
  onScrollToFeatures?: () => void;
  onGoHome?: () => void;
}

const LandingHeader: React.FC<LandingHeaderProps> = ({
  onLogin,
  onRegister,
  onScrollToFeatures,
  onGoHome,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useI18n();

  const handleScroll = () => {
    onScrollToFeatures?.();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => {
            onGoHome?.();
            setIsMobileMenuOpen(false);
          }}
          className="flex items-center gap-2 text-primary-600 font-bold tracking-tight text-xl"
        >
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary-600 text-white">I</span>
          <span>{t('landing.brandName')}</span>
        </button>

        {/* <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
          <button onClick={handleScroll} className="hover:text-primary-600 transition-colors">
            Why ImmiPath
          </button>
          <button onClick={handleScroll} className="hover:text-primary-600 transition-colors">
            Features
          </button>
          <button onClick={handleScroll} className="hover:text-primary-600 transition-colors">
            Platform
          </button>
        </nav> */}

        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <button onClick={onLogin} className="text-primary-700 font-semibold hover:text-primary-800 transition-colors">
            {t('landing.login')}
          </button>
          <button
            onClick={onRegister}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-full font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {t('landing.startForFree')}
          </button>
        </div>

        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 shadow-lg py-4 px-4 space-y-3">
          <div className="flex items-center justify-between">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-slate-500"
              aria-label="Close navigation"
            >
              <X size={18} />
            </button>
          </div>
          {/* <button onClick={handleScroll} className="block w-full text-left py-2 font-medium text-slate-700">
            Why ImmiPath
          </button>
          <button onClick={handleScroll} className="block w-full text-left py-2 font-medium text-slate-700">
            Features
          </button>
          <button onClick={handleScroll} className="block w-full text-left py-2 font-medium text-slate-700">
            Platform
          </button> */}
          <div className="pt-2 flex flex-col gap-2">
            <button onClick={onLogin} className="w-full py-2 text-primary-700 font-semibold">
              {t('landing.login')}
            </button>
            <button
              onClick={onRegister}
              className="w-full py-2 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              {t('landing.startForFree')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingHeader;
