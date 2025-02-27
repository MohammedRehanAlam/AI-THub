import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme, Appearance, Platform, AppState, AppStateStatus, StatusBar } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  currentTheme: 'light' | 'dark';
  setTheme: (theme: ThemeType) => void;
  forceRefresh: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get the initial theme
  const colorScheme = useColorScheme();
  const initialTheme = (Platform.OS === 'android' ? Appearance.getColorScheme() : colorScheme) || 'light';
  
  // State for the current theme
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(initialTheme);
  const [themePreference, setThemePreference] = useState<ThemeType>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  
  // Keep track of the app state
  const appState = useRef(AppState.currentState);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemePreference(savedTheme as ThemeType);
          if (savedTheme !== 'system') {
            setSystemTheme(savedTheme as 'light' | 'dark');
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading theme preference:', error);
        setIsLoading(false);
      }
    };
    loadThemePreference();
  }, []);

  // Configure system UI to follow theme
  useEffect(() => {
    const effectiveTheme = themePreference === 'system' ? systemTheme : themePreference;
    
    // Set the system UI to follow the theme
    SystemUI.setBackgroundColorAsync(effectiveTheme === 'dark' ? '#000000' : '#ffffff');
    
    // Update StatusBar style based on theme
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle(effectiveTheme === 'dark' ? 'light-content' : 'dark-content');
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, [systemTheme, themePreference]);

  // Function to set theme
  const setTheme = async (theme: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setThemePreference(theme);
      if (theme !== 'system') {
        setSystemTheme(theme);
      } else {
        const systemColorScheme = Appearance.getColorScheme() || 'light';
        setSystemTheme(systemColorScheme);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Function to check and update the current theme
  const updateTheme = () => {
    if (themePreference === 'system') {
    const newTheme = Appearance.getColorScheme() || 'light';
    if (newTheme !== systemTheme) {
      setSystemTheme(newTheme);
      }
    }
  };

  // Force a refresh of the theme
  const forceRefresh = () => {
    if (themePreference === 'system') {
    const currentAppearanceTheme = Appearance.getColorScheme() || 'light';
    setSystemTheme(currentAppearanceTheme);
    }
    setRefreshCounter(prev => prev + 1);
  };

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme && themePreference === 'system') {
        setSystemTheme(colorScheme as 'light' | 'dark');
      }
    });

    return () => {
      subscription.remove();
    };
  }, [themePreference]);

  // For Android, also check theme when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // App has come to the foreground
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        updateTheme();
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Additional polling for theme changes on Android emulators
  useEffect(() => {
    if (Platform.OS === 'android' && themePreference === 'system') {
      const interval = setInterval(() => {
        const currentAppearanceTheme = Appearance.getColorScheme();
        if (currentAppearanceTheme && currentAppearanceTheme !== systemTheme) {
          setSystemTheme(currentAppearanceTheme);
        }
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [systemTheme, themePreference]);

  // Force a refresh when refreshCounter changes
  useEffect(() => {
    if (refreshCounter > 0) {
      updateTheme();
    }
  }, [refreshCounter]);

  // Don't render until we've loaded
  if (isLoading) {
    return null;
  }

  const effectiveTheme = themePreference === 'system' ? systemTheme : themePreference;

  return (
    <ThemeContext.Provider value={{ 
      currentTheme: effectiveTheme, 
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