import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ModelSelectorProps {
  isDark: boolean;
  onModelSelect: (model: string) => void;
}

export interface ModelSelectorRef {
  reloadConfig: () => void;
}

interface APIConfig {
  openai: {
    key: string;
    baseUrl: string;
  };
  anthropic: {
    key: string;
  };
  google: {
    key: string;
    enabled: boolean;
  };
  azure: {
    baseUrl: string;
    deploymentName: string;
    apiKey: string;
    enabled: boolean;
  };
}

export const ModelSelector = forwardRef<ModelSelectorRef, ModelSelectorProps>(
  ({ isDark, onModelSelect }, ref) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      reloadConfig: loadAPIConfig
    }));

    useEffect(() => {
      loadAPIConfig();
    }, []);

    const loadAPIConfig = async () => {
      try {
        const savedConfig = await AsyncStorage.getItem('apiConfig');
        if (savedConfig) {
          const config: APIConfig = JSON.parse(savedConfig);
          const models: string[] = [];
          
          // Check which providers are enabled or have keys
          if (config.openai.key) {
            models.push('OpenAI');
          }
          
          if (config.anthropic.key) {
            models.push('Anthropic');
          }
          
          if (config.google.enabled && config.google.key) {
            models.push('Google AI');
          }
          
          if (config.azure.enabled && config.azure.apiKey) {
            models.push(config.azure.deploymentName || 'Azure OpenAI');
          }
          
          setAvailableModels(models);
          
          // Auto-select the first model if only one is available
          if (models.length === 1) {
            setSelectedModel(models[0]);
            onModelSelect(models[0]);
          } else if (models.length > 1) {
            // Try to restore previously selected model
            const savedModel = await AsyncStorage.getItem('selectedModel');
            if (savedModel && models.includes(savedModel)) {
              setSelectedModel(savedModel);
              onModelSelect(savedModel);
            } else {
              setSelectedModel(models[0]);
              onModelSelect(models[0]);
            }
          } else {
            // No models available
            setSelectedModel(null);
          }
        }
      } catch (error) {
        console.error('Error loading API configuration:', error);
      }
    };

    const handleModelSelect = async (model: string) => {
      setSelectedModel(model);
      setIsDropdownOpen(false);
      onModelSelect(model);
      
      // Save the selected model
      try {
        await AsyncStorage.setItem('selectedModel', model);
      } catch (error) {
        console.error('Error saving selected model:', error);
      }
    };

    const toggleDropdown = () => {
      // Always reload config when opening dropdown to ensure we have the latest settings
      loadAPIConfig();
      
      // Toggle dropdown state
      setIsDropdownOpen(!isDropdownOpen);
    };

    // Function to truncate text if it's too long
    const truncateText = (text: string, maxLength: number = 12) => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength - 3) + '...';
    };

    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={[
            styles.selectorButton,
            { 
              backgroundColor: isDark ? '#333' : '#f0f0f0',
              borderColor: isDark ? '#444' : '#ddd'
            }
          ]}
          onPress={toggleDropdown}
        >
          <Text style={[styles.selectedText, { color: isDark ? '#fff' : '#000' }]}>
            {selectedModel ? truncateText(selectedModel) : 'Select Model'}
          </Text>
          <Ionicons 
            name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={isDark ? '#fff' : '#000'} 
          />
        </TouchableOpacity>

        <Modal
          visible={isDropdownOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDropdownOpen(false)}
        >
          <Pressable 
            style={[
              styles.modalOverlay,
              { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
            ]}
            onPress={() => setIsDropdownOpen(false)}
          >
            <View 
              style={[
                styles.dropdown,
                { 
                  backgroundColor: isDark ? '#333' : '#fff',
                  borderColor: isDark ? '#444' : '#ddd',
                }
              ]}
            >
              {availableModels.length > 0 ? (
                <FlatList
                  data={availableModels}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <Pressable
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        pressed && { backgroundColor: isDark ? '#444' : '#f0f0f0' },
                        selectedModel === item && { 
                          backgroundColor: isDark ? '#555' : '#e0e0e0' 
                        }
                      ]}
                      onPress={() => handleModelSelect(item)}
                    >
                      <Text style={{ color: isDark ? '#fff' : '#000' }}>{item}</Text>
                      {selectedModel === item && (
                        <Ionicons name="checkmark" size={16} color={isDark ? '#fff' : '#000'} />
                      )}
                    </Pressable>
                  )}
                />
              ) : (
                <View style={styles.noModelsContainer}>
                  <Text style={{ color: isDark ? '#fff' : '#000', textAlign: 'center' }}>
                    No API providers enabled.
                  </Text>
                  <Text style={{ color: isDark ? '#ccc' : '#666', textAlign: 'center', marginTop: 8 }}>
                    Please go to Settings to add your credentials.
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.settingsButton,
                      { backgroundColor: isDark ? '#444' : '#e0e0e0' }
                    ]}
                    onPress={() => {
                      setIsDropdownOpen(false);
                      // We'll handle this in the parent component
                      onModelSelect('OPEN_SETTINGS');
                    }}
                  >
                    <Text style={{ color: isDark ? '#fff' : '#000' }}>Open Settings</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Pressable>
        </Modal>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 150,
    justifyContent: 'space-between',
  },
  selectedText: {
    fontSize: 14,
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    position: 'absolute',
    right: 16, // Position from right edge
    top: 60, // Adjust based on your header height
    width: 200,
    maxHeight: 300,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  noModelsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  settingsButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
}); 