import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/store/authStore';
import apiClient from '@/lib/api';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const error = params.get('error');

    if (error || !accessToken) {
      navigate(`/login?error=${error || 'oauth_failed'}`);
      return;
    }

    // Store token then fetch user profile
    authStore.setState({ accessToken });
    apiClient.get('/auth/me')
      .then((res) => {
        authStore.setState({ user: res.data, isLoading: false, error: null });
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        authStore.getState().logout();
        navigate('/login?error=profile_fetch_failed');
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-primary-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-slate-400 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
