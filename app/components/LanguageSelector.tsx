import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  StyleSheet, 
  TextInput, 
  Keyboard, 
  Platform, 
  Pressable,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LANGUAGES, Language } from './languages';

interface LanguageSelectorProps {
  selectedLanguage: Language;
  onSelect: (language: Language) => void;
  languages: Language[];
  isDark: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const BOTTOM_SHEET_MAX_HEIGHT = SCREEN_HEIGHT * 0.5;
const DRAG_THRESHOLD = 50;

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelect,
  languages = LANGUAGES,
  isDark,
  isOpen = false,
  onClose,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchInputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const translateY = useRef(new Animated.Value(BOTTOM_SHEET_MAX_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Handle external control of modal visibility
  useEffect(() => {
    if (isOpen) {
      openModal();
    }
  }, [isOpen]);

  // Create pan responder for dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0; // Only allow downward dragging
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_THRESHOLD) {
          // User dragged down enough to close
          closeModal();
        } else {
          // Snap back to open position
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
    })
  ).current;

  const openModal = () => {
    setModalVisible(true);
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Auto focus search input after animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }, 100);
  };

  const closeModal = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: BOTTOM_SHEET_MAX_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSearchQuery('');
      setSelectedIndex(-1);
      if (onClose) {
        onClose();
      }
    });
  };

  const filteredLanguages = (languages || []).filter(lang =>
    lang.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' && selectedIndex >= 0 && selectedIndex < filteredLanguages.length) {
      handleLanguageSelect(filteredLanguages[selectedIndex]);
    } else if (e.nativeEvent.key === 'Tab') {
      e.preventDefault();
      const nextIndex = (selectedIndex + 1) % filteredLanguages.length;
      setSelectedIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewPosition: 0.5
      });
    }
  };

  const handleLanguageSelect = (language: Language) => {
    onSelect(language);
    closeModal();
  };

  return (
    <View>
      <TouchableOpacity
        onPress={openModal}
        style={[
          styles.selector,
          { backgroundColor: isDark ? '#2d2d2d' : '#ffffff', borderWidth: isDark ? 0 : 1, borderColor: '#e0e0e0' }
        ]}
      >
        <Ionicons name="globe-outline" size={20} color={isDark ? '#fff' : '#000'} />
        <Text 
          style={[styles.selectedText, { color: isDark ? '#fff' : '#000' }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedLanguage}
        </Text>
        <Ionicons name="chevron-down" size={20} color={isDark ? '#fff' : '#000'} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay, 
            { opacity: backdropOpacity }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={closeModal}
          />
          
          <Animated.View 
            style={[
              styles.bottomSheet,
              { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' },
              { transform: [{ translateY: translateY }] }
            ]}
          >
            {/* Drag handle */}
            <View 
              {...panResponder.panHandlers}
              style={styles.dragHandleContainer}
            >
              <View style={[styles.dragHandle, { backgroundColor: isDark ? '#444' : '#ccc' }]} />
            </View>
            
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
                Select Language
              </Text>
              <TouchableOpacity 
                onPress={closeModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons 
                name="search" 
                size={18} 
                color={isDark ? '#666' : '#999'} 
                style={styles.searchIcon} 
              />
              <TextInput
                ref={searchInputRef}
                style={[
                  styles.searchInput,
                  { 
                    backgroundColor: isDark ? '#2d2d2d' : '#f5f5f5',
                    color: isDark ? '#fff' : '#000',
                  }
                ]}
                placeholder="Search language..."
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setSelectedIndex(-1);
                }}
                onKeyPress={handleKeyPress}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                keyboardType="default"
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={() => {
                  if (selectedIndex >= 0 && selectedIndex < filteredLanguages.length) {
                    handleLanguageSelect(filteredLanguages[selectedIndex]);
                  }
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity 
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedIndex(-1);
                    searchInputRef.current?.focus();
                  }}
                  style={styles.clearSearch}
                >
                  <Ionicons name="close-circle" size={18} color={isDark ? '#666' : '#999'} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              ref={flatListRef}
              data={filteredLanguages}
              keyExtractor={(item) => item}
              style={styles.listContainer}
              contentContainerStyle={styles.listContentContainer}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item, index }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.languageItem,
                    { borderBottomColor: isDark ? '#333' : '#e0e0e0' },
                    selectedLanguage === item && [
                      styles.selectedItem,
                      { backgroundColor: isDark ? '#0066cc' : '#007AFF' }
                    ],
                    selectedIndex === index && [
                      styles.highlightedItem,
                      { backgroundColor: isDark ? 'rgba(0, 102, 204, 0.3)' : 'rgba(0, 122, 255, 0.1)' }
                    ],
                    pressed && {
                      backgroundColor: isDark 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.05)'
                    }
                  ]}
                  onPress={() => handleLanguageSelect(item)}
                  android_ripple={{
                    color: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Text 
                    style={[
                      styles.languageText,
                      { color: isDark ? '#fff' : '#000' },
                      selectedLanguage === item && { color: '#fff', fontWeight: '500' }
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item}
                  </Text>
                </Pressable>
              )}
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
            />
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  dragHandleContainer: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4, // larger touch target
  },
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 26,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    paddingHorizontal: 40,
    fontSize: 16,
  },
  clearSearch: {
    position: 'absolute',
    right: 26,
    zIndex: 1,
  },
  listContainer: {
    maxHeight: BOTTOM_SHEET_MAX_HEIGHT - 140, // account for header and search
  },
  listContentContainer: {
    paddingBottom: 30,
  },
  languageItem: {
    padding: 16,
    borderBottomWidth: 0.5,
    marginHorizontal: 12,
  },
  languageText: {
    fontSize: 16,
  },
  selectedItem: {
    borderRadius: 8,
    marginHorizontal: 8,
  },
  highlightedItem: {
    borderRadius: 8,
  },
});

export default LanguageSelector;