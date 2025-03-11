import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';

type Props = {
  href: string;
  children: React.ReactNode;
  style?: StyleSheet.NamedStyles<any>;
};

export function ExternalLink({ href, style, children }: Props) {
  return (
    <Link
      href={href as any}
      style={style}
      target="_blank"
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    >
      <ThemedText style={{ textDecorationLine: 'underline' }}>{children}</ThemedText>
    </Link>
  );
}
