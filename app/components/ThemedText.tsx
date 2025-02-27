import React, { useMemo } from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
  type?: 'title' | 'link';
}

export default function ThemedText({ children, style, type, ...props }: ThemedTextProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  // Use useMemo to prevent unnecessary style recalculations
  const styles = useMemo(() => {
    const baseStyle = {
      color: isDark ? '#ffffff' : '#000000',
    };

    const typeStyles = {
      title: {
        fontSize: 20,
        fontWeight: 'bold' as const,
      },
      link: {
        color: isDark ? '#4e9eff' : '#007AFF',
        textDecorationLine: 'underline' as const,
      },
    };

    return {
      baseStyle,
      typeStyle: type ? typeStyles[type] : undefined
    };
  }, [isDark, type]);

  return (
    <Text
      style={[
        styles.baseStyle,
        styles.typeStyle,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
} 