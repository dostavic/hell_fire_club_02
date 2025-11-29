import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LanguageSwitcher, useI18n } from '../services/i18n';

export default function Auth() {
  const { login, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { t } = useI18n();

  useEffect(() => {
    const verified = searchParams.get('verified');
    const token = searchParams.get('token');
    
    if (verified === 'true') {
      setMessage('Registration successful! Your email has been verified. You can now log in.');
      setIsLogin(true);
    } else if (token) {
      // Verify the token
      fetch(`/api/auth/verify?token=${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.message === 'Email verified successfully') {
            // Auto-login
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);
            navigate('/dashboard');
          } else {
            setMessage(data.message);
          }
        })
        .catch(() => setMessage('Verification failed'));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        setMessage(data.message);
        if (response.ok) {
          setIsLogin(true);
        }
      }
    } catch (error) {
      setMessage('An error occurred');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">{t('auth.title')}</h2>
          <p className="text-slate-500 mt-2">{t('auth.subtitle')}</p>
        </div>

        <div className="flex mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md ${isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md ${!isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Register
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
            <input 
              type="email" 
              id="email" 
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
            <input 
              type="password" 
              id="password" 
              required
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {message && (
            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
              {message}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition"
          >
            {isLoading ? 'Loading...' : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>
      </div>
    </div>
  );
}
