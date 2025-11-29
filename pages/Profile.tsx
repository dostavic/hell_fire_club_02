import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, updateUserProfile, logout, deleteAccount } = useContext(AppContext);
  const navigate = useNavigate();
  
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
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock logic
    setMessage({ type: 'success', text: 'Password changed successfully.' });
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
       await deleteAccount();
       navigate('/');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Edit Profile Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Personal Information</h2>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700">Email</label>
             <input disabled value={user.email} className="mt-1 block w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-500" />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700">Display Name</label>
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
             {isSaving ? 'Saving...' : 'Update Profile'}
           </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Security</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-slate-700">Current Password</label>
             <input 
                type="password"
                required 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)} 
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900" 
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700">New Password</label>
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
             Change Password
           </button>
        </form>
      </div>

      {/* Account Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Account Actions</h2>
        <div className="flex flex-col gap-3">
          <button 
            onClick={logout}
            className="w-full sm:w-auto text-left px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 text-sm font-medium"
          >
            Sign Out
          </button>
          
          <div className="border-t border-slate-100 my-2"></div>
          
          <div>
            <h3 className="text-sm font-medium text-red-600 mb-1">Danger Zone</h3>
            <p className="text-xs text-slate-500 mb-3">Once you delete your account, there is no going back. Please be certain.</p>
            <button 
                onClick={handleDelete}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 border border-red-200"
            >
                Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}