import { Text, type TextProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import SystemText from '../app/components/SystemText';
import { useTheme } from '../app/context/ThemeContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  allowFontScaling?: boolean;
};

// Map ThemedText types to SystemText fontStyles
const typeToFontStyleMap = {
  default: 'normal',
  defaultSemiBold: 'semibold',
  title: 'title',
  subtitle: 'subtitle',
  link: 'link',
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  allowFontScaling = true,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { fontScale } = useTheme();
  
  // Convert ThemedText type to SystemText fontStyle
  const fontStyle = typeToFontStyleMap[type] as any;

  return (
    <SystemText
      style={[
        { color },
        style,
      ]}
      fontStyle={fontStyle}
      allowFontScaling={allowFontScaling}
      {...rest}
    />
  );
}

// Keep the old styles for backward compatibility in case we need them
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
