import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback, useRef } from 'react';
import { 
    useColorScheme, 
    Appearance, 
    Platform, 
    AppState, 
    AppStateStatus, 
    StatusBar as RNStatusBar,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import * as SystemUI from 'expo-system-ui';
import * as NavigationBar from 'expo-navigation-bar';
import { initializeUpdates, checkAndInstallUpdates } from './utils/updateUtils';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

export {
    ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
    initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const UI_HIDE_DELAY = 10000; // 10 seconds delay
// const UI_INTERACTION_RESET_DELAY = 3000; // 3 seconds after interaction before auto-hiding

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });

    const [statusBarVisible, setStatusBarVisible] = useState(true);
    const [navigationBarVisible, setNavigationBarVisible] = useState(false);
    const uiTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastInteractionTime = useRef<number>(Date.now());

    // Function to reset UI hide timer
    const resetUIHideTimer = useCallback(() => {
        // Clear existing timer
        if (uiTimer.current) {
            clearTimeout(uiTimer.current);
            uiTimer.current = null;
        }

        // Record current interaction time
        lastInteractionTime.current = Date.now();

        // Set new timer
        uiTimer.current = setTimeout(() => {
            // Check if enough time has passed since last interaction
            const timeSinceLastInteraction = Date.now() - lastInteractionTime.current;
            if (timeSinceLastInteraction >= UI_HIDE_DELAY) {
                setStatusBarVisible(false);
                setNavigationBarVisible(false);
            }
            uiTimer.current = null;
        }, UI_HIDE_DELAY);
    }, []);

    // Function to handle UI element visibility on interaction
    const handleUIInteraction = useCallback(() => {
        // Show UI elements
        setStatusBarVisible(true);
        setNavigationBarVisible(true);

        // Reset hide timer
        resetUIHideTimer();
    }, [resetUIHideTimer]);

    // Initial UI setup and timer
    useEffect(() => {
        // Set the navigation bar to transparent initially
        SystemUI.setBackgroundColorAsync('transparent');

        // Initial show and hide with delay
        handleUIInteraction();

        return () => {
            if (uiTimer.current) {
                clearTimeout(uiTimer.current);
            }
        };
    }, [handleUIInteraction]);

    // App state change effect
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                // When app becomes active, show and then hide UI elements again
                handleUIInteraction();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [handleUIInteraction]);

    // Navigation bar visibility effect
    useEffect(() => {
        NavigationBar.setVisibilityAsync(navigationBarVisible ? 'visible' : 'hidden');
    }, [navigationBarVisible]);

    // Handle font and splash screen loading
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
        <TouchableWithoutFeedback onPress={handleUIInteraction}>
            <View style={{ flex: 1 }}>
                <ExpoStatusBar 
                    hidden={!statusBarVisible} 
                    translucent={true} 
                    backgroundColor="transparent" 
                />
                <RootLayoutNav />
            </View>
        </TouchableWithoutFeedback>
    );
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
        initializeUpdates();
        checkAndInstallUpdates();
    }, []);

    // Configure system UI to follow system theme
    useEffect(() => {
        SystemUI.setBackgroundColorAsync(currentColorScheme === 'dark' ? '#000000' : '#ffffff');
    }, [currentColorScheme]);

    // Function to check and update the current theme
    const updateTheme = useCallback(() => {
        const newTheme = Appearance.getColorScheme() || 'light';

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

    // Update theme when colorScheme changes
    useEffect(() => {
        if (colorScheme) {
            setCurrentColorScheme(colorScheme);
        }
    }, [colorScheme]);

    // Handle app state and theme changes for Android
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            // App has come to the foreground
            if (
                appState.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                updateTheme();
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
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [currentColorScheme]);

    return (
        <CustomThemeProvider>
            <RNStatusBar
                barStyle={currentColorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent={true}
            />
            <ThemeProvider value={currentColorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Settings"
                        options={{
                            headerStyle: { backgroundColor: '#f4511e' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' },
                        }}
                    />
                    <Stack.Screen
                        name="About"
                        options={{
                            headerStyle: { backgroundColor: '#f4511e' },
                            headerTintColor: '#fff',
                            headerTitleStyle: { fontWeight: 'bold' },
                        }}
                    />
                </Stack>
            </ThemeProvider>
        </CustomThemeProvider>
    );
}