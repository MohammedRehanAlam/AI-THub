import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProviders, ProviderType } from '../context/ProviderContext';
import { OpenAILogo, GeminiLogo, AnthropicLogo, OpenRouterLogo, GroqLogo } from '../components/LogoIcons';
import { DEFAULT_MODELS } from '../APISettings';

// Constants for storage keys
const GLOBAL_PROVIDER_KEY = 'selected_provider';
const GLOBAL_MODEL_KEY = 'current_models';
const TOOL_PROVIDER_KEY = 'box2_selected_provider';
const TOOL_MODEL_KEY = 'box2_selected_models';

export default function Box2() {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const router = useRouter();
  const { activeProviders, isProviderActive } = useProviders();

  // State for provider selection and dropdown
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeProvidersList, setActiveProvidersList] = useState<ProviderType[]>([]);
  const [isUsingGlobalProvider, setIsUsingGlobalProvider] = useState(true);
  const [isUsingGlobalModels, setIsUsingGlobalModels] = useState(true);
  
  // State for alert modal
  const [alertVisible, setAlertVisible] = useState(false);

  // State for models and expansion
  const [currentModels, setCurrentModels] = useState<{[key in ProviderType]: string}>({
    openai: DEFAULT_MODELS.openai,
    google: DEFAULT_MODELS.google,
    anthropic: DEFAULT_MODELS.anthropic,
    openrouter: DEFAULT_MODELS.openrouter,
    groq: DEFAULT_MODELS.groq
  });
  
  const [expandedItems, setExpandedItems] = useState<{[key in ProviderType]: boolean}>({
    openai: false,
    google: false,
    anthropic: false,
    openrouter: false,
    groq: false
  });

  const [verifiedModels, setVerifiedModels] = useState<{[key in ProviderType]: string[]}>({
    openai: [],
    google: [],
    anthropic: [],
    openrouter: [],
    groq: []
  });

  // State for content management
  const [content, setContent] = useState([]);

  // Load verified models from AsyncStorage
  useEffect(() => {
    const loadVerifiedModels = async () => {
      try {
        const savedVerifiedModels = await AsyncStorage.getItem('verified_models');
        if (savedVerifiedModels) {
          const parsed = JSON.parse(savedVerifiedModels);
          // Convert from ProviderModels format to simple string arrays
          const simplified = Object.keys(parsed).reduce((acc, key) => ({
            ...acc,
            [key]: parsed[key].map((model: { name: string }) => model.name)
          }), {
            openai: [],
            google: [],
            anthropic: [],
            openrouter: [],
            groq: []
          } as {[key in ProviderType]: string[]});
          setVerifiedModels(simplified);
        }
      } catch (error) {
        console.error('Error loading verified models:', error);
      }
    };
    
    loadVerifiedModels();
  }, []);

  // Load current models from AsyncStorage
  useEffect(() => {
    const loadCurrentModels = async () => {
      try {
        const savedModels = await AsyncStorage.getItem(GLOBAL_MODEL_KEY);
        if (savedModels) {
          setCurrentModels(JSON.parse(savedModels));
        }
      } catch (error) {
        console.error('Error loading current models:', error);
      }
    };
    
    loadCurrentModels();
  }, []);

  // Initialize the provider
  useEffect(() => {
    const initializeProvider = async () => {
      try {
        // First, check if we have a tool-specific provider
        const toolProvider = await AsyncStorage.getItem(TOOL_PROVIDER_KEY);
        
        if (toolProvider && isProviderActive(toolProvider as ProviderType)) {
          // Use the tool-specific provider if it exists and is active
          setSelectedProvider(toolProvider as ProviderType);
          setIsUsingGlobalProvider(false);
          
          // Check for tool-specific models
          const toolModels = await AsyncStorage.getItem(TOOL_MODEL_KEY);
          if (toolModels) {
            const parsedToolModels = JSON.parse(toolModels);
            if (parsedToolModels[toolProvider as ProviderType]) {
              setCurrentModels(prev => ({
                ...prev,
                [toolProvider as ProviderType]: parsedToolModels[toolProvider as ProviderType]
              }));
              setIsUsingGlobalModels(false);
            }
          }
        } else {
          // Otherwise, check for a global provider
          const globalProvider = await AsyncStorage.getItem(GLOBAL_PROVIDER_KEY);
          
          if (globalProvider && isProviderActive(globalProvider as ProviderType)) {
            setSelectedProvider(globalProvider as ProviderType);
          } else if (activeProvidersList.length > 0) {
            // If no valid global provider, use the first active provider
            setSelectedProvider(activeProvidersList[0]);
          }
          
          setIsUsingGlobalProvider(true);
          setIsUsingGlobalModels(true);
        }
      } catch (error) {
        console.error('Error initializing provider:', error);
      }
    };
    
    if (activeProvidersList.length > 0) {
      initializeProvider();
    }
  }, [activeProvidersList, isProviderActive]);

  // Load active providers
  useEffect(() => {
    const loadActiveProvidersList = async () => {
      try {
        // Get list of active providers
        const activeProvs = Object.entries(activeProviders)
          .filter(([_, isActive]) => isActive)
          .map(([provider]) => provider as ProviderType);
        
        setActiveProvidersList(activeProvs);
      } catch (error) {
        console.error('Error loading active providers list:', error);
      }
    };
    
    loadActiveProvidersList();
  }, [activeProviders]);

  // Handle provider selection
  const handleProviderSelect = async (provider: ProviderType) => {
    try {
      setSelectedProvider(provider);
      // Save to tool-specific storage key
      await AsyncStorage.setItem(TOOL_PROVIDER_KEY, provider);
      setIsUsingGlobalProvider(false);
      
      // Check if we have tool-specific models for this provider
      const savedToolModels = await AsyncStorage.getItem(TOOL_MODEL_KEY);
      if (savedToolModels) {
        const toolModels = JSON.parse(savedToolModels);
        if (toolModels && toolModels[provider]) {
          // We have a tool-specific model for this provider
          setCurrentModels(prev => ({
            ...prev,
            [provider]: toolModels[provider]
          }));
          setIsUsingGlobalModels(false);
        } else {
          // No tool-specific model, use global model
          const globalModels = await AsyncStorage.getItem(GLOBAL_MODEL_KEY);
          if (globalModels) {
            const parsedGlobalModels = JSON.parse(globalModels);
            setCurrentModels(prev => ({
              ...prev,
              [provider]: parsedGlobalModels[provider]
            }));
          }
          setIsUsingGlobalModels(true);
        }
      } else {
        setIsUsingGlobalModels(true);
      }
      
      setDropdownVisible(false);
    } catch (error) {
      console.error('Error saving selected provider:', error);
    }
  };

  // Function to handle model selection
  const handleModelSelect = async (provider: ProviderType, modelName: string) => {
    try {
      // Update the model in state
      const newCurrentModels = { ...currentModels, [provider]: modelName };
      setCurrentModels(newCurrentModels);
      
      // Save to tool-specific model storage
      let toolModels = {};
      const savedToolModels = await AsyncStorage.getItem(TOOL_MODEL_KEY);
      if (savedToolModels) {
        toolModels = JSON.parse(savedToolModels);
      }
      
      // Update this provider's model in our tool-specific storage
      toolModels = {
        ...toolModels,
        [provider]: modelName
      };
      
      await AsyncStorage.setItem(TOOL_MODEL_KEY, JSON.stringify(toolModels));
      setIsUsingGlobalModels(false);
      
      // Reset all expanded items to false
      setExpandedItems({
        openai: false,
        google: false,
        anthropic: false,
        openrouter: false,
        groq: false
      });
    } catch (error) {
      console.error('Error saving model selection:', error);
    }
  };

  // Add function to handle expansion toggle
  const handleExpand = (provider: ProviderType) => {
    setExpandedItems(prev => {
      // Create a new state with all providers collapsed
      const newState = {
        openai: false,
        google: false,
        anthropic: false,
        openrouter: false,
        groq: false
      };
      // Only expand the clicked provider if it wasn't already expanded
      if (!prev[provider]) {
        newState[provider] = true;
      }
      return newState;
    });
  };

  // Get provider display name
  const getProviderDisplayName = (provider: ProviderType): string => {
    const displayNames: Record<ProviderType, string> = {
      openai: 'OpenAI',
      google: 'Google AI',
      anthropic: 'Anthropic',
      openrouter: 'OpenRouter',
      groq: 'Groq'
    };
    return displayNames[provider] || provider;
  };

  // Clear content
  const clearContent = () => {
    setContent([]);
    setAlertVisible(false);
  };

  const handleClearButtonPress = () => {
    if (content.length > 0) {
      setAlertVisible(true);
    }
  };

  // Handle dropdown visibility
  const handleDropdownVisibility = (visible: boolean) => {
    setDropdownVisible(visible);
    if (!visible) {
      // Reset all expanded items when closing dropdown
      setExpandedItems({
        openai: false,
        google: false,
        anthropic: false,
        openrouter: false,
        groq: false
      });
    }
  };

  // Reset to global provider
  const resetToGlobalProvider = async () => {
    try {
      // Get the global provider
      const globalProvider = await AsyncStorage.getItem(GLOBAL_PROVIDER_KEY);
      
      if (globalProvider && isProviderActive(globalProvider as ProviderType)) {
        // Set the selected provider to the global provider
        setSelectedProvider(globalProvider as ProviderType);
        
        // Remove the tool-specific provider and model
        await AsyncStorage.removeItem(TOOL_PROVIDER_KEY);
        await AsyncStorage.removeItem(TOOL_MODEL_KEY);
        
        setIsUsingGlobalProvider(true);
        setIsUsingGlobalModels(true);
        
        // Load global models
        const savedModels = await AsyncStorage.getItem(GLOBAL_MODEL_KEY);
        if (savedModels) {
          setCurrentModels(JSON.parse(savedModels));
        }
      } else {
        // If no global provider or it's not active, find the first active one
        const activeProvs = Object.entries(activeProviders)
          .filter(([_, isActive]) => isActive)
          .map(([provider]) => provider as ProviderType);
        
        if (activeProvs.length > 0) {
          setSelectedProvider(activeProvs[0]);
          setIsUsingGlobalProvider(true);
          setIsUsingGlobalModels(true);
        } else {
          setSelectedProvider(null);
        }
      }
      
      // Close the dropdown
      setDropdownVisible(false);
    } catch (error) {
      console.error('Error resetting to global provider:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#fff',
    },
    header: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      // borderBottomWidth: 1,
      // borderBottomColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    toggleButton: {
      padding: 4,
    },
    clearButton: {
      padding: 4,
      marginLeft: 8,
    },
    clearButtonDisabled: {
      opacity: 0.3,
    },
    logo: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
    content: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 20,
    },
    text: {
      color: isDark ? '#fff' : '#000',
      fontSize: 16,
      textAlign: 'center',
    },
    separator: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      marginVertical: 0,
    },
    // Provider selector styles
    providerSelector: {
      flex: 1,
      alignItems: 'flex-end',
      maxWidth: 150,
    },
    providerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      paddingHorizontal: 7,
      paddingVertical: 5,
      borderRadius: 10,
      gap: 4,
      minWidth: 100,
      alignSelf: 'flex-end',
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#ddd',
    },
    providerText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 14,
      fontWeight: '500',
    },
    dropdownItemContent: {
      flex: 1,
      flexDirection: 'column',
      gap: 2,
      minWidth: 80,
    },
    dropdownItemModel: {
      color: isDark ? '#aaa' : '#666',
      fontSize: 12,
      width: '100%', // Take full width of parent
    },
    // Dropdown modal
    dropdownModal: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    dropdownContent: {
      marginTop: 70,
      marginRight: 16,
      width: 230,
      // height : 430, 
      backgroundColor: isDark ? '#333' : '#fff',
      borderRadius: 8,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      gap: 8,
    },
    selectedItem: {
      backgroundColor: isDark ? '#444' : '#e0e0e0',
    },
    dropdownItemText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 15,
      fontWeight: '500',
    },
    expandButton: {
      padding: 4,
      marginLeft: 'auto',
    },
    modelsList: {
      marginLeft: 34,
      borderLeftWidth: 1,
      borderLeftColor: isDark ? '#444' : '#ddd',
    },
    modelOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 6,
      justifyContent: 'space-between',
    },
    modelOptionText: {
      color: isDark ? '#ddd' : '#666',
      fontSize: 14,
      flex: 1,
      marginRight: 8,
    },
    selectedModel: {
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
    },
    selectedModelText: {
      color: isDark ? '#fff' : '#000',
      fontWeight: '500',
    },
    noProvidersText: {
      color: isDark ? '#999' : '#666',
      fontSize: 15,
      padding: 14,
      textAlign: 'center',
    },
    alertContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertBox: {
      backgroundColor: isDark ? '#333' : '#fff',
      borderRadius: 12,
      padding: 20,
      width: '80%',
      maxWidth: 400,
    },
    alertTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
      marginBottom: 12,
    },
    alertMessage: {
      fontSize: 16,
      color: isDark ? '#ddd' : '#333',
      marginBottom: 20,
    },
    alertButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    alertButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginLeft: 8,
      borderRadius: 8,
    },
    cancelButton: {
      backgroundColor: isDark ? '#555' : '#e0e0e0',
    },
    confirmButton: {
      backgroundColor: '#007AFF',
    },
    alertButtonText: {
      fontSize: 16,
      fontWeight: '500',
    },
    cancelButtonText: {
      color: isDark ? '#fff' : '#000',
    },
    confirmButtonText: {
      color: '#fff',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.toggleButton} onPress={() => router.push('/')}>
            <Ionicons name="chevron-back-outline" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerRight}>
          <View style={styles.providerSelector}>
            <TouchableOpacity 
              onPress={() => handleDropdownVisibility(!dropdownVisible)}
              style={styles.providerButton}
            >
              {selectedProvider ? (
                <>
                  {selectedProvider === 'openai' && <OpenAILogo width={24} height={24} useThemeColor={true} />}
                  {selectedProvider === 'google' && <GeminiLogo width={24} height={24} />}
                  {selectedProvider === 'anthropic' && <AnthropicLogo width={24} height={24} fill="#d97757" />}
                  {selectedProvider === 'openrouter' && <OpenRouterLogo width={24} height={24} useThemeColor={true} />}
                  {selectedProvider === 'groq' && <GroqLogo width={24} height={24} fill="#ffffff" />}
                  <View style={styles.dropdownItemContent}>
                    <Text style={styles.providerText} numberOfLines={1} ellipsizeMode="tail">
                      {getProviderDisplayName(selectedProvider)}
                    </Text>
                    <Text style={styles.dropdownItemModel} numberOfLines={1} ellipsizeMode="tail">
                      {currentModels[selectedProvider]}
                    </Text>
                  </View>
                  <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={isDark ? '#fff' : '#000'} />
                </>
              ) : (
                <>
                  <Ionicons name="cloud-outline" size={24} color={isDark ? '#fff' : '#000'} />
                  <View style={styles.dropdownItemContent}>
                    <Text style={styles.providerText} numberOfLines={1} ellipsizeMode="tail">
                      {activeProvidersList.length > 0 ? 'Select Provider' : 'No Providers'}
                    </Text>
                  </View>
                  <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={isDark ? '#fff' : '#000'} />
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.clearButton,
              content.length === 0 && styles.clearButtonDisabled
            ]}
            onPress={handleClearButtonPress}
            disabled={content.length === 0}
          >
            <Ionicons name="trash-outline" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.separator} />
      
      <View style={styles.content}>
        <Text style={styles.title}>Box 2 Content</Text>
        <Text style={styles.text}>This is the content for Box 2. You can customize this page as needed.</Text>
      </View>
      
      {/* Provider Selection Dropdown */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => handleDropdownVisibility(false)}
      >
        <TouchableOpacity 
          style={styles.dropdownModal}
          activeOpacity={1}
          onPress={() => handleDropdownVisibility(false)}
        >
          <View style={styles.dropdownContent}>
            {activeProvidersList.length > 0 ? (
              <ScrollView style={{ maxHeight: 400 }}> 
                {activeProvidersList.map((provider) => (
                  <View key={provider}>
                    <TouchableOpacity
                      style={[
                        styles.dropdownItem,
                        selectedProvider === provider && styles.selectedItem
                      ]}
                      onPress={() => handleProviderSelect(provider)}
                    >
                      {provider === 'openai' && <OpenAILogo width={24} height={24} useThemeColor={true} />}
                      {provider === 'google' && <GeminiLogo width={24} height={24} />}
                      {provider === 'anthropic' && <AnthropicLogo width={24} height={24} fill="#d97757" />}
                      {provider === 'openrouter' && <OpenRouterLogo width={24} height={24} useThemeColor={true} />}
                      {provider === 'groq' && <GroqLogo width={24} height={24} fill="#ffffff" />}
                      <View style={styles.dropdownItemContent}>
                        <Text style={styles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                          {getProviderDisplayName(provider)}
                        </Text>
                        <Text style={styles.dropdownItemModel} numberOfLines={1} ellipsizeMode="tail">
                          {currentModels[provider]}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => handleExpand(provider)}
                      >
                        <Ionicons
                          name={expandedItems[provider] ? "chevron-up" : "chevron-down"}
                          size={20}
                          color={isDark ? '#fff' : '#000'}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                    
                    {expandedItems[provider] && verifiedModels[provider].length > 0 && (
                      <View style={styles.modelsList}>
                        {verifiedModels[provider].map((modelName, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.modelOption,
                              currentModels[provider] === modelName && styles.selectedModel
                            ]}
                            onPress={() => handleModelSelect(provider, modelName)}
                          >
                            <Text 
                              style={[
                                styles.modelOptionText,
                                currentModels[provider] === modelName && styles.selectedModelText
                              ]}
                              numberOfLines={1}
                              ellipsizeMode="tail"
                            >
                              {modelName}
                            </Text>
                            {currentModels[provider] === modelName && (
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color={isDark ? '#4a90e2' : '#2196F3'}
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
                <View style={[styles.separator, { marginVertical: 8 }]} />
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={resetToGlobalProvider}
                >
                  <Ionicons name="globe-outline" size={24} color={isDark ? '#fff' : '#000'} />
                  <Text style={styles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                    Use Global Provider
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <Text style={styles.noProvidersText}>
                No active providers. Please verify and enable providers in Settings.
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Confirmation Alert */}
      <Modal
        visible={alertVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}
      >
        <View style={styles.alertContainer}>
          <View style={styles.alertBox}>
            <Text style={styles.alertTitle}>Clear Content</Text>
            <Text style={styles.alertMessage}>Are you sure you want to clear the content? This action cannot be undone.</Text>
            <View style={styles.alertButtons}>
              <TouchableOpacity 
                style={[styles.alertButton, styles.cancelButton]} 
                onPress={() => setAlertVisible(false)}
              >
                <Text style={[styles.alertButtonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.alertButton, styles.confirmButton]} 
                onPress={clearContent}
              >
                <Text style={[styles.alertButtonText, styles.confirmButtonText]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}