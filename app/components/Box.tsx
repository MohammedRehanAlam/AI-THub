import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Platform, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BoxProps {
  isDark: boolean;
  onPress: () => void;
  title?: string;
}

export function Box({ isDark, onPress, title }: BoxProps) {
  const { width, height } = useWindowDimensions();

  // Constants for responsive layout
  const MINIMUM_SCREEN_WIDTH_FOR_TWO_COLUMNS = 318;  // 350 - 32 = 318 is the minimum width for two columns
  const MINIMUM_BOX_WIDTH = 150;
  const MAXIMUM_BOX_WIDTH = 300;
  const SCREEN_PADDING = 32;
  const GAP = 16;

  // Calculate available width for boxes
  const availableWidth = width - SCREEN_PADDING;
  const isPortrait = height > width;

  // Dynamic column calculation
  let numColumns;
  let boxWidth;

  // Calculate number of columns based on screen width
  if (availableWidth < MINIMUM_SCREEN_WIDTH_FOR_TWO_COLUMNS) {
    numColumns = 1;
    boxWidth = availableWidth;
  } else {
    const maxPossibleColumns = Math.floor((availableWidth + GAP) / (MINIMUM_BOX_WIDTH + GAP));
    numColumns = isPortrait ? Math.min(2, maxPossibleColumns) : Math.min(4, maxPossibleColumns);
    boxWidth = (availableWidth - (GAP * (numColumns - 1))) / numColumns;
    boxWidth = Math.min(boxWidth, MAXIMUM_BOX_WIDTH);
  }

  const styles = StyleSheet.create({
    box: {
      width: boxWidth,
      height: boxWidth * 1.37,
      borderRadius: 20,
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 8,
      borderWidth: 5,
      borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      marginHorizontal: GAP / 2,
      padding: 20,
      backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa',
      ...Platform.select({
        ios: {
          shadowColor: isDark ? '#000' : '#666',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
        },
        android: {
          elevation: 8,
        },
        default: {
          shadowColor: isDark ? '#000' : '#666',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        },
      }),
    },
    boxContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    iconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      width: '100%',
      paddingHorizontal: 10,
      color: isDark ? '#fff' : '#000',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      textAlign: 'center',
      color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
      paddingHorizontal: 10,
    },
    arrowContainer: {
      width: '100%',
      alignItems: 'flex-end',
      paddingRight: 4,
    },
  });

  // Get the appropriate icon based on the title
  const getIcon = () => {
    switch (title?.toLowerCase()) {
      case 'translator':
        return 'language-outline';
      case 'box 2 two':
        return 'cube-outline';
      case 'box 3 three':
        return 'grid-outline';
      case 'coming soon':
        return 'time-outline';
      default:
        return 'apps-outline';
    }
  };

  // Get the appropriate subtitle based on the title
  const getSubtitle = () => {
    switch (title?.toLowerCase()) {
      case 'translator':
        return 'AI-Powered Translation';
      case 'box 2 two':
        return 'Coming Soon';
      case 'box 3 three':
        return 'Coming Soon';
      case 'coming soon':
        return 'Stay Tuned!';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity
      style={styles.box}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.boxContent}>
        <View style={styles.iconContainer}>
          <Ionicons name={getIcon()} size={30} color={isDark ? '#fff' : '#000'} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{getSubtitle()}</Text>
      </View>
      {/* <View style={styles.arrowContainer}>
        <Ionicons 
          name="chevron-forward-outline" 
          size={24} 
          color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'} 
        />
      </View> */}
    </TouchableOpacity>
  );
}

export default Box;