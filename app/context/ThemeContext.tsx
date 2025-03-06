import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme, Appearance, Platform, AppState, AppStateStatus, StatusBar } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  currentTheme: 'light' | 'dark';
  themePreference: ThemeType;
  setTheme: (theme: ThemeType) => void;
  forceRefresh: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(colorScheme || 'light');
  const [themePreference, setThemePreference] = useState<ThemeType>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const appState = useRef(AppState.currentState);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemePreference(savedTheme as ThemeType);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // Update system theme when colorScheme changes
  useEffect(() => {
    if (colorScheme) {
      setSystemTheme(colorScheme);
    }
  }, [colorScheme]);

  // Configure system UI to follow theme
  useEffect(() => {
    const effectiveTheme = themePreference === 'system' ? systemTheme : themePreference as 'light' | 'dark';
    
    const updateSystemUI = async () => {
      try {
        await SystemUI.setBackgroundColorAsync(effectiveTheme === 'dark' ? '#000000' : '#ffffff');
        StatusBar.setBarStyle(effectiveTheme === 'dark' ? 'light-content' : 'dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('transparent');
          StatusBar.setTranslucent(true);
        }
      } catch (error) {
        console.error('Error updating system UI:', error);
      }
    };

    updateSystemUI();
  }, [systemTheme, themePreference]);

  // Function to set theme
  const setTheme = async (theme: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setThemePreference(theme);
      if (theme !== 'system') {
        setSystemTheme(theme);
      } else {
        const newSystemTheme = Appearance.getColorScheme() || 'light';
        setSystemTheme(newSystemTheme);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Function to force refresh the theme
  const forceRefresh = () => {
    const currentAppearanceTheme = Appearance.getColorScheme() || 'light';
    if (themePreference === 'system') {
      setSystemTheme(currentAppearanceTheme);
    }
    setRefreshCounter(prev => prev + 1);
  };

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme && themePreference === 'system') {
        setSystemTheme(colorScheme);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [themePreference]);

  // Check theme when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (themePreference === 'system') {
          const newSystemTheme = Appearance.getColorScheme() || 'light';
          setSystemTheme(newSystemTheme);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [themePreference]);

  if (isLoading) {
    return null;
  }

  const effectiveTheme = themePreference === 'system' ? systemTheme : themePreference as 'light' | 'dark';

  return (
    <ThemeContext.Provider value={{ 
      currentTheme: effectiveTheme,
      themePreference,
      setTheme,
      forceRefresh 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;