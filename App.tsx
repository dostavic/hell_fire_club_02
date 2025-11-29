import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User } from './types';
import { db } from './services/mockDb';
import { LanguageSwitcher, useI18n } from './services/i18n';

// Pages
import Dashboard from './pages/Dashboard';
import Relocation from './pages/Relocation';
import Events from './pages/Events';
import Places from './pages/Places';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import Verify from './pages/Verify';

// Context
interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUserProfile: (updatedUser: User) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useContext(AppContext);
  const { t } = useI18n();
  const location = useLocation();

  if (location.pathname === '/' || location.pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="text-2xl font-bold text-indigo-600 tracking-tight">ImmiPath</Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
              <Link to="/dashboard" className="hover:text-indigo-600 transition">{t('nav.dashboard')}</Link>
              <Link to="/relocation" className="hover:text-indigo-600 transition">{t('nav.relocation')}</Link>
              <Link to="/events" className="hover:text-indigo-600 transition">{t('nav.events')}</Link>
              <Link to="/places" className="hover:text-indigo-600 transition">{t('nav.places')}</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {user?.name && (
              <span className="text-sm text-slate-500 hidden sm:block">{t('nav.hello', { name: user.name })}</span>
            )}
            <button 
              onClick={logout}
              className="text-sm font-medium text-slate-500 hover:text-red-600"
            >
              {t('nav.signOut')}
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          {t('footer.text')}
        </div>
      </footer>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user } = useContext(AppContext);
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // TODO: Validate token with backend
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } else {
      throw new Error(data.message);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-indigo-600">{t('common.loading')}</div>;

  return (
    <AppContext.Provider value={{ user, login, logout, setUser, updateUserProfile, deleteAccount }}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/relocation" element={<ProtectedRoute><Relocation /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/places" element={<ProtectedRoute><Places /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppContext.Provider>
  );
}
