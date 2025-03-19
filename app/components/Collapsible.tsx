import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ThemedText from './ThemedText';
import { useTheme } from '../context/ThemeContext';

export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  // // Check content length to determine width
  // const contentLength = children ? String(children).length : 0;
  // const contentWidth = contentLength < 50 ? 240 : 'auto';
  
  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <View
          style={[{
            transform: [{ rotate: isOpen ? '90deg' : '0deg' }],
            marginRight: 6
          }]}
        >
          {/* Use a simple character instead of IconSymbol for compatibility
          <ThemedText>▶</ThemedText> */}
          {/* Using Ionicons for better visual appearance */}
          <Ionicons name="chevron-forward" size={16} color={isDark ? '#fff' : '#000'} />
        </View>

        <ThemedText type="title">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && (
        <View style={[styles.contentWrapper, { minWidth: isOpen ? '100%' : 'auto' }]}>
          <View style={[styles.verticalLine, { backgroundColor: isDark ? 'rgba(150,150,150,0.3)' : 'rgba(150,150,150,0.5)' }]} />
          <View style={styles.content}>{children}</View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  contentWrapper: {
    flexDirection: 'row',
    // marginTop: 7,
  },
  verticalLine: {
    width: 2,
    marginLeft: 11,
    marginRight: 10,
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    marginRight: 10,
    // paddingRight: 10,
  },
});
