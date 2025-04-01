import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme, Appearance, Platform, AppState, AppStateStatus, StatusBar, PixelRatio, AccessibilityInfo } from 'react-native';
import * as SystemUI from 'expo-system-ui';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  currentTheme: 'light' | 'dark';
  themePreference: ThemeType;
  setTheme: (theme: ThemeType) => void;
  forceRefresh: () => void;
  fontScale: number;
  fontFamily: string;
  isBoldTextEnabled: boolean;
  useSystemFonts: boolean;
  setUseSystemFonts: (value: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';
const SYSTEM_FONTS_PREFERENCE_KEY = '@system_fonts_preference';

// Default system font families by platform
const DEFAULT_FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(colorScheme || 'light');
  const [themePreference, setThemePreference] = useState<ThemeType>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const appState = useRef(AppState.currentState);
  
  // Implement system fonts functionality directly
  const [fontScale, setFontScale] = useState<number>(PixelRatio.getFontScale());
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<string>(DEFAULT_FONT_FAMILY);
  
  const [useSystemFonts, setUseSystemFontsState] = useState(true);
  
  // Default font settings (used when not using system fonts)
  const [defaultFontSettings, setDefaultFontSettings] = useState({
    fontScale: 1,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    isBoldTextEnabled: false
  });

  // Monitor system font settings
  useEffect(() => {
    // Get initial font scale
    const initialFontScale = PixelRatio.getFontScale();
    setFontScale(initialFontScale);

    // Check if bold text is enabled in accessibility settings
    AccessibilityInfo.isBoldTextEnabled().then(enabled => {
      setIsBoldTextEnabled(enabled);
    });
    
    // Listen for font scale changes
    const fontChangeSubscription = AccessibilityInfo.addEventListener(
      'boldTextChanged',
      enabled => {
        setIsBoldTextEnabled(enabled);
      }
    );

    // Setup a listener for font scale changes
    if (Platform.OS === 'ios') {
      // iOS provides direct notification for font scale changes
      const fontScaleChangedSubscription = AccessibilityInfo.addEventListener(
        'reduceMotionChanged', // We use this as a proxy since there's no direct fontScaleChanged event
        () => {
          const newFontScale = PixelRatio.getFontScale();
          setFontScale(newFontScale);
        }
      );
      
      return () => {
        fontChangeSubscription.remove();
        fontScaleChangedSubscription.remove();
      };
    } else {
      // For Android, we'll use a polling approach for font scale
      const interval = setInterval(() => {
        const newFontScale = PixelRatio.getFontScale();
        if (newFontScale !== fontScale) {
          setFontScale(newFontScale);
        }
      }, 1000); // Check every second
      
      return () => {
        fontChangeSubscription.remove();
        clearInterval(interval);
      };
    }
  }, [fontScale]);

  // System fonts settings object
  const systemFonts = {
    fontScale,
    fontFamily,
    isBoldTextEnabled
  };

  // Derived font settings based on user preference
  const fontSettings = useSystemFonts ? systemFonts : defaultFontSettings;

  // Load saved preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Load theme preference
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme) {
          setThemePreference(savedTheme as ThemeType);
        }
        
        // Load system font preference
        const savedFontPreference = await AsyncStorage.getItem(SYSTEM_FONTS_PREFERENCE_KEY);
        if (savedFontPreference !== null) {
          setUseSystemFontsState(savedFontPreference === 'true');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  // Function to update system font preference
  const setUseSystemFonts = async (value: boolean) => {
    try {
      await AsyncStorage.setItem(SYSTEM_FONTS_PREFERENCE_KEY, value.toString());
      setUseSystemFontsState(value);
    } catch (error) {
      console.error('Error saving system fonts preference:', error);
    }
  };

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
      forceRefresh,
      fontScale: fontSettings.fontScale,
      fontFamily: fontSettings.fontFamily,
      isBoldTextEnabled: fontSettings.isBoldTextEnabled,
      useSystemFonts,
      setUseSystemFonts
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