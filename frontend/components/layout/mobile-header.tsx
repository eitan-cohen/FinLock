
'use client';

import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { apiClient } from '@/lib/api';
import { 
  Shield, 
  User, 
  LogOut, 
  Home, 
  CreditCard, 
  History,
  HelpCircle,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export function MobileHeader() {
  const { user, currentScreen, setCurrentScreen, logout } = useAppStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    apiClient.clearToken();
    logout();
    setIsMenuOpen(false);
  };

  const navigation = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'authorize', label: 'Authorize', icon: CreditCard },
    { id: 'history', label: 'History', icon: History },
    { id: 'intro', label: 'Card Guide', icon: HelpCircle },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FinLock
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name || user?.email}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div 
            className="fixed right-0 top-16 h-full w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentScreen === item.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setCurrentScreen(item.id as any);
                      setIsMenuOpen(false);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
              
              <div className="border-t pt-2 mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
