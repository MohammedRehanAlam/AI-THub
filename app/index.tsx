import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Modal, FlatList, Dimensions, Animated, Platform, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import { useProviders, ProviderType } from './context/ProviderContext';
import { Box } from './components/Box';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import SVG logos as React components
import { OpenAILogo, GeminiLogo, AnthropicLogo, OpenRouterLogo, GroqLogo } from './components/LogoIcons';

// Import DEFAULT_MODELS from APISettings
import { DEFAULT_MODELS } from './APISettings';
import { getBackgroundColorAsync } from 'expo-system-ui';

// Provider display names and icons mapping
const PROVIDER_INFO = {
  openai: { 
    name: 'OpenAI', 
    icon: () => <OpenAILogo width={20} height={20} useThemeColor={true} /> 
  },
  google: { 
    name: 'Google AI', 
    icon: () => <GeminiLogo width={20} height={20} /> 
  },
  anthropic: { 
    name: 'Anthropic', 
    icon: () => <AnthropicLogo width={20} height={20} fill="#d97757" /> 
  },
  openrouter: { 
    name: 'OpenRouter', 
    icon: () => <OpenRouterLogo width={20} height={20} useThemeColor={true} /> 
  },
  groq: { 
    name: 'Groq', 
    icon: () => <GroqLogo width={20} height={20} fill="#ffffff" /> 
  }
};

// Constants for storage keys
const GLOBAL_PROVIDER_KEY = 'selected_provider';
const TOOL1_PROVIDER_KEY = 'box1_selected_provider';
const TOOL2_PROVIDER_KEY = 'box2_selected_provider';
const TOOL3_PROVIDER_KEY = 'box3_selected_provider';
const GLOBAL_MODEL_KEY = 'current_models';

