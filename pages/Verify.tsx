import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      fetch(`/api/auth/verify?token=${token}`)
        .then(res => res.json())
        .then(data => {
          setMessage(data.message);
          if (data.message === 'Email verified successfully') {
            navigate('/auth?verified=true');
          } else {
            setTimeout(() => navigate('/auth'), 2000);
          }
        })
        .catch(() => {
          setMessage('Verification failed');
          setTimeout(() => navigate('/auth'), 2000);
        });
    } else {
      setMessage('Invalid verification link');
      setTimeout(() => navigate('/auth'), 2000);
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow border border-slate-100 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Email Verification</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}