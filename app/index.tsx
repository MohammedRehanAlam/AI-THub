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

export default function HomePage() {
  const { currentTheme } = useTheme();
  const [isSettingsOpen] = useState(false);
  const { activeProviders, isProviderActive } = useProviders();
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeProvidersList, setActiveProvidersList] = useState<ProviderType[]>([]);
  const router = useRouter();
  
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
  
  // Individual boxes for better control over position and properties
  type BoxRoute = '/tools/Box1' | '/tools/Box2' | '/tools/Box3' | '/tools/ComingSoon';

  interface BoxItem {
    id: number;
    route: BoxRoute;
    title: string;
  }

  const boxes: BoxItem[] = [
    { id: 1, route: '/tools/Box1', title: 'Translator' },
    { id: 2, route: '/tools/Box2', title: 'Box 2 two' },
    { id: 3, route: '/tools/Box3', title: 'Box 3 three' },
    { id: 4, route: '/tools/ComingSoon', title: 'Coming Soon' },
    { id: 5, route: '/tools/ComingSoon', title: 'Coming Soon' },
    { id: 6, route: '/tools/ComingSoon', title: 'Coming Soon' },
    { id: 7, route: '/tools/ComingSoon', title: 'Coming Soon' },
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
      gap: 12,
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
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 10,
      gap: 10,
      minWidth: 130,
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#ddd',
    },
    providerText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 16,
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
      width: 205,
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
      backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
      marginVertical: 10,
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
            <Text style={themedStyles.logo}>AppLogo</Text>
          </View>
          
          <View style={themedStyles.headerRight}>
            <TouchableOpacity 
              style={themedStyles.providerSelector}
              onPress={() => setDropdownVisible(true)}
            >
              {selectedProvider ? (
                <>
                  {selectedProvider === 'openai' && <OpenAILogo width={24} height={24} useThemeColor={true} />}
                  {selectedProvider === 'google' && <GeminiLogo width={24} height={24} />}
                  {selectedProvider === 'anthropic' && <AnthropicLogo width={24} height={24} fill="#d97757" />}
                  {selectedProvider === 'openrouter' && <OpenRouterLogo width={24} height={24} useThemeColor={true} />}
                  {selectedProvider === 'groq' && <GroqLogo width={24} height={24} fill="#ffffff" />}
                  <Text style={themedStyles.providerText} numberOfLines={1} ellipsizeMode="tail">
                    {PROVIDER_INFO[selectedProvider].name}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-outline" size={24} color={isDark ? '#fff' : '#000'} />
                  <Text style={themedStyles.providerText} numberOfLines={1} ellipsizeMode="tail">
                    {activeProvidersList.length > 0 ? 'Select Provider' : 'No Providers'}
                  </Text>
                </>
              )}
              <Ionicons name="chevron-down" size={20} color={isDark ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Provider Selection Dropdown */}
        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity 
            style={themedStyles.dropdownModal}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          >
            <View style={themedStyles.dropdownContent}>
              {activeProvidersList.length > 0 ? (
                <FlatList
                  data={activeProvidersList}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
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
                      <Text style={themedStyles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                        {PROVIDER_INFO[item].name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={themedStyles.noProvidersText} numberOfLines={1} ellipsizeMode="tail">
                  No active providers. Please verify and enable providers in Settings.
                </Text>
              )}
              
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
                  if (box.route === '/tools/ComingSoon') {
                    router.push({
                      pathname: '/tools/ComingSoon',
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