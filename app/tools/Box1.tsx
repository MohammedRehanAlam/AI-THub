import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, Keyboard, Modal, AppState, KeyboardAvoidingView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGES } from '../components/languages';
import type { Language } from '../components/languages';
import { PLACEHOLDER_TRANSLATIONS } from '../components/placeholders';
import LanguageSelector from '../components/LanguageSelector';
import { BlurView } from 'expo-blur';
import { useFocusEffect } from '@react-navigation/native';
import Constants from 'expo-constants';
import ErrorAlert from '../components/ErrorAlert';
import { useProviders, ProviderType } from '../context/ProviderContext';
import { translateText as apiTranslateText, TranslationRequest } from '../_utils/translatorApiUtils';
import { formatApiError } from '../_utils/apiErrorUtils';
import { OpenAILogo, GeminiLogo, AnthropicLogo, OpenRouterLogo, GroqLogo } from '../components/LogoIcons';
import * as ImagePicker from 'expo-image-picker';

// Theme colors
const COLORS = {
  light: {
    background: '#ffffff',
    surface: '#f0f0f0',
    surfaceVariant: '#e0e0e0',
    text: '#000000',
    textSecondary: '#666666',
    primary: '#007AFF',
    border: 'rgba(150,150,150,0.2)',
    inactive: '#999999',
    overlay: 'rgba(0, 0, 0, 0.3)',
    mediaBackground: '#ffffff',
    mediaButtonBackground: '#f5f5f5',
    mediaButtonBorder: '#e0e0e0',
    mediaOptionHighlight: '#f0f0f0',
    mediaButtonIcon: '#666666',
  },
  dark: {
    background: '#1a1a1a',
    surface: '#2a2a2a',
    surfaceVariant: '#333333',
    text: '#ffffff',
    textSecondary: '#cccccc',
    primary: '#007AFF',
    border: 'rgba(150,150,150,0.2)',
    inactive: '#444444',
    overlay: 'rgba(0, 0, 0, 0.3)',
    mediaBackground: '#2a2a2a',
    mediaButtonBackground: '#333333',
    mediaButtonBorder: '#404040',
    mediaOptionHighlight: '#404040',
    mediaButtonIcon: '#ffffff',
  }
};

// Configurable UI constants
const UI_CONFIG = {
  // Input field height configuration
  // To change the height of the input field:
  // 1. Increase INPUT_MIN_HEIGHT for a taller default input field
  // 2. Increase INPUT_MAX_HEIGHT to allow more lines of text before scrolling begins
  // 3. Both values are in pixels and can be adjusted based on your preference
  INPUT_MIN_HEIGHT: 48,  // Minimum height of the input field (default single line)
  INPUT_MAX_HEIGHT: 120, // Maximum height of the input field when expanded with multi-line text
  
  // Keyboard offset configuration
  // Controls how far above the keyboard the input field should appear
  // Increase this value to move the input field higher above the keyboard
  // Decrease this value to keep the input field closer to the keyboard
  KEYBOARD_OFFSET: 10,   // Distance in pixels between keyboard and input field
};

interface Message {
  text: string;
  isUser1: boolean;
  timestamp: number;
  originalText?: string;
  expanded?: boolean;
  imageUri?: string;
  originalImageUri?: string;
}

