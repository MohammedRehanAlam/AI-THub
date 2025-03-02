import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useColorScheme, Appearance, Platform, AppState, AppStateStatus, StatusBar } from 'react-native';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import * as SystemUI from 'expo-system-ui';
import { initializeUpdates, checkAndInstallUpdates } from './utils/updateUtils';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading keeps navigation state
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      try {
        SplashScreen.hideAsync();
      } catch (e) {
        console.error('Error hiding splash screen:', e);
      }
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // Get the initial theme
  const colorScheme = useColorScheme();
  const initialTheme = (Platform.OS === 'android' ? Appearance.getColorScheme() : colorScheme) || 'light';
  
  // State for the current theme
  const [currentColorScheme, setCurrentColorScheme] = useState(initialTheme);
  
  // Keep track of the app state
  const appState = useRef(AppState.currentState);

  // Initialize updates when the app starts
  useEffect(() => {
    // Initialize the Updates module
    initializeUpdates();
    
    // Check for updates when the app starts
    checkAndInstallUpdates();
  }, []);

  // Configure system UI to follow system theme
  useEffect(() => {
    // Set the system UI to follow the system theme
    SystemUI.setBackgroundColorAsync(currentColorScheme === 'dark' ? '#000000' : '#ffffff');
  }, [currentColorScheme]);

  // Function to check and update the current theme
  const updateTheme = useCallback(() => {
    // Get the current theme from the system
    const newTheme = Appearance.getColorScheme() || 'light';
    
    // Update the theme if it has changed
    if (newTheme !== currentColorScheme) {
      setCurrentColorScheme(newTheme);
    }
  }, [currentColorScheme]);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setCurrentColorScheme(colorScheme);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Also update when colorScheme changes
  useEffect(() => {
    if (colorScheme) {
      setCurrentColorScheme(colorScheme);
    }
  }, [colorScheme]);

  // For Android, also check theme when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // App has come to the foreground
      if (
        appState.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        updateTheme();
        
        // Also check for updates when the app comes to the foreground
        checkAndInstallUpdates(true); // Silent update check
      }
      
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [updateTheme]);

  // Additional polling for theme changes on Android emulators
  useEffect(() => {
    if (Platform.OS === 'android') {
      const interval = setInterval(() => {
        const currentAppearanceTheme = Appearance.getColorScheme();
        if (currentAppearanceTheme && currentAppearanceTheme !== currentColorScheme) {
          setCurrentColorScheme(currentAppearanceTheme);
        }
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [currentColorScheme]);

  return (
    <CustomThemeProvider>
      <StatusBar 
        barStyle={currentColorScheme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent={true}
      />
      <ThemeProvider value={currentColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}
