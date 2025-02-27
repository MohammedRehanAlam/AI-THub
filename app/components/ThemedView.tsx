import React, { useMemo } from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedViewProps extends ViewProps {
  children: React.ReactNode;
}

export default function ThemedView({ children, style, ...props }: ThemedViewProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  // Use useMemo to prevent unnecessary style recalculations
  const backgroundColor = useMemo(() => ({
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
  }), [isDark]);

  return (
    <View
      style={[
        backgroundColor,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
} 