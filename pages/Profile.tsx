import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../services/i18n';

export default function Profile() {
  const { user, updateUserProfile, logout, deleteAccount } = useContext(AppContext);
  const navigate = useNavigate();
  const { t } = useI18n();
  
  // State for editable fields
  const [name, setName] = useState(user?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  // Password state (mock)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    try {
      await updateUserProfile({ ...user, name });
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
    } catch (err) {
      setMessage({ type: 'error', text: t('profile.updateError') });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock logic
    setMessage({ type: 'success', text: t('profile.passwordSuccess') });
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleDelete = async () => {
    if (window.confirm(t('profile.deleteConfirm'))) {
       await deleteAccount();
       navigate('/');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">{t('profile.title')}</h1>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Edit Profile Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{t('profile.personalInfo')}</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700">{t('profile.email')}</label>
             <input disabled value={user.email} className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-500" />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700">{t('profile.displayName')}</label>
             <input 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900" 
             />
           </div>
           <button 
             type="submit" 
             disabled={isSaving}
             className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
           >
             {isSaving ? t('profile.saving') : t('profile.updateProfile')}
           </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{t('profile.security')}</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700">{t('profile.currentPassword')}</label>
             <input 
                type="password"
                required 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900" 
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700">{t('profile.newPassword')}</label>
             <input 
                type="password"
                required 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900" 
             />
           </div>
           <button 
             type="submit" 
             className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-50"
           >
             {t('profile.changePassword')}
           </button>
        </form>
      </div>

      {/* Account Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">{t('profile.accountActions')}</h2>
        <div className="flex flex-col gap-3">
          <button 
            onClick={logout}
            className="w-full sm:w-auto text-left px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm font-medium"
          >
            {t('profile.signOut')}
          </button>
          
          <div className="border-t border-slate-100 my-2"></div>
          
          <div>
            <h3 className="text-sm font-medium text-red-600 mb-1">{t('profile.dangerZone')}</h3>
            <p className="text-xs text-slate-500 mb-3">{t('profile.deleteWarning')}</p>
            <button 
                onClick={handleDelete}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 border border-red-200"
            >
                {t('profile.deleteAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}