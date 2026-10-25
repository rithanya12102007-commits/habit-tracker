import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId } from '../types';
import { useAuth } from './AuthContext';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  colors: {
    bg: string;
    surface: string;
    card: string;
    accent: string;
    border: string;
    text: string;
    muted: string;
  };
  description: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'sage-garden': {
    id: 'sage-garden',
    name: 'Sage Garden',
    subtitle: 'Muted botanical green, warm ivory & sage',
    colors: {
      bg: '#08110c',
      surface: '#0e1a14',
      card: '#13241b',
      accent: '#52b788',
      border: '#224131',
      text: '#f0f7f3',
      muted: '#95b3a3',
    },
    description: 'Grounding botanical tones with rich moss-tinted cards and tranquil sage accents.',
  },
  'lavender-calm': {
    id: 'lavender-calm',
    name: 'Lavender Calm',
    subtitle: 'Pale lavender, lilac & soft white',
    colors: {
      bg: '#0d0b17',
      surface: '#141122',
      card: '#1c172e',
      accent: '#a78bfa',
      border: '#372d5c',
      text: '#f5f2fb',
      muted: '#aba2c5',
    },
    description: 'A serene twilight ambiance with dusky violet cards to soften stress and encourage focus.',
  },
  'warm-minimal': {
    id: 'warm-minimal',
    name: 'Warm Minimal',
    subtitle: 'Cream, sand & muted espresso',
    colors: {
      bg: '#120f0d',
      surface: '#1a1613',
      card: '#221c17',
      accent: '#d4a373',
      border: '#45372d',
      text: '#f8f3ed',
      muted: '#b9aba0',
    },
    description: 'Tactile earthy warmth with rich espresso cards and golden sand highlights.',
  },
  'ocean-mist': {
    id: 'ocean-mist',
    name: 'Ocean Mist',
    subtitle: 'Mist blue, seafoam & muted teal',
    colors: {
      bg: '#081119',
      surface: '#0e1a25',
      card: '#132434',
      accent: '#4ea8ba',
      border: '#23435e',
      text: '#f0f7fb',
      muted: '#96b2c5',
    },
    description: 'Crisp ocean spray and coastal slate with deep maritime cards and seafoam rhythms.',
  },
};

interface ThemeContextType {
  currentTheme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: ThemeConfig[];
  followSystem: boolean;
  setFollowSystem: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'ritho_ai_selected_theme';
const SYSTEM_FOLLOW_KEY = 'ritho_ai_follow_system';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, updateProfileSettings } = useAuth();

  const [currentTheme, setCurrentThemeState] = useState<ThemeId>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
      if (stored && THEMES[stored]) {
        return stored;
      }
    }
    return 'sage-garden'; // Default peaceful theme
  });

  const [followSystem, setFollowSystemState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(SYSTEM_FOLLOW_KEY) === 'true';
    }
    return false;
  });

  // Apply theme attribute to document root and body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (document.body) {
      document.body.setAttribute('data-theme', currentTheme);
    }
  }, [currentTheme]);

  // Sync when profile loads
  useEffect(() => {
    if (profile?.theme && THEMES[profile.theme as ThemeId]) {
      const validTheme = profile.theme as ThemeId;
      setCurrentThemeState(validTheme);
      localStorage.setItem(THEME_STORAGE_KEY, validTheme);
    }
  }, [profile?.theme]);

  // Handle system dark/light preference if followSystem is on
  useEffect(() => {
    if (!followSystem || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const targetTheme: ThemeId = e.matches ? 'sage-garden' : 'warm-minimal';
      setCurrentThemeState(targetTheme);
    };

    handleSystemChange(mediaQuery);
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [followSystem]);

  const setTheme = (theme: ThemeId) => {
    if (!THEMES[theme]) return;
    setCurrentThemeState(theme);
    setFollowSystemState(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem(SYSTEM_FOLLOW_KEY, 'false');
    }

    if (profile && updateProfileSettings) {
      updateProfileSettings({ theme }).catch((err) => {
        console.warn('Could not persist theme to Firestore:', err);
      });
    }
  };

  const setFollowSystem = (val: boolean) => {
    setFollowSystemState(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SYSTEM_FOLLOW_KEY, String(val));
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themes: Object.values(THEMES),
        followSystem,
        setFollowSystem,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
