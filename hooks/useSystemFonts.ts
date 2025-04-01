import { useEffect, useState } from 'react';
import { Platform, NativeModules, AccessibilityInfo, PixelRatio } from 'react-native';

interface SystemFontSettings {
  fontScale: number;
  fontFamily: string;
  isBoldTextEnabled: boolean;
}

// Default system font families by platform
const DEFAULT_FONT_FAMILY = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export function useSystemFonts(): SystemFontSettings {
  const [fontScale, setFontScale] = useState<number>(PixelRatio.getFontScale());
  const [isBoldTextEnabled, setIsBoldTextEnabled] = useState<boolean>(false);
  const [fontFamily, setFontFamily] = useState<string>(DEFAULT_FONT_FAMILY);

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

    // Setup a listener for font scale changes (this runs when accessibility settings change)
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

  return {
    fontScale,
    fontFamily,
    isBoldTextEnabled,
  };
} 