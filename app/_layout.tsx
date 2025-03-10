import React, { useEffect, useState } from 'react';
import { Platform, View, StatusBar as RNStatusBar } from 'react-native';
import { useColorScheme, Appearance } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { initializeUpdates, checkAndInstallUpdates } from './_utils/updateUtils';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  // Enhanced error handling for production
  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      // You might want to implement crash reporting here
      // Example: Crashlytics.recordError(error);
    }
  }, [error]);
  
  useEffect(() => {
    if (loaded) {
      try {
        SplashScreen.hideAsync();
      } catch (e) {
        console.error('Error hiding splash screen:', e);
        // Production error logging
        // Example: Crashlytics.recordError(e);
      }
    }
  }, [loaded]);
  
  if (!loaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <RootLayoutNav />
    </View>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const initialTheme = (Platform.OS === 'android' ? Appearance.getColorScheme() : colorScheme) || 'light';
  const [currentColorScheme, setCurrentColorScheme] = useState(initialTheme);

  useEffect(() => {
    initializeUpdates();
    checkAndInstallUpdates();
  }, []);
  
  // Configure system UI on app start and theme changes
  useEffect(() => {
    const configureSystemUI = async () => {
      try {
        if (Platform.OS === 'android') {
          // Configure status bar using React Native's StatusBar API
          RNStatusBar.setTranslucent(true);
          RNStatusBar.setBackgroundColor('transparent');
          RNStatusBar.setHidden(true);
          RNStatusBar.setBarStyle(currentColorScheme === 'dark' ? 'light-content' : 'dark-content');
          
          // Configure navigation bar using expo-navigation-bar
          await NavigationBar.setBackgroundColorAsync('transparent');
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
          await NavigationBar.setButtonStyleAsync(currentColorScheme === 'dark' ? 'light' : 'dark');
        }
      } catch (error) {
        console.error('Error configuring system UI:', error);
      }
    };
    
    configureSystemUI();
  }, [currentColorScheme]);

  // Listen for theme changes
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

  const customScreenOptions: NativeStackNavigationOptions = {
    headerShown: false,
    animation: 'fade',
    presentation: 'card',
    animationDuration: 200,
    gestureEnabled: true,
    gestureDirection: 'horizontal' as any, // Type assertion to fix TypeScript error
    contentStyle: {
      backgroundColor: currentColorScheme === 'dark' ? '#1a1a1a' : '#fff',
    },
    fullScreenGestureEnabled: true,
    // Using as any to bypass type checking for custom navigation options
  };

  return (
    <CustomThemeProvider>
      <ThemeProvider value={currentColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={customScreenOptions as any}>
          {/* only path is enough as i have made custom headers */}
          <Stack.Screen name="index" />
          <Stack.Screen name="Settings" />
          <Stack.Screen name="APISettings" />
          <Stack.Screen name="About" />
          
          <Stack.Screen name="tools/Box1" />
          <Stack.Screen name="tools/Box2" />
          <Stack.Screen name="tools/Box3" />
          <Stack.Screen name="tools/ComingSoon" />
        </Stack>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}
