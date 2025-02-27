import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsProps {
  visible: boolean;
  onClose: () => void;
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

export function Settings({ visible, onClose }: SettingsProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  
  const [apiConfig, setApiConfig] = useState<APIConfig>({
    openai: {
      key: '',
      baseUrl: '',
    },
    anthropic: {
      key: '',
    },
    google: {
      key: '',
      enabled: false,
    },
    azure: {
      baseUrl: '',
      deploymentName: '',
      apiKey: '',
      enabled: false,
    },
  });

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('apiConfig', JSON.stringify(apiConfig));
      onClose();
    } catch (error) {
      console.error('Error saving API configuration:', error);
    }
  };

  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        const savedConfig = await AsyncStorage.getItem('apiConfig');
        if (savedConfig) {
          setApiConfig(JSON.parse(savedConfig));
        }
      } catch (error) {
        console.error('Error loading API configuration:', error);
      }
    };
    loadConfig();
  }, []);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View 
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#2d2d2d' : '#ffffff' }
          ]}
        >
          <View style={[
            styles.modalHeader,
            { borderBottomColor: isDark ? '#444' : '#e0e0e0' }
          ]}>
            <Text style={[
              styles.modalTitle,
              { color: isDark ? '#fff' : '#000' }
            ]}>
              Settings
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons 
                name="close" 
                size={24} 
                color={isDark ? '#fff' : '#000'} 
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* OpenAI Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                OpenAI API Key
              </Text>
              <Text style={[styles.sectionDescription, { color: isDark ? '#ddd' : '#666' }]}>
                You can put in your OpenAI key to use AI THub at public API costs.
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#444' : '#ddd'
                  }
                ]}
                placeholder="Enter your OpenAI API Key"
                placeholderTextColor={isDark ? '#888' : '#999'}
                value={apiConfig.openai.key}
                onChangeText={(text) => setApiConfig(prev => ({
                  ...prev,
                  openai: { ...prev.openai, key: text }
                }))}
                secureTextEntry
              />
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#444' : '#ddd'
                  }
                ]}
                placeholder="Override OpenAI Base URL (when using key)"
                placeholderTextColor={isDark ? '#888' : '#999'}
                value={apiConfig.openai.baseUrl}
                onChangeText={(text) => setApiConfig(prev => ({
                  ...prev,
                  openai: { ...prev.openai, baseUrl: text }
                }))}
              />
            </View>

            {/* Anthropic Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Anthropic API Key
              </Text>
              <Text style={[styles.sectionDescription, { color: isDark ? '#ddd' : '#666' }]}>
                You can put in your Anthropic key to use Claude at cost.
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#444' : '#ddd'
                  }
                ]}
                placeholder="Enter your Anthropic API Key"
                placeholderTextColor={isDark ? '#888' : '#999'}
                value={apiConfig.anthropic.key}
                onChangeText={(text) => setApiConfig(prev => ({
                  ...prev,
                  anthropic: { ...prev.anthropic, key: text }
                }))}
                secureTextEntry
              />
            </View>

            {/* Google Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Google API Key
                </Text>
                <Switch
                  value={apiConfig.google.enabled}
                  onValueChange={(value) => setApiConfig(prev => ({
                    ...prev,
                    google: { ...prev.google, enabled: value }
                  }))}
                />
              </View>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#444' : '#ddd'
                  }
                ]}
                placeholder="Enter your Google AI Studio API Key"
                placeholderTextColor={isDark ? '#888' : '#999'}
                value={apiConfig.google.key}
                onChangeText={(text) => setApiConfig(prev => ({
                  ...prev,
                  google: { ...prev.google, key: text }
                }))}
                secureTextEntry
              />
            </View>

            {/* Azure Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Azure API Key
                </Text>
                <Switch
                  value={apiConfig.azure.enabled}
                  onValueChange={(value) => setApiConfig(prev => ({
                    ...prev,
                    azure: { ...prev.azure, enabled: value }
                  }))}
                />
              </View>
              <Text style={[styles.sectionDescription, { color: isDark ? '#ddd' : '#666' }]}>
                Instead of OpenAI's API or pro, you can use AI THub at-cost through the Azure API.
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#444' : '#ddd'
                  }
                ]}
                placeholder="Base URL"
                placeholderTextColor={isDark ? '#888' : '#999'}
                value={apiConfig.azure.baseUrl}
                onChangeText={(text) => setApiConfig(prev => ({
                  ...prev,
                  azure: { ...prev.azure, baseUrl: text }
                }))}
              />
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#444' : '#ddd'
                  }
                ]}
                placeholder="The deployment name you gave your model"
                placeholderTextColor={isDark ? '#888' : '#999'}
                value={apiConfig.azure.deploymentName}
                onChangeText={(text) => setApiConfig(prev => ({
                  ...prev,
                  azure: { ...prev.azure, deploymentName: text }
                }))}
              />
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                    color: isDark ? '#fff' : '#000',
                    borderColor: isDark ? '#444' : '#ddd'
                  }
                ]}
                placeholder="Enter your Azure OpenAI Key"
                placeholderTextColor={isDark ? '#888' : '#999'}
                value={apiConfig.azure.apiKey}
                onChangeText={(text) => setApiConfig(prev => ({
                  ...prev,
                  azure: { ...prev.azure, apiKey: text }
                }))}
                secureTextEntry
              />
            </View>
          </ScrollView>

          <View style={[
            styles.footer,
            { borderTopColor: isDark ? '#444' : '#e0e0e0' }
          ]}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: '#007AFF' }
              ]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 