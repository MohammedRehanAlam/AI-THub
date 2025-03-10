import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, TextInput, Keyboard, Platform, Pressable } from 'react-native';
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

  // Handle external control of modal visibility
  React.useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    setModalVisible(false);
    setSearchQuery('');
    setSelectedIndex(-1);
    if (onClose) {
      onClose();
    }
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
    handleCloseModal();
    Keyboard.dismiss();
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
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
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: isDark ? '#333' : '#e0e0e0' }]}>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
                Select Language
              </Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { borderTopColor: isDark ? '#333' : '#e0e0e0' }]}>
              <Ionicons 
                name="search" 
                size={20} 
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
                    borderWidth: isDark ? 0 : 1,
                    borderColor: '#e0e0e0'
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
                  <Ionicons name="close-circle" size={20} color={isDark ? '#666' : '#999'} />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              ref={flatListRef}
              data={filteredLanguages}
              keyExtractor={(item) => item}
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
              keyboardShouldPersistTaps="handled"
              onScrollToIndexFailed={(info) => {
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
            />
          </View>
        </View>
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
  },
  selectedText: {
    fontSize: 16,
    flex: 1,
    paddingHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 'auto',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  searchIcon: {
    position: 'absolute',
    left: 24,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    paddingLeft: 40,
    paddingRight: 40,
    fontSize: 16,
  },
  clearSearch: {
    position: 'absolute',
    right: 24,
    zIndex: 1,
  },
  languageItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  languageText: {
    fontSize: 16,
  },
  selectedItem: {
    borderRadius: 8,
  },
  highlightedItem: {
    borderRadius: 8,
  },
});

export default LanguageSelector;