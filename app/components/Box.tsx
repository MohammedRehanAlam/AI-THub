import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Platform, useWindowDimensions } from 'react-native';

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
    // Calculate maximum possible columns based on minimum box width
    const maxPossibleColumns = Math.floor((availableWidth + GAP) / (MINIMUM_BOX_WIDTH + GAP));
    // Limit columns based on orientation
    numColumns = isPortrait ? Math.min(2, maxPossibleColumns) : Math.min(4, maxPossibleColumns);
    // Calculate box width based on number of columns
    boxWidth = (availableWidth - (GAP * (numColumns - 1))) / numColumns;
    // Ensure box width doesn't exceed maximum
    boxWidth = Math.min(boxWidth, MAXIMUM_BOX_WIDTH);
  }

  const styles = StyleSheet.create({
    box: {
      width: boxWidth,
      height: 250,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 8,
      borderWidth: 5,
      borderColor: '#8888',
      marginHorizontal: numColumns === 1 ? 0 : GAP / 2,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
        android: {
          elevation: 5,
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
      }),
    },
    text: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      width: '100%',
      paddingHorizontal: 10,
    },
  });

  return (
    <TouchableOpacity
      style={[
        styles.box,
        { backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa' },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default Box;