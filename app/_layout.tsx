import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useColorScheme, Appearance, Platform, View, StatusBar } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { initializeUpdates, checkAndInstallUpdates } from './utils/updateUtils';

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

  const colorScheme = useColorScheme();

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

  return (
    <View style={{ flex: 1 }}>
      <StatusBar translucent backgroundColor='transparent' />
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

  useEffect(() => {
    const setupSystemUI = async () => {
      try {
        await SystemUI.setBackgroundColorAsync('transparent');
        await NavigationBar.setBackgroundColorAsync(currentColorScheme === 'dark' ? 'rgba(45, 45, 45, 0.8)' : 'rgba(248, 249, 250, 0.8)');
        await NavigationBar.setButtonStyleAsync(currentColorScheme === 'dark' ? 'light' : 'dark');
        await NavigationBar.setBorderColorAsync('transparent');
        await NavigationBar.setVisibilityAsync('visible');
      } catch (error) {
        console.error('Error configuring system UI:', error);
      }
    };

    setupSystemUI();
  }, [currentColorScheme, colorScheme]);

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

  const customScreenOptions = {
    headerShown: false,
            animation: 'fade',
            presentation: 'card',
            animationDuration: 200,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            contentStyle: {
              backgroundColor: currentColorScheme === 'dark' ? '#1a1a1a' : '#fff',
            },
            fullScreenGestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts, closing }) => ({
      cardStyle: {
        transform: [
          {
            translateX: current.progress.interpolate({
              inputRange: [0, 1],
                      outputRange: [layouts.screen.width * (closing ? -0.3 : 0.3), 0],
            }),
          },
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1],
            }),
          },
        ],
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
                  outputRange: [0, 1],
        }),
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
                  outputRange: [0, 0.5],
        }),
      },
    }),
  };

  return (
    <CustomThemeProvider>
      <ThemeProvider value={currentColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={customScreenOptions}>
          <Stack.Screen name="index" />
          <Stack.Screen name="Settings" />
          <Stack.Screen name="APISettings" />
          <Stack.Screen name="About" />
          <Stack.Screen name="tools/Box1" /> {/* Translator */}
          <Stack.Screen name="tools/Box2" />
          <Stack.Screen name="tools/Box3" />
          <Stack.Screen name="tools/ComingSoon" />
        </Stack>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}
