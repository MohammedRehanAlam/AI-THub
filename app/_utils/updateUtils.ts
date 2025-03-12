import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

/**
 * Checks for updates and returns whether an update is available
 */
export async function checkForUpdates(): Promise<boolean> {
  try {
    // Skip in development
    if (__DEV__) {
      return false;
    }
    
    const update = await Updates.checkForUpdateAsync();
    return update.isAvailable;
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
}

/**
 * Fetches and installs an available update
 */
export async function fetchAndInstallUpdate(): Promise<boolean> {
  try {
    const { isNew } = await Updates.fetchUpdateAsync();
    return isNew;
  } catch (error) {
    console.error('Error fetching update:', error);
    return false;
  }
}

/**
 * Restarts the app to apply the installed update
 */
export function reloadApp(): void {
  try {
    Updates.reloadAsync();
  } catch (error) {
    console.error('Error reloading app:', error);
  }
}

/**
 * Checks for updates and prompts the user to install if available
 */
export async function checkAndInstallUpdates(silent: boolean = false): Promise<void> {
  try {
    // Skip update checks in development
    if (__DEV__) {
      console.log('Skipping update check in development');
      return;
    }

    const isUpdateAvailable = await checkForUpdates();
    
    if (isUpdateAvailable) {
      if (!silent) {
        Alert.alert(
          'Update Available',
          'A new version of the app is available. Would you like to update now?',
          [
            {
              text: 'Later',
              style: 'cancel',
            },
            {
              text: 'Update',
              onPress: async () => {
                const isNewUpdate = await fetchAndInstallUpdate();
                if (isNewUpdate) {
                  Alert.alert(
                    'Update Downloaded',
                    'The update has been downloaded. The app will now restart to apply the changes.',
                    [
                      {
                        text: 'OK',
                        onPress: reloadApp,
                      },
                    ],
                    { cancelable: false }
                  );
                }
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        // Silent update
        const isNewUpdate = await fetchAndInstallUpdate();
        if (isNewUpdate) {
          reloadApp();
        }
      }
    }
  } catch (error) {
    console.error('Error in update process:', error);
  }
}

/**
 * Initialize the Updates module
 */
export function initializeUpdates(): void {
  if (!__DEV__) {
    try {
      console.log('Updates module initialized');
      
      // For expo-updates 0.27.x, we don't need to add event listeners
      // as the update checking is handled differently
    } catch (error) {
      console.error('Error initializing updates:', error);
    }
  }
}

// Add a default export to satisfy Expo Router's requirements
export default function UpdateUtils() {
  return null;
} 