const CustomAlert = ({ visible, title, message, onCancel, onConfirm, isDark }: { visible: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void; isDark: boolean; }) => {
  const styles = createStyles(isDark);
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  return (
    <Modal transparent={true} visible={visible} animationType='fade'>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
        <View style={[styles.alertBox, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}> 
          <Text style={[styles.alertTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.alertMessage, { color: colors.text }]}>{message}</Text>
          <View style={[styles.buttonContainer, { justifyContent: 'center' }]}>
            <TouchableOpacity onPress={onCancel} style={styles.button}><Text style={styles.buttonText}>CANCEL</Text></TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.button}><Text style={styles.buttonText}>CLEAR</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (isDark: boolean) => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      position: 'relative',
      height: '100%',
    },
    header: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      width: '100%',
      gap: 6,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 0.3,
      minWidth: 100,
    },
    toggleButton: {
      padding: 4,
    },
    clearButton: {
      paddingRight: 4,
      paddingLeft: 2,
    },
    clearButtonDisabled: {
      opacity: 0.3,
    },
    logo: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      flexShrink: 1,
    },
    languageSelector: {
      padding: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    languageSelectorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    languageBox: {
      flex: 1,
      minHeight: 48,
      backgroundColor: colors.surface,
      borderRadius: 8,
      overflow: 'hidden',
    },
    swapButton: {
      padding: 12,
      backgroundColor: colors.surface,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    overlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertBox: {
      width: '80%',
      padding: 20,
      borderColor: isDark ? colors.surfaceVariant : colors.surface,
      borderWidth: 4,
      borderRadius: 12,
      alignItems: 'center',
    },
    alertTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    alertMessage: {
      fontSize: 16,
      marginBottom: 20,
      textAlign: 'center',
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
    },
    button: {
      width: '40%',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderWidth: 1,
      backgroundColor: colors.primary,
      borderColor: '#000',
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    messagesContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    messagesContent: {
      padding: 16,
    },
    messageContainer: {
      flexDirection: 'row',
      marginVertical: 4,
    },
    user1Container: {
      justifyContent: 'flex-start',
    },
    user2Container: {
      justifyContent: 'flex-end',
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 12,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
    user1Bubble: {
      borderBottomLeftRadius: 4,
    },
    user2Bubble: {
      borderBottomRightRadius: 4,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.text,
      marginTop: 8,
    },
    messageTextWithImage: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.text,
      marginTop: 8,
    },
    messageTextOnly: {
      fontSize: 16,
      lineHeight: 22,
      color: colors.text,
      marginTop: 0,
    },
    originalTextButton: {
      marginTop: 8,
    },
    originalTextButtonText: {
      color: colors.primary,
      fontSize: 14,
    },
    originalText: {
      marginTop: 4,
      fontSize: 14,
      fontStyle: 'italic',
      color: colors.textSecondary,
    },
    bottomContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
      width: '100%',
      paddingBottom: 10,
    },
    userToggle: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 16,
      width: '100%',
    },
    userButton: {
      flex: 1,
      padding: 10,
      paddingVertical: 10,
      borderRadius: 20,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
      position: 'relative',
      backgroundColor: colors.surface,
    },
    activeUserButton: {
      borderColor: isDark ? '#fff' : '#000',
    },
    userButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    userLanguageText: {
      fontSize: 12,
      marginTop: 4,
      textAlign: 'center',
    },
    userLanguageLegend: {
      position: 'absolute',
      top: -8,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      zIndex: 1,
      minWidth: 80,
      alignItems: 'center',
    },
    userLanguageLegendText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    activeUserButtonText: {
      color: isDark ? '#fff' : '#000',
    },
    inputContainer: {
      flexDirection: 'column',
      width: 'auto',
      paddingLeft: 16,
      paddingRight: 16,    
      gap: 5,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 5,
    },
    input: {
      flex: 1,
      borderRadius: 20,
      padding: 12,
      paddingTop: 10,
      fontSize: 16,
      textAlignVertical: 'center',
      minHeight: UI_CONFIG.INPUT_MIN_HEIGHT,
      maxHeight: UI_CONFIG.INPUT_MAX_HEIGHT,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    previewImageContainer: {
      maxWidth: '40%',
      padding: 8,
      backgroundColor: colors.surface,
      borderRadius: 20,
      marginBottom: 8,
    },
    previewImage: {
      width: '100%',
      height: 100,
      borderRadius: 8,
    },
    clearImageButton: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: colors.surface,
      borderRadius: 12,
      margin: 8,
      padding: 4,
    },
    messageContent: {
      gap: 4,
      alignItems: 'center',
    },
    messageImage: {
      width: 250,
      height: 250,
      borderRadius: 8,
      marginVertical: 4,
      alignSelf: 'center',
    },
    originalMessageImage: {
      width: 150,
      height: 150,
      borderRadius: 8,
      marginTop: 8,
    },
    sendButton: {
      alignSelf: 'flex-end',
      padding: 8,
      paddingBottom: 14,
    },
    providerSelector: {
      flex: 1,
      alignItems: 'flex-end',
    },
    providerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      paddingHorizontal: 5,
      paddingVertical: 8,
      borderRadius: 10,
      minWidth: 100,
      alignSelf: 'flex-end',
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#ddd',
    },
    providerButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    providerText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 14,
      fontWeight: '500',
    },
    dropdownContent: {
      marginTop: 10,
      marginRight: 0,
      width: 220,
      backgroundColor: isDark ? '#333' : '#fff',
      borderRadius: 8,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      right: 20,
      top: 60,
    },
    dropdownModal: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.3)',
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
      flex: 1,
    },
    dropdownDivider: {
      height: 1,
      backgroundColor: isDark ? '#555' : '#ddd',
      marginVertical: 3,
    },
    errorContainer: {
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      padding: 10,
      marginHorizontal: 10,
      marginTop: 10,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: 'rgba(255, 0, 0, 0.3)',
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
    },
    noProvidersText: {
      color: isDark ? '#999' : '#666',
      fontSize: 15,
      padding: 14,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'flex-end',
    },
    mediaOptionsContainer: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: Platform.OS === 'ios' ? 40 : 20,
      backgroundColor: colors.mediaBackground,
      borderTopWidth: 1,
      borderColor: colors.mediaButtonBorder,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 5,
    },
    mediaOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      gap: 15,
      borderRadius: 12,
      backgroundColor: colors.mediaButtonBackground,
      marginVertical: 4,
    },
    mediaOptionActive: {
      backgroundColor: colors.mediaOptionHighlight,
    },
    mediaOptionText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    mediaOptionDivider: {
      height: 1,
      width: '100%',
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    mediaButton: {
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
      // borderRadius: 12,
      // backgroundColor: colors.mediaButtonBackground,
      // borderWidth: 1,
      // borderColor: colors.mediaButtonBorder,
    },
  });
};

