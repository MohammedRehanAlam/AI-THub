import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useColorScheme, Appearance, Platform, AppState, AppStateStatus, TouchableWithoutFeedback, View, StatusBar } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFonts } from 'expo-font';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { initializeUpdates, checkAndInstallUpdates } from './utils/updateUtils';
import { StackCardStyleInterpolator, TransitionPresets } from '@react-navigation/stack';
import { useRouter } from 'expo-router';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const UI_HIDE_DELAY = 5000; // 5 second delay
const UI_INTERACTION_RESET_DELAY = 3000; // 3 second after interaction before auto-hiding

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Initially, both UI elements are visible.
  const [statusBarVisible, setStatusBarVisible] = useState(true);
  const [navigationBarVisible, setNavigationBarVisible] = useState(true);
  const uiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionTime = useRef<number>(Date.now());
  const colorScheme = useColorScheme();

  // Reset the UI hide timer and record the latest interaction time.
  const resetUIHideTimer = useCallback(() => {
    if (uiTimer.current) {
      clearTimeout(uiTimer.current);
      uiTimer.current = null;
    }
    lastInteractionTime.current = Date.now();
    uiTimer.current = setTimeout(() => {
      const timeSinceLastInteraction = Date.now() - lastInteractionTime.current;
      if (timeSinceLastInteraction >= UI_INTERACTION_RESET_DELAY) {
        setStatusBarVisible(false);
        setNavigationBarVisible(false);
      }
      uiTimer.current = null;
    }, UI_HIDE_DELAY);
  }, []);

  // On any UI interaction, show the UI elements and reset the hide timer.
  const handleUIInteraction = useCallback(() => {
    setStatusBarVisible(true);
    setNavigationBarVisible(true);
    resetUIHideTimer();
  }, [resetUIHideTimer]);

  const showStatusBar = () => setStatusBarVisible(true);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // Handle app state changes if needed
  };

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

  // Set up the system UI and navigation bar on mount.
  useEffect(() => {
    // Trigger UI interaction to start the timer.
    handleUIInteraction();

    return () => {
      if (uiTimer.current) {
        clearTimeout(uiTimer.current);
      }
    };
  }, [handleUIInteraction, colorScheme]);

  // When the app state changes (e.g. comes to the foreground), reapply the UI interaction.
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        handleUIInteraction();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [handleUIInteraction]);

  useEffect(() => {
    const hideStatusBar = setTimeout(() => {
      setStatusBarVisible(false);
    }, UI_HIDE_DELAY);

    // Add event listeners for user interactions
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      clearTimeout(hideStatusBar);
      subscription.remove();
    };
  }, []);

  // Update the navigation bar visibility and style when state or theme changes.
  useEffect(() => {
    NavigationBar.setVisibilityAsync(navigationBarVisible ? 'visible' : 'visible');
    NavigationBar.setBackgroundColorAsync('transparent');
    NavigationBar.setBorderColorAsync('transparent');
    NavigationBar.setButtonStyleAsync(colorScheme === 'dark' ? 'light' : 'dark');
  }, [navigationBarVisible, colorScheme]);

  if (!loaded) {
    return null;
  }

  return (
    <TouchableWithoutFeedback onPress={handleUIInteraction}>
      <View style={{ flex: 1 }}>
        <StatusBar translucent backgroundColor='transparent' />
        <RootLayoutNav />
      </View>
    </TouchableWithoutFeedback>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const initialTheme = (Platform.OS === 'android' ? Appearance.getColorScheme() : colorScheme) || 'light';
  const [currentColorScheme, setCurrentColorScheme] = useState(initialTheme);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    initializeUpdates();
    checkAndInstallUpdates();
  }, []);

  // Configure the system UI and navigation bar to match the current theme. change the background color to match the theme during the transition
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(currentColorScheme === 'dark' ? 'transparent' : 'transparent');
    NavigationBar.setBackgroundColorAsync('transparent'); 
    NavigationBar.setBorderColorAsync('transparent'); 
    NavigationBar.setButtonStyleAsync(currentColorScheme === 'dark' ? 'light' : 'dark'); 
  }, [currentColorScheme, colorScheme]);

  const updateTheme = useCallback(() => {
    const newTheme = Appearance.getColorScheme() || 'light';
    if (newTheme !== currentColorScheme) {
      setCurrentColorScheme(newTheme);
    }
  }, [currentColorScheme]); 

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

  useEffect(() => {
    if (colorScheme) {
      setCurrentColorScheme(colorScheme);
    }
  }, [colorScheme]);

  // Update the theme and check for updates when the app comes to the foreground.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        updateTheme();
        checkAndInstallUpdates(true);
      }
      appState.current = nextAppState;
    });
    return () => {
      subscription.remove();
    };
  }, [updateTheme]);

  // For Android emulators: poll for theme changes.
  useEffect(() => {
    if (Platform.OS === 'android') {
      const interval = setInterval(() => {
        const currentAppearanceTheme = Appearance.getColorScheme();
        if (currentAppearanceTheme && currentAppearanceTheme !== currentColorScheme) {
          setCurrentColorScheme(currentAppearanceTheme);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentColorScheme]);

  const isDark = currentColorScheme === 'dark';

  return (
    <CustomThemeProvider>
      <StatusBar translucent backgroundColor='transparent' barStyle={currentColorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ThemeProvider value={currentColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            presentation: 'modal',
            animationDuration: 200,
            cardStyleInterpolator: (({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      scale: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.85, 1],
                      }),
                    },
                  ],
                  opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              };  
            }) as StackCardStyleInterpolator,
          }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="Settings" />
          <Stack.Screen name="APISettings" />
          <Stack.Screen name="About" />
          <Stack.Screen name="Box1"/> // translator 
          <Stack.Screen name="Box2"/>
          <Stack.Screen name="Box3"/>
          <Stack.Screen name="ComingSoon"/>
        </Stack> 
      </ThemeProvider>
    </CustomThemeProvider>
  );
}
