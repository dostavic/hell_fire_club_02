import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User } from './types';
import { db } from './services/mockDb';

// Pages
import Dashboard from './pages/Dashboard';
import Relocation from './pages/Relocation';
import Events from './pages/Events';
import Places from './pages/Places';
import Auth from './pages/Auth';
import Landing from './pages/Landing';

// Context
interface AppContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const { user, logout } = useContext(AppContext);
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
              <Link to="/dashboard" className="hover:text-indigo-600 transition">Dashboard</Link>
              <Link to="/relocation" className="hover:text-indigo-600 transition">Relocation</Link>
              <Link to="/events" className="hover:text-indigo-600 transition">Events</Link>
              <Link to="/places" className="hover:text-indigo-600 transition">Places</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">Hello, {user?.name}</span>
            <button 
              onClick={logout}
              className="text-sm font-medium text-slate-500 hover:text-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; 2024 ImmiPath Europe. Built by HellFire club.
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

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (email: string) => {
    const u = await db.login(email);
    setUser(u);
  };

  const logout = () => {
    db.logout();
    setUser(null);
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-indigo-600">Loading...</div>;

  return (
    <AppContext.Provider value={{ user, login, logout }}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
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