// You can also declare the type for expoConfig if needed
declare global {
  namespace ReactNativePaper {
    interface ThemeColors {
      customBackground: string;
    }
  }
}

export default function Box1() {
  const router = useRouter();
  const { currentTheme, themePreference, setTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const styles = createStyles(isDark);
  const colors = isDark ? COLORS.dark : COLORS.light;
  const scrollViewRef = React.useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<Language>('English (US)');
  const [targetLanguage, setTargetLanguage] = useState<Language>('Hindi (IN)');
  const [activeUser, setActiveUser] = useState(1);
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastTranslationTime, setLastTranslationTime] = useState<number>(0);
  const [requestQueue, setRequestQueue] = useState<number>(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [lastUser1ClickTime, setLastUser1ClickTime] = useState<number>(0);
  const [lastUser2ClickTime, setLastUser2ClickTime] = useState<number>(0);
  const [isSourceLanguageSelectorOpen, setIsSourceLanguageSelectorOpen] = useState<boolean>(false);
  const [isTargetLanguageSelectorOpen, setIsTargetLanguageSelectorOpen] = useState<boolean>(false);
  const [errorAlertVisible, setErrorAlertVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [learnMoreUrl, setLearnMoreUrl] = useState<string | undefined>(undefined);
  const [detailedError, setDetailedError] = useState<string | undefined>(undefined);
  const [isUsingGlobalProvider, setIsUsingGlobalProvider] = useState(true);
  const [needsReset, setNeedsReset] = useState(false);
  const [isMediaOptionsVisible, setIsMediaOptionsVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isTogglingMessage, setIsTogglingMessage] = useState(false);
  const [preventScroll, setPreventScroll] = useState(false);
  const scrollPositionRef = useRef(0);

  const RATE_LIMIT_DELAY = 1000;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  const DOUBLE_CLICK_DELAY = 300;

  const { activeProviders, isProviderActive } = useProviders();
  const [selectedProvider, setSelectedProvider] = useState<ProviderType | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [activeProvidersList, setActiveProvidersList] = useState<ProviderType[]>([]);

  // Constants for storage keys
  const TOOL_PROVIDER_KEY = 'box1_selected_provider';
  const GLOBAL_PROVIDER_KEY = 'selected_provider';

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedSourceLang = await AsyncStorage.getItem('sourceLanguage');
        const savedTargetLang = await AsyncStorage.getItem('targetLanguage');
        const savedActiveUser = await AsyncStorage.getItem('activeUser');
        const savedMessages = await AsyncStorage.getItem('chatMessages');

        if (savedSourceLang && LANGUAGES.includes(savedSourceLang as Language)) {
          setSourceLanguage(savedSourceLang as Language);
        }
        if (savedTargetLang && LANGUAGES.includes(savedTargetLang as Language)) {
          setTargetLanguage(savedTargetLang as Language);
        }
        if (savedActiveUser) {
          setActiveUser(parseInt(savedActiveUser, 10));
        }
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          const updatedMessages = parsedMessages.map((msg: Message) => ({
            ...msg,
            expanded: msg.originalText ? false : undefined
          }));
          setMessages(updatedMessages);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadSavedData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('sourceLanguage', sourceLanguage);
        await AsyncStorage.setItem('targetLanguage', targetLanguage);
        await AsyncStorage.setItem('activeUser', activeUser.toString());
        await AsyncStorage.setItem('chatMessages', JSON.stringify(messages));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    saveData();
  }, [sourceLanguage, targetLanguage, activeUser, messages]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        setKeyboardVisible(true);
        // Immediately scroll to bottom when keyboard appears
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
          // Force layout update to ensure correct positioning
          setNeedsReset(false);
        }, 10);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setNeedsReset(true);
        // Reset scroll position when keyboard hides
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 10);
      }
    );
    
    // Add keyboard will show listener with improved handling
    const keyboardWillShowListener = Platform.OS === 'ios' 
      ? Keyboard.addListener('keyboardWillShow', () => {
          // Pre-emptively prepare UI for keyboard
          setKeyboardVisible(true);
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 10);
        })
      : { remove: () => {} }; // Dummy for Android
      
    const keyboardWillHideListener = Platform.OS === 'ios'
      ? Keyboard.addListener('keyboardWillHide', () => {
          setNeedsReset(true);
        })
      : { remove: () => {} }; // Dummy for Android

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [messages.length]);

  useEffect(() => {
    if (messages.length > 0 && !preventScroll) {
      const isNewMessage = messages[messages.length - 1].timestamp > Date.now() - 1000;
      if (isNewMessage) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 10);
      }
    }
  }, [messages, preventScroll]);

  // Use useFocusEffect to scroll to bottom when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (messages.length > 0) {
        // Small delay to ensure the view is fully rendered
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 10);
      }
      
      // Also handle app state changes to scroll when app comes back from background
      const subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active' && messages.length > 0) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 10);
        }
      });
      
      return () => {
        subscription.remove();
      };
    }, [messages.length])
  );

  // Load the selected provider from AsyncStorage
  useEffect(() => {
    const loadSelectedProvider = async () => {
      try {
        // First try to load the tool-specific provider
        const toolProvider = await AsyncStorage.getItem(TOOL_PROVIDER_KEY);
        
        if (toolProvider && isProviderActive(toolProvider as ProviderType)) {
          // If there's a saved tool-specific provider and it's active, use it
          setSelectedProvider(toolProvider as ProviderType);
          setIsUsingGlobalProvider(false);
        } else {
          // If no tool-specific provider, try to load the global provider
          const globalProvider = await AsyncStorage.getItem(GLOBAL_PROVIDER_KEY);
          
          if (globalProvider && isProviderActive(globalProvider as ProviderType)) {
            // If there's a saved global provider and it's active, use it
            setSelectedProvider(globalProvider as ProviderType);
            setIsUsingGlobalProvider(true);
          } else {
            // If no provider is selected or the saved providers are not active,
            // find the first active one
            const activeProvs = Object.entries(activeProviders)
              .filter(([_, isActive]) => isActive)
              .map(([provider]) => provider as ProviderType);
            
            if (activeProvs.length > 0) {
              setSelectedProvider(activeProvs[0]);
              // Save the selected provider to tool-specific AsyncStorage
              await AsyncStorage.setItem(TOOL_PROVIDER_KEY, activeProvs[0]);
              setIsUsingGlobalProvider(false);
            } else {
              setSelectedProvider(null);
              setProviderError('No active AI provider found. Please enable a provider in the API settings.');
            }
          }
        }
      } catch (error) {
        console.error('Error loading selected provider:', error);
        setProviderError('Error loading AI provider. Please check your settings.');
      }
    };
    
    loadSelectedProvider();
  }, [activeProviders, isProviderActive]);

  // Load active providers list
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
      setDropdownVisible(false);
    } catch (error) {
      console.error('Error saving selected provider:', error);
    }
  };

  // Get provider display name
  const getProviderDisplayName = (provider: ProviderType): string => {
    const displayNames: Record<ProviderType, string> = {
      openai: 'OpenAI',
      google: 'Google',
      anthropic: 'Anthropic',
      openrouter: 'OpenRouter',
      groq: 'Groq'
    };
    return displayNames[provider] || provider;
  };

  const getPlaceholder = () => {
    const lang = activeUser === 1 ? sourceLanguage : targetLanguage;
    return PLACEHOLDER_TRANSLATIONS[lang] || "Type your message...";
  };

  const translateText = async (text: string, retryCount = 0): Promise<string> => {
    try {
      if (isTranslating) {
        throw new Error('Please wait for the previous translation to complete');
      }

      const now = Date.now();
      const timeSinceLastTranslation = now - lastTranslationTime;
      if (timeSinceLastTranslation < RATE_LIMIT_DELAY) {
        const waitTime = RATE_LIMIT_DELAY - timeSinceLastTranslation;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      setIsTranslating(true);
      setLastTranslationTime(Date.now());
      setRequestQueue(prev => prev + 1);

      // Check if we have a selected provider
      if (!selectedProvider) {
        throw new Error('No AI provider selected. Please select a provider in the API settings.');
      }

      // Check if the selected provider is active
      if (!isProviderActive(selectedProvider)) {
        throw new Error(`The selected provider (${selectedProvider}) is not active. Please enable it in the API settings.`);
      }

      const fromLanguage = activeUser === 1 ? sourceLanguage : targetLanguage;
      const toLanguage = activeUser === 1 ? targetLanguage : sourceLanguage;

      // Create translation request
      const request: TranslationRequest = {
        text,
        fromLanguage,
        toLanguage
      };

      // Call the API utility function to translate
      const result = await apiTranslateText(request, selectedProvider);

      if (!result.success) {
        const error = new Error(result.error || 'Translation failed');
        // Attach the API response to the error object
        (error as any).response = result.response;
        (error as any).providerInfo = result.providerInfo;
        throw error;
      }

      setIsTranslating(false);
      setRequestQueue(prev => prev - 1);
      return result.translatedText;
    } catch (error: any) {
      console.error('Translation error:', error);
      setIsTranslating(false);
      setRequestQueue(prev => prev - 1);
      
      // Handle rate limiting errors by retrying
      if (error.message.includes('rate limit') && retryCount < 3) {
        console.log(`Rate limit hit, retrying (${retryCount + 1}/3)...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return translateText(text, retryCount + 1);
      }
      
      // Format and show error using the utility function
      const additionalInfo = {
        'From': activeUser === 1 ? sourceLanguage : targetLanguage,
        'To': activeUser === 1 ? targetLanguage : sourceLanguage
      };
      
      const formattedError = formatApiError(error, selectedProvider, additionalInfo);
      
      setErrorTitle(formattedError.title);
      setErrorMessage(formattedError.message);
      setLearnMoreUrl(formattedError.learnMoreUrl);
      setDetailedError(formattedError.detailedError);
      setErrorAlertVisible(true);
      
      throw error;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !previewImage) return;

    const newMessage: Message = {
      text: inputText.trim(),
      isUser1: activeUser === 1,
      timestamp: Date.now(),
      imageUri: previewImage || undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setPreviewImage(null);

    try {
      let textToTranslate = inputText.trim();
      let isImageMessage = false;
      let combinedInput = false;
      
      // If there's an image, convert it to base64
      if (previewImage) {
        try {
          const response = await fetch(previewImage);
          const blob = await response.blob();
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('Failed to convert image to base64'));
              }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          
          isImageMessage = true;
          
          // If there's also text input, we'll handle them separately in the translation request
          if (textToTranslate) {
            combinedInput = true;
            // Create a combined request that includes both image and text
            const request: TranslationRequest = {
              text: base64,
              additionalText: textToTranslate, // This will be handled in translatorApiUtils
              fromLanguage: activeUser === 1 ? sourceLanguage : targetLanguage,
              toLanguage: activeUser === 1 ? targetLanguage : sourceLanguage
            };

            const translatedResult = await apiTranslateText(request, selectedProvider as ProviderType);
            
            if (!translatedResult.success) {
              throw new Error(translatedResult.error || 'Translation failed');
            }

            const translatedMessage: Message = {
              text: translatedResult.translatedText,
              isUser1: activeUser !== 1,
              originalText: textToTranslate,
              timestamp: Date.now(),
              expanded: false,
              originalImageUri: newMessage.imageUri,
              imageUri: undefined
            };

            setMessages(prev => [...prev, translatedMessage]);
          } else {
            // Image only translation
            textToTranslate = base64;
          }
        } catch (error) {
          console.error('Error processing image and text:', error);
          throw new Error('Failed to process image and text for translation. Please try again.');
        }
      }

      // Handle text-only or image-only cases
      if (!combinedInput && textToTranslate) {
        const translatedText = await translateText(textToTranslate);
        const translatedMessage: Message = {
          text: translatedText,
          isUser1: activeUser !== 1,
          originalText: isImageMessage ? inputText.trim() || "Image only" : inputText.trim(),
          timestamp: Date.now(),
          expanded: false,
          originalImageUri: newMessage.imageUri,
          imageUri: undefined
        };

        setMessages(prev => [...prev, translatedMessage]);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      const formattedError = formatApiError(error, selectedProvider);
      
      setErrorTitle(formattedError.title);
      setErrorMessage(formattedError.message);
      setLearnMoreUrl(formattedError.learnMoreUrl);
      setDetailedError(formattedError.detailedError);
      setErrorAlertVisible(true);
      
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const handleScroll = (event: any) => {
    if (!preventScroll) {
      scrollPositionRef.current = event.nativeEvent.contentOffset.y;
    }
  };

  const toggleMessageExpansion = (index: number) => {
    const currentScrollPosition = scrollPositionRef.current;
    setPreventScroll(true);
    
    setMessages(prevMessages => {
      const newMessages = [...prevMessages];
      newMessages[index] = {
        ...newMessages[index],
        expanded: !newMessages[index].expanded
      };
      return newMessages;
    });

    // Use requestAnimationFrame to maintain scroll position
    requestAnimationFrame(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: currentScrollPosition, animated: false });
        setTimeout(() => {
          setPreventScroll(false);
        }, 300);
      }
    });
  };

  const clearChat = () => {
    if (messages.length > 0) {
      setMessages([]);
      setAlertVisible(false);
    }
  };

  const handleClearButtonPress = () => {
    if (messages.length > 0) {
      setAlertVisible(true);
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
        
        // Remove the tool-specific provider
        await AsyncStorage.removeItem(TOOL_PROVIDER_KEY);
        setIsUsingGlobalProvider(true);
      } else {
        // If no global provider or it's not active, find the first active one
        const activeProvs = Object.entries(activeProviders)
          .filter(([_, isActive]) => isActive)
          .map(([provider]) => provider as ProviderType);
        
        if (activeProvs.length > 0) {
          setSelectedProvider(activeProvs[0]);
          setIsUsingGlobalProvider(true);
        } else {
          setSelectedProvider(null);
          setProviderError('No active AI provider found. Please enable a provider in the API settings.');
        }
      }
    } catch (error) {
      console.error('Error resetting to global provider:', error);
    }
  };

  // Listen for changes to the global provider
  useEffect(() => {
    const checkGlobalProvider = async () => {
      try {
        // Only check if we're currently using the global provider
        if (isUsingGlobalProvider) {
          const globalProvider = await AsyncStorage.getItem(GLOBAL_PROVIDER_KEY);
          
          if (globalProvider && isProviderActive(globalProvider as ProviderType) && 
              globalProvider !== selectedProvider) {
            // If the global provider has changed and it's active, update our selected provider
            setSelectedProvider(globalProvider as ProviderType);
          }
        }
      } catch (error) {
        console.error('Error checking global provider:', error);
      }
    };
    
    // Set up an interval to check for changes to the global provider
    const intervalId = setInterval(checkGlobalProvider, 2000);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [isUsingGlobalProvider, selectedProvider, isProviderActive]);

  // Function to reset UI positioning
  const resetUIPositioning = () => {
    if (needsReset) {
      // Force a re-render to reset positioning
      setNeedsReset(false);
      // Small delay to ensure the reset happens after keyboard is fully dismissed
      setTimeout(() => {
        // This will trigger a re-render and reset the position
        setInputText(inputText => inputText);
      }, 100);
    }
  };

  // Effect to handle UI reset when keyboard is dismissed
  useEffect(() => {
    if (!keyboardVisible && needsReset) {
      // Reset the UI positioning
      setTimeout(() => {
        setNeedsReset(false);
        // Force a re-render to reset positioning
        setInputText(inputText => inputText);
      }, 100);
    }
  }, [keyboardVisible, needsReset]);

  // Add media option handlers
  const handleTakePhoto = async () => {
    setIsMediaOptionsVisible(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
        aspect: undefined,
        allowsMultipleSelection: false
      });

      if (!result.canceled) {
        setPreviewImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleUploadPicture = async () => {
    setIsMediaOptionsVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant media library permissions to upload pictures.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
        aspect: undefined,
        allowsMultipleSelection: false
      });

      if (!result.canceled) {
        setPreviewImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error selecting picture:', error);
      Alert.alert('Error', 'Failed to select picture. Please try again.');
    }
  };

  // Add media options modal component
  const MediaOptionsModal = () => (
    <Modal
      visible={isMediaOptionsVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsMediaOptionsVisible(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsMediaOptionsVisible(false)}
      >
        <View style={styles.mediaOptionsContainer}>
          <TouchableOpacity
            style={styles.mediaOption}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="camera-outline" 
              size={24} 
              color={colors.mediaButtonIcon} 
            />
            <Text style={styles.mediaOptionText}>Take Photo</Text>
          </TouchableOpacity>
          <View style={styles.mediaOptionDivider} />
          <TouchableOpacity
            style={styles.mediaOption}
            onPress={handleUploadPicture}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="image-outline" 
              size={24} 
              color={colors.mediaButtonIcon} 
            />
            <Text style={styles.mediaOptionText}>Upload Picture</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.toggleButton} onPress={() => router.push('/')}>
            <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.logo}>Translator</Text>
        </View>
        
        <View style={styles.providerSelector}>
          <TouchableOpacity 
            onPress={() => setDropdownVisible(!dropdownVisible)}
            style={styles.providerButton}
          >
            <View style={styles.providerButtonContent}>
              {selectedProvider ? (
                <>
                  {selectedProvider === 'openai' && <OpenAILogo width={24} height={24} useThemeColor={true} />}
                  {selectedProvider === 'google' && <GeminiLogo width={24} height={24} />}
                  {selectedProvider === 'anthropic' && <AnthropicLogo width={24} height={24} fill="#d97757" />}
                  {selectedProvider === 'openrouter' && <OpenRouterLogo width={24} height={24} useThemeColor={true} />}
                  {selectedProvider === 'groq' && <GroqLogo width={24} height={24} fill="#ffffff" />}
                  <Text style={styles.providerText} numberOfLines={1} ellipsizeMode="tail">
                    {getProviderDisplayName(selectedProvider)}
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-outline" size={24} color={isDark ? '#fff' : '#000'} />
                  <Text style={styles.providerText} numberOfLines={1} ellipsizeMode="tail">
                    {activeProvidersList.length > 0 ? 'Select Provider' : 'No Providers'}
                  </Text>
                </>
              )}
              <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={isDark ? '#fff' : '#000'} />
            </View>
          </TouchableOpacity>
          
          {/* Provider Selection Dropdown */}
          <Modal
            visible={dropdownVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
          >
            <TouchableOpacity 
              style={styles.dropdownModal}
              activeOpacity={1}
              onPress={() => setDropdownVisible(false)}
            >
              <View style={[styles.dropdownContent]}>
                {activeProvidersList.length > 0 ? (
                  <>
                    {activeProvidersList.map((provider) => (
                      <TouchableOpacity
                        key={provider}
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
                        <Text style={styles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                          {getProviderDisplayName(provider)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <View style={styles.dropdownDivider} />
                    <TouchableOpacity
                      style={styles.dropdownItem}
                      onPress={resetToGlobalProvider}
                    >
                      <Ionicons name="globe-outline" size={24} color={isDark ? '#fff' : '#000'} />
                      <Text style={styles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                        Use Global Provider
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={styles.noProvidersText}>
                    No active providers
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </Modal>
        </View>
        
        <TouchableOpacity 
          onPress={handleClearButtonPress} 
          style={[
            styles.clearButton, 
            messages.length === 0 && styles.clearButtonDisabled
          ]}
          disabled={messages.length === 0}
        >
          <Ionicons name="trash-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      {/* Add provider error message */}
      {providerError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{providerError}</Text>
        </View>
      )}
      
      {/* Fixed Language Selector */}
      <View style={styles.languageSelector}>
        <View style={styles.languageSelectorContainer}>
          <View style={styles.languageBox}>
            <LanguageSelector
              selectedLanguage={sourceLanguage}
              onSelect={(lang: Language) => setSourceLanguage(lang)}
              languages={LANGUAGES}
              isDark={isDark}
              isOpen={isSourceLanguageSelectorOpen}
              onClose={() => setIsSourceLanguageSelectorOpen(false)}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              setSourceLanguage(targetLanguage);
              setTargetLanguage(sourceLanguage);
            }}
            style={styles.swapButton}
          >
            <Ionicons name="swap-horizontal" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.languageBox}>
            <LanguageSelector
              selectedLanguage={targetLanguage}
              onSelect={(lang: Language) => setTargetLanguage(lang)}
              languages={LANGUAGES}
              isDark={isDark}
              isOpen={isTargetLanguageSelectorOpen}
              onClose={() => setIsTargetLanguageSelectorOpen(false)}
            />
          </View>
        </View>
      </View>

      {/* Main content area with messages - Modified container style */}
      <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: keyboardVisible ? 10 : 130 }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={() => {
            // Only scroll to bottom for new messages
            const isNewMessage = messages.length > 0 && 
              messages[messages.length - 1].timestamp > Date.now() - 1000;
            if (isNewMessage && !preventScroll) {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }}
          onLayout={() => {
            // Only scroll on initial layout
            if (messages.length > 0 && !preventScroll) {
              scrollViewRef.current?.scrollToEnd({ animated: false });
            }
          }}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageContainer,
                message.isUser1 ? styles.user1Container : styles.user2Container,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isUser1 ? styles.user1Bubble : styles.user2Bubble,
                ]}
              >
                <View style={styles.messageContent}>
                  {message.imageUri && !message.originalText && (
                    <Image 
                      source={{ uri: message.imageUri }} 
                      style={styles.messageImage}
                      resizeMode="contain"
                    />
                  )}
                  {message.text && (
                    <Text style={[
                      styles.messageText,
                      message.imageUri ? styles.messageTextWithImage : styles.messageTextOnly
                    ]}>
                      {message.text}
                    </Text>
                  )}
                  {(message.originalText || message.originalImageUri) && (
                    <TouchableOpacity
                      onPress={() => toggleMessageExpansion(index)}
                      style={styles.originalTextButton}
                    >
                      <Text style={styles.originalTextButtonText}>
                        {message.expanded ? 'Hide Original' : 'Show Original'}
                      </Text>
                      {message.expanded && (
                        <>
                          {message.originalText && message.originalText !== "Image only" && (
                            <Text style={styles.originalText}>
                              {message.originalText}
                            </Text>
                          )}
                          {message.originalImageUri && (
                            <Image 
                              source={{ uri: message.originalImageUri }} 
                              style={styles.originalMessageImage}
                              resizeMode="contain"
                            />
                          )}
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Modified KeyboardAvoidingView configuration */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? keyboardVisible ? 'padding' : 'height' : keyboardVisible ? 'padding' : 'height'}
        keyboardVerticalOffset={UI_CONFIG.KEYBOARD_OFFSET}
        enabled={true}
        style={{ width: '100%' }}
      >
        <View style={[
          styles.bottomContainer,
          !keyboardVisible && { position: 'absolute', bottom: 0, left: 0, right: 0 },
          keyboardVisible && { position: 'relative', paddingBottom: 0 }
        ]}>
          <View style={styles.userToggle}>
            <TouchableOpacity
              style={[
                styles.userButton,
                activeUser === 1 && styles.activeUserButton,
              ]}
              onPress={() => {
                const now = new Date().getTime();
                if (now - lastUser1ClickTime < DOUBLE_CLICK_DELAY) {
                  setIsSourceLanguageSelectorOpen(true);
                } else {
                  setActiveUser(1);
                }
                setLastUser1ClickTime(now);
              }}
            >
              <View style={[
                styles.userLanguageLegend,
                { backgroundColor: activeUser === 1 ? colors.primary : colors.inactive }
              ]}>
                <Text style={styles.userLanguageLegendText}>{sourceLanguage}</Text>
              </View>
              <Text style={[
                styles.userButtonText,
                activeUser === 1 && styles.activeUserButtonText,
              ]}>User 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.userButton,
                activeUser === 2 && styles.activeUserButton,
              ]}
              onPress={() => {
                const now = new Date().getTime();
                if (now - lastUser2ClickTime < DOUBLE_CLICK_DELAY) {
                  setIsTargetLanguageSelectorOpen(true);
                } else {
                  setActiveUser(2);
                }
                setLastUser2ClickTime(now);
              }}
            >
              <View style={[
                styles.userLanguageLegend,
                { backgroundColor: activeUser === 2 ? colors.primary : colors.inactive }
              ]}>
                <Text style={styles.userLanguageLegendText}>{targetLanguage}</Text>
              </View>
              <Text style={[
                styles.userButtonText,
                activeUser === 2 && styles.activeUserButtonText,
              ]}>User 2</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            {previewImage && (
              <View style={styles.previewImageContainer}>
                <Image 
                  source={{ uri: previewImage }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.clearImageButton}
                  onPress={() => setPreviewImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => setIsMediaOptionsVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="add-circle-outline" 
                  size={24} 
                  color={colors.mediaButtonIcon} 
                />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder={getPlaceholder()}
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                keyboardType="default"
                returnKeyType="send"
                autoCapitalize="none"
                autoCorrect={true}
                enablesReturnKeyAutomatically={true}
                onSubmitEditing={handleSend}
                onSelectionChange={() => {
                  if (keyboardVisible) {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: false });
                    }, 50);
                  }
                }}
              />
            
            <TouchableOpacity
              style={[styles.sendButton, { opacity: (inputText.trim() || previewImage) ? 1 : 0.5 }]}
              onPress={handleSend}
              disabled={!inputText.trim() && !previewImage || isTranslating}
            >
              {isTranslating ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Ionicons name="send" size={24} color={colors.text} />
              )}
            </TouchableOpacity>
            </View>
          </View>
          <MediaOptionsModal />
        </View>
      </KeyboardAvoidingView>

      <CustomAlert 
        visible={isAlertVisible}
        title="Clear Chat"
        message="Are you sure you want to clear all messages?"
        onCancel={() => setAlertVisible(false)}
        onConfirm={clearChat}
        isDark={isDark}
      />

      <ErrorAlert
        visible={errorAlertVisible}
        title={errorTitle}
        message={errorMessage}
        learnMoreUrl={learnMoreUrl}
        onDismiss={() => setErrorAlertVisible(false)}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}