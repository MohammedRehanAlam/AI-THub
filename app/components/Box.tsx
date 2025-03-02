import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, Text, Modal, View, Platform, useWindowDimensions } from 'react-native';
import TranslatorApp from './TranslatorApp';

interface BoxProps {
  number: number;
  isDark: boolean;
  onPress: () => void;
  totalBoxes: number;
}

export function Box({ number, isDark, onPress, totalBoxes }: BoxProps) {
  const [isTranslatorOpen, setIsTranslatorOpen] = useState(false);
  const { width, height } = useWindowDimensions();

  const handlePress = () => {
    if (number === 1) {
      setIsTranslatorOpen(true);
    } else {
      onPress();
    }
  };

  const handleCloseTranslator = () => {
    setIsTranslatorOpen(false);
  };

  // Add a small delay when opening to ensure smooth animation
  const handleOpenTranslator = () => {
    setTimeout(() => {
      setIsTranslatorOpen(true);
    }, 100);
  };

  const isLastBox = number === totalBoxes;

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
    modalContainer: {
      flex: 1,
      backgroundColor: 'white',
    },
  });

  return (
    <>
      <TouchableOpacity
        style={[
          styles.box,
          { backgroundColor: isDark ? '#2d2d2d' : '#f8f9fa' },
        ]}
        onPress={number === 1 ? handleOpenTranslator : handlePress}
      >
        <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>
          {number === 1 ? 'Translator' : isLastBox ? 'Coming Soon...' : `Box ${number}`}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isTranslatorOpen}
        animationType="slide"
        onRequestClose={handleCloseTranslator}
      >
        <View style={styles.modalContainer}>
          <TranslatorApp onClose={handleCloseTranslator} />
        </View>
      </Modal>
    </>
  );
}

export default Box; 