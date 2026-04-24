import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';
import LandingPage from '@/pages/LandingPage';
import DashboardPage from '@/pages/DashboardPage';
import ResumePage from '@/pages/ResumePage';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import SupportPage from '@/pages/SupportPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import OnboardingTour from '@/components/OnboardingTour';
import PageTracker from '@/components/analytics/PageTracker';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import {
  AdminAnalyticsPage,
  AdminDashboardPage,
  AdminErrorsPage,
  AdminSettingsPage,
  AdminSubscriptionsPage,
  AdminUserDetailPage,
  AdminUsersPage,
} from '@/pages/admin/AdminPages';
import { authStore } from '@/store/authStore';
import { applyThemeToDocument, useThemeStore } from '@/store/themeStore';
import apiClient from '@/lib/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authStore((state) => !!state.user && !!state.accessToken);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authStore((state) => !!state.user && !!state.accessToken);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAdminAuthenticated = authStore(
    (state) => !!state.user?.is_admin && !!state.accessToken
  );
  if (!isAdminAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

const AdminPublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAdminAuthenticated = authStore(
    (state) => !!state.user?.is_admin && !!state.accessToken
  );
  if (isAdminAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
};

// Wraps the authenticated layout and injects the onboarding tour for new users
const AuthenticatedLayout: React.FC = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);
  const isAuthenticated = authStore((state) => !!state.user && !!state.accessToken);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await apiClient.get('/profile')).data,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (profile && !checked) {
      setChecked(true);
      if (!profile.is_profile_complete) {
        setShowOnboarding(true);
      }
    }
  }, [profile, checked]);

  return (
    <>
      <AppLayout />
      {showOnboarding && <OnboardingTour onDismiss={() => setShowOnboarding(false)} />}
    </>
  );
};

const App: React.FC = () => {
  const themeMode = useThemeStore((state) => state.themeMode);

  useEffect(() => {
    applyThemeToDocument(themeMode);

    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyThemeToDocument('system');

    handleChange();
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PageTracker />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/admin/login" element={<AdminPublicRoute><AdminLoginPage /></AdminPublicRoute>} />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute><AuthenticatedLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="resume" element={<ResumePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="subscription" element={<SubscriptionPage />} />
          </Route>

          <Route element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="/admin/errors" element={<AdminErrorsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