export default function HomePage() {
  const { currentTheme } = useTheme();
  const [isSettingsOpen] = useState(false);
  const { activeProviders, isProviderActive } = useProviders();
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeProvidersList, setActiveProvidersList] = useState<ProviderType[]>([]);
  const router = useRouter();
  
  // Add state for current models
  const [currentModels, setCurrentModels] = useState<{[key in ProviderType]: string}>({
    openai: DEFAULT_MODELS.openai,
    google: DEFAULT_MODELS.google,
    anthropic: DEFAULT_MODELS.anthropic,
    openrouter: DEFAULT_MODELS.openrouter,
    groq: DEFAULT_MODELS.groq
  });
  
  // Add state for expanded items and verified models
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
  
  // Load saved provider from AsyncStorage when the app starts
  useEffect(() => {
    const loadSavedProvider = async () => {
      try {
        const savedProvider = await AsyncStorage.getItem(GLOBAL_PROVIDER_KEY);
        if (savedProvider) {
          // Check if the saved provider is still active
          if (isProviderActive(savedProvider as ProviderType)) {
            setSelectedProvider(savedProvider as ProviderType);
          }
        }
      } catch (error) {
        console.error('Error loading saved provider:', error);
      }
    };
    
    loadSavedProvider();
  }, []);
  
  // Load active providers and set default selected provider
  useEffect(() => {
    const loadActiveProviders = async () => {
      try {
        // Get list of active providers
        const activeProvs = Object.entries(activeProviders)
          .filter(([_, isActive]) => isActive)
          .map(([provider]) => provider as ProviderType);
        
        setActiveProvidersList(activeProvs);
        
        // Only set a default provider if no provider is currently selected
        if (activeProvs.length > 0 && !selectedProvider) {
          // Check if there's a saved provider in AsyncStorage
          const savedProvider = await AsyncStorage.getItem(GLOBAL_PROVIDER_KEY);
          
          if (savedProvider && isProviderActive(savedProvider as ProviderType)) {
            // If there's a saved provider and it's active, use it
            setSelectedProvider(savedProvider as ProviderType);
          } else {
            // Otherwise, use the first active provider
            setSelectedProvider(activeProvs[0]);
          }
        }
        
        // If the currently selected provider is no longer active, select the first active one
        if (selectedProvider && !activeProviders[selectedProvider] && activeProvs.length > 0) {
          setSelectedProvider(activeProvs[0]);
        } else if (activeProvs.length === 0) {
          setSelectedProvider(null);
        }
      } catch (error) {
        console.error('Error loading active providers:', error);
      }
    };
    
    loadActiveProviders();
  }, [activeProviders, selectedProvider]);
  
  // Update AsyncStorage when selected provider changes
  useEffect(() => {
    const saveSelectedProvider = async () => {
      if (selectedProvider) {
        try {
          // Save to global provider key
          await AsyncStorage.setItem(GLOBAL_PROVIDER_KEY, selectedProvider);
          
          // We don't update tool-specific providers here
          // Each tool will check the global provider if it doesn't have a tool-specific one
        } catch (error) {
          console.error('Error saving selected provider:', error);
        }
      }
    };
    
    saveSelectedProvider();
  }, [selectedProvider]);
  
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
  
  // Individual boxes for better control over position and properties
  type BoxRoute = '/launch_screens/TranslatorLaunch' | '/launch_screens/Box2Launch' | '/launch_screens/Box3Launch' | '/launch_screens/ComingSoonLaunch';

  interface BoxItem {
    id: number;
    route: BoxRoute;
    title: string;
  }

  const boxes: BoxItem[] = [
    { id: 1, route: '/launch_screens/TranslatorLaunch', title: 'Translator' },
    { id: 2, route: '/launch_screens/Box2Launch', title: 'Box 2 two' },
    { id: 3, route: '/launch_screens/Box3Launch', title: 'Box 3 three' },
    { id: 4, route: '/launch_screens/ComingSoonLaunch', title: 'Coming Soon' },
  ];

  const isDark = currentTheme === 'dark';

  // Use useMemo to prevent unnecessary style recalculations
  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#fff',
    },
    mainContent: {
      flex: 1,
    },
    header: {
      padding: 34,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerLeft: {
      position: 'absolute',
      left: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    headerRight: {
      position: 'absolute',
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    toggleButton: {
      padding: 4,
    },
    logo: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#fff' : '#000',
    },
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
      padding: 14,
      borderRadius: 8,
      gap: 10,
    },
    selectedItem: {
      backgroundColor: isDark ? '#444' : '#e0e0e0',
    },
    dropdownItemText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 16,
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
    noProvidersText: {
      color: isDark ? '#999' : '#666',
      fontSize: 15,
      padding: 14,
      textAlign: 'center',
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      marginHorizontal: -8,
    },
    comingSoonContainer: {
      width: '47%',
      aspectRatio: 1,
      justifyContent: 'center',
    },
    comingSoonText: {
      fontSize: 18,
      color: isDark ? '#999' : '#666',
      fontStyle: 'italic',
    },
    buttonText: {
      fontSize: 18,
      margin: 10,
      color: 'blue',
    },
    separator: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
      marginTop: 5,
      marginBottom: 10,
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
    expandButton: {
      padding: 4,
      marginLeft: 'auto',
    },
  }), [isDark]);

  // Handle provider selection from dropdown
  const handleProviderSelect = async (provider: ProviderType) => {
    try {
      setSelectedProvider(provider);
      setDropdownVisible(false);
      
      // Save the selected provider to global AsyncStorage
      await AsyncStorage.setItem(GLOBAL_PROVIDER_KEY, provider);
    } catch (error) {
      console.error('Error saving selected provider:', error);
    }
  };

  // Function to handle model selection
  const handleModelSelect = async (provider: ProviderType, modelName: string) => {
    try {
      const newCurrentModels = { ...currentModels, [provider]: modelName };
      setCurrentModels(newCurrentModels);
      await AsyncStorage.setItem(GLOBAL_MODEL_KEY, JSON.stringify(newCurrentModels));
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

  // Add function to collapse all items
  const collapseAllItems = () => {
    setExpandedItems({
      openai: false,
      google: false,
      anthropic: false,
      openrouter: false,
      groq: false
    });
  };

  // Modify the dropdown visibility handler
  const handleDropdownVisibility = (visible: boolean) => {
    setDropdownVisible(visible);
    if (!visible || visible) {
      collapseAllItems();
    }
  };

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.mainContent}>
        <View style={themedStyles.header}>
          <View style={themedStyles.headerLeft}>
            <TouchableOpacity style={themedStyles.toggleButton} onPress={() => router.push('/Settings')}>
              <Ionicons
                name={isSettingsOpen ? 'chevron-back-outline' : 'chevron-forward-outline'}
                size={24}
                color={isDark ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <Text style={themedStyles.logo}>AI T-Hub</Text>
          </View>
          
          <View style={themedStyles.headerRight}>
            <View style={themedStyles.providerSelector}>
              <TouchableOpacity 
                style={themedStyles.providerButton}
                onPress={() => handleDropdownVisibility(true)}
              >
                {selectedProvider ? (
                  <>
                    {selectedProvider === 'openai' && <OpenAILogo width={24} height={24} useThemeColor={true} />}
                    {selectedProvider === 'google' && <GeminiLogo width={24} height={24} />}
                    {selectedProvider === 'anthropic' && <AnthropicLogo width={24} height={24} fill="#d97757" />}
                    {selectedProvider === 'openrouter' && <OpenRouterLogo width={24} height={24} useThemeColor={true} />}
                    {selectedProvider === 'groq' && <GroqLogo width={24} height={24} fill="#ffffff" />}
                    <View style={themedStyles.dropdownItemContent}>
                      <Text style={themedStyles.providerText} numberOfLines={1} ellipsizeMode="tail">
                        {PROVIDER_INFO[selectedProvider].name}
                      </Text>
                      <Text style={themedStyles.dropdownItemModel} numberOfLines={1} ellipsizeMode="tail">
                        {currentModels[selectedProvider]}
                      </Text>
                    </View>
                    <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={isDark ? '#fff' : '#000'} />
                  </>
                ) : (
                  <>
                    <Ionicons name="cloud-outline" size={24} color={isDark ? '#fff' : '#000'} />
                    <View style={themedStyles.dropdownItemContent}>
                      <Text style={themedStyles.providerText} numberOfLines={1} ellipsizeMode="tail">
                        {activeProvidersList.length > 0 ? 'Select Provider' : 'No Providers'}
                      </Text>
                    </View>
                    <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={isDark ? '#fff' : '#000'} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Provider Selection Dropdown */}
        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => handleDropdownVisibility(false)}
        >
          <TouchableOpacity 
            style={themedStyles.dropdownModal}
            activeOpacity={1}
            onPress={() => handleDropdownVisibility(false)}
          >
            <View style={themedStyles.dropdownContent}>
              {activeProvidersList.length > 0 ? (
                // max height of the dropdown container
                <View style={{ maxHeight: 340 }}> 
                  <FlatList
                    data={activeProvidersList}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <View>
                        <TouchableOpacity
                          style={[
                            themedStyles.dropdownItem,
                            selectedProvider === item && themedStyles.selectedItem
                          ]}
                          onPress={async () => {
                            await handleProviderSelect(item);
                          }}
                        >
                          {item === 'openai' && <OpenAILogo width={24} height={24} useThemeColor={true} />}
                          {item === 'google' && <GeminiLogo width={24} height={24} />}
                          {item === 'anthropic' && <AnthropicLogo width={24} height={24} fill="#d97757" />}
                          {item === 'openrouter' && <OpenRouterLogo width={24} height={24} useThemeColor={true} />}
                          {item === 'groq' && <GroqLogo width={24} height={24} fill="#ffffff" />}
                          <View style={themedStyles.dropdownItemContent}>
                            <Text style={themedStyles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                              {PROVIDER_INFO[item].name}
                            </Text>
                            <Text style={themedStyles.dropdownItemModel} numberOfLines={1} ellipsizeMode="tail">
                              {currentModels[item]}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={themedStyles.expandButton}
                            onPress={() => handleExpand(item)}
                          >
                            <Ionicons
                              name={expandedItems[item] ? "chevron-up" : "chevron-down"}
                              size={20}
                              color={isDark ? '#fff' : '#000'}
                            />
                          </TouchableOpacity>
                        </TouchableOpacity>
                        
                        {expandedItems[item] && verifiedModels[item].length > 0 && (
                          <View style={themedStyles.modelsList}>
                            {verifiedModels[item].map((modelName, index) => (
                              <TouchableOpacity
                                key={index}
                                style={[
                                  themedStyles.modelOption,
                                  currentModels[item] === modelName && themedStyles.selectedModel
                                ]}
                                onPress={() => handleModelSelect(item, modelName)}
                              >
                                <Text 
                                  style={[
                                    themedStyles.modelOptionText,
                                    currentModels[item] === modelName && themedStyles.selectedModelText
                                  ]}
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {modelName}
                                </Text>
                                {currentModels[item] === modelName && (
                                  <Ionicons
                                    name="checkmark"
                                    size={16}
                                    color={isDark ? '#4a90e2' : '#2196F3'}
                                    style={{ marginLeft: 8 }}
                                  />
                                )}
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  />
                </View>
              ) : (
                <Text style={themedStyles.noProvidersText}  ellipsizeMode="tail">
                  No active providers. Please verify and enable providers in Settings.
                </Text>
              )}
            <View style={[themedStyles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
            <TouchableOpacity
                style={[themedStyles.dropdownItem]}
                onPress={() => {
                  router.push('/APISettings');
                  setDropdownVisible(false);
                }}
              >
                <Ionicons name="settings-outline" size={24} color={isDark ? '#fff' : '#000'} />
                <Text style={themedStyles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                  Manage Providers
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        
        <View style={themedStyles.separator} />

        <ScrollView 
          contentContainerStyle={themedStyles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle={isDark ? "white" : "black"}
        >     
          <View style={themedStyles.grid}>
            {boxes.map((box) => (
              <Box
                key={box.id}
                isDark={isDark}
                title={box.title}
                onPress={() => {
                  if (box.route === '/launch_screens/ComingSoonLaunch') {
                    router.push({
                      pathname: '/launch_screens/ComingSoonLaunch',
                      params: { title: box.title }
                    });
                  } else {
                    router.push({
                      pathname: box.route as BoxRoute
                    });
                  }
                }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 