import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type FontStyle = 'normal' | 'regular' | 'semibold' | 'bold' | 'title' | 'subtitle' | 'link';

interface SystemTextProps extends TextProps {
  style?: TextStyle | TextStyle[];
  fontStyle?: FontStyle;
  allowFontScaling?: boolean;
}

export default function SystemText({
  children,
  style,
  fontStyle = 'normal',
  allowFontScaling = true,
  ...rest
}: SystemTextProps) {
  const { currentTheme, fontScale, fontFamily, isBoldTextEnabled } = useTheme();
  const isDark = currentTheme === 'dark';
  
  // Determine if we should use bold text based on accessibility settings
  const shouldUseBoldText = isBoldTextEnabled && ['normal', 'regular', 'semibold'].includes(fontStyle);

  // Compute style based on fontStyle
  const getFontStyleStyles = (): TextStyle => {
    // Base font size before scaling
    const baseFontSizes = {
      normal: 16,
      regular: 16,
      semibold: 16,
      bold: 16,
      title: 24,
      subtitle: 20,
      link: 16,
    };

    // Font weight based on style and accessibility settings
    const fontWeights = {
      normal: shouldUseBoldText ? '600' : '400',
      regular: shouldUseBoldText ? '600' : '400',
      semibold: shouldUseBoldText ? '700' : '600',
      bold: '700',
      title: '700',
      subtitle: '600',
      link: shouldUseBoldText ? '600' : '400',
    };

    // Apply fontScale to the base font size
    const scaledFontSize = baseFontSizes[fontStyle] * (allowFontScaling ? fontScale : 1);

    return {
      fontFamily,
      fontSize: scaledFontSize,
      fontWeight: fontWeights[fontStyle],
      color: isDark ? '#fff' : '#000',
      ...(fontStyle === 'link' && { color: isDark ? '#7eb6ff' : '#0a7ea4' }),
    };
  };

  return (
    <Text
      {...rest}
      allowFontScaling={allowFontScaling}
      style={[
        getFontStyleStyles(),
        style,
      ]}
    >
      {children}
    </Text>
  );
} 