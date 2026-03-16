import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getSession, supabase } from '../lib/supabaseClient';
import { getCurrentUserProfile } from '../lib/api/auth';

const THEME_STORAGE_KEY = 'app-theme';

function getStoredTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return 'light';
}

function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (_) {}
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [theme, setThemeState] = useState<'light' | 'dark'>(getStoredTheme);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (next: 'light' | 'dark') => {
    setThemeState(next);
    applyTheme(next);
  };

  useEffect(() => {
    // Check for existing Supabase session on mount
    const checkSession = async () => {
      try {
        const session = await getSession();
        if (session && session.user) {
          const userProfile = await getCurrentUserProfile();
          if (userProfile.success && userProfile.data) {
            const userData = {
              id: userProfile.data.id,
              name: userProfile.data.name,
              email: userProfile.data.email,
              role: userProfile.data.role as UserRole,
              avatar: userProfile.data.avatar,
              class: userProfile.data.class,
            };
            setUser(userData as any);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (session) {
        checkSession();
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D6EFD] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme, toggleTheme, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
