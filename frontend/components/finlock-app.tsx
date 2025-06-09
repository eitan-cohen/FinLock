
'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { AuthScreen } from '@/components/auth/auth-screen';
import { MobileHeader } from '@/components/layout/mobile-header';
import { HomeScreen } from '@/components/screens/home-screen';
import { AuthorizeScreen } from '@/components/screens/authorize-screen';
import { SuccessScreen } from '@/components/screens/success-screen';
import { PostPurchaseScreen } from '@/components/screens/post-purchase-screen';
import { HistoryScreen } from '@/components/screens/history-screen';
import { ProfileScreen } from '@/components/screens/profile-screen';
import { apiClient } from '@/lib/api';

export function FinLockApp() {
  const { isAuthenticated, currentScreen, setLoading } = useAppStore();

  useEffect(() => {
    // Initialize app
    setLoading(false);
    
    // Check if user has a stored token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('finlock_token');
      if (token) {
        apiClient.setToken(token);
      }
    }
  }, [setLoading]);

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'authorize':
        return <AuthorizeScreen />;
      case 'success':
        return <SuccessScreen />;
      case 'post-purchase':
        return <PostPurchaseScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <MobileHeader />
      <main className="pb-6">
        {renderCurrentScreen()}
      </main>
    </div>
  );
}
