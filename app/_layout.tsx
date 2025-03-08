import React, { useEffect, useState } from 'react';
import { Platform, View } from 'react-native';
import { useColorScheme, Appearance } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
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
      {/* setting status bar transparent and hidden */}
      <StatusBar 
        translucent={true} 
        backgroundColor="transparent" 
        hidden={true}
        style={colorScheme === 'dark' ? 'light' : 'dark'} 
      />
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

  // Setup the color of the screen when opening the app
  useEffect(() => {
    const setupSystemUI = async () => {
      try {
        // Set system UI to be fully transparent
        await NavigationBar.setBackgroundColorAsync('transparent');
      } catch (error) {
        console.error('Error configuring system UI:', error);
      }
    };
    setupSystemUI();
  }, [currentColorScheme]);

  // Setup Navigation Bar behavior with animation timing matched to stack navigation
  useEffect(() => {
    const setupNavigationBar = async () => {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setButtonStyleAsync(currentColorScheme === 'dark' ? 'light' : 'dark');
        await NavigationBar.setBackgroundColorAsync('transparent');
      } catch (error) {
        console.error('Error configuring navigation bar:', error);
      }
    };
    setupNavigationBar();
  }, [currentColorScheme]); // Re-run when theme changes

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
          {/* only path is enough as i have made custom headers */}
          <Stack.Screen name="index" />
          <Stack.Screen name="tools/Box1" />
          <Stack.Screen name="tools/Box2" />
          <Stack.Screen name="tools/Box3" />
          <Stack.Screen name="tools/ComingSoon" />
          <Stack.Screen name="Settings" />
          <Stack.Screen name="APISettings" />
          <Stack.Screen name="About" />
          <Stack.Screen name="components/TranslatorApp" />
        </Stack>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}
