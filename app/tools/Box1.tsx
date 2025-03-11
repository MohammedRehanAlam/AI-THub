import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, Keyboard, Modal, AppState } from 'react-native';
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
  }
};

interface Message {
  text: string;
  isUser1: boolean;
  timestamp: number;
  originalText?: string;
  expanded?: boolean;
}

const CustomAlert = ({ visible, title, message, onCancel, onConfirm, isDark }: { visible: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void; isDark: boolean; }) => {
  const styles = createStyles(isDark);
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  return (
    <Modal transparent={true} visible={visible} animationType='fade'>
      <BlurView intensity={10} tint={isDark ? 'dark' : 'light'} style={styles.overlay}>
        <View style={[styles.alertBox, { backgroundColor: isDark ? 'rgba(26, 26, 26, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}> 
          <Text style={[styles.alertTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.alertMessage, { color: colors.text }]}>{message}</Text>
          <View style={[styles.buttonContainer, { justifyContent: 'center' }]}>
            <TouchableOpacity onPress={onCancel} style={styles.button}><Text style={styles.buttonText}>CANCEL</Text></TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.button}><Text style={styles.buttonText}>CLEAR</Text></TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const createStyles = (isDark: boolean) => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    toggleButton: {
      padding: 4,
    },
    clearButton: {
      padding: 4,
    },
    clearButtonDisabled: {
      opacity: 0.3,
    },
    logo: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
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
      gap: 16,
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
      paddingBottom: Platform.OS === 'ios' ? 30 : 16,
      backgroundColor: colors.background,
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
      paddingVertical: 12,
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
      flexDirection: 'row',
      width: 'auto',
      paddingLeft: 16,
      paddingRight: 16,    
      gap: 5,
    },
    input: {
      flex: 1,
      borderRadius: 20,
      padding: 12,
      paddingTop: 10,
      fontSize: 16,
      maxHeight: 130,
      textAlignVertical: 'center',
      minHeight: 48,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    sendButton: {
      alignSelf: 'flex-end',
      padding: 8,
      paddingBottom: 14,
    },
  });
};

// Add this type declaration for the manifest extra
type ExtraType = {
  GEMINI_API_KEY?: string;
  // Add any other extra properties you might have
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
  const [shouldAnimateScroll, setShouldAnimateScroll] = useState(true);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [lastUser1ClickTime, setLastUser1ClickTime] = useState<number>(0);
  const [lastUser2ClickTime, setLastUser2ClickTime] = useState<number>(0);
  const [isSourceLanguageSelectorOpen, setIsSourceLanguageSelectorOpen] = useState<boolean>(false);
  const [isTargetLanguageSelectorOpen, setIsTargetLanguageSelectorOpen] = useState<boolean>(false);
  const [errorAlertVisible, setErrorAlertVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const RATE_LIMIT_DELAY = 1000;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  const DOUBLE_CLICK_DELAY = 300;

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
          setShouldAnimateScroll(false);
          setTimeout(() => {
            setShouldAnimateScroll(true);
          }, 500);
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
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: shouldAnimateScroll });
      }, 100);
    }
  }, [messages, shouldAnimateScroll]);

  useEffect(() => {
    if (keyboardVisible && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);
    }
  }, [keyboardVisible, messages.length]);

  // Use useFocusEffect to scroll to bottom when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (messages.length > 0) {
        // Small delay to ensure the view is fully rendered
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: false });
        }, 300);
      }
      
      // Also handle app state changes to scroll when app comes back from background
      const subscription = AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active' && messages.length > 0) {
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: false });
          }, 300);
        }
      });
      
      return () => {
        subscription.remove();
      };
    }, [messages.length])
  );

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

      // Get API key from Constants instead of process.env
      const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY || 
                    (Constants.manifest && (Constants.manifest as any).extra?.GEMINI_API_KEY) || 
                    process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('API key missing. Constants:', JSON.stringify(Constants.expoConfig?.extra || {}));
        throw new Error('API key not configured. Please set it in your environment variables.');
      }

      const fromLanguage = activeUser === 1 ? sourceLanguage : targetLanguage;
      const toLanguage = activeUser === 1 ? targetLanguage : sourceLanguage;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Translate the following text from ${fromLanguage} to ${toLanguage}. Only provide the translation, no additional text: ${text}`
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data = await response.json();
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response from translation service');
      }

      return data.candidates[0].content.parts[0].text.trim();

    } catch (error) {
      console.error('Translation error:', error);
      
      // Log more detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // Check for specific error conditions
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error - check internet connection');
      }
      
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying translation (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return translateText(text, retryCount + 1);
      }
      throw error;
    } finally {
      setIsTranslating(false);
      setRequestQueue(prev => prev - 1);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const trimmedText = inputText.trim();
    setInputText('');

    const newMessage: Message = {
      text: trimmedText,
      isUser1: activeUser === 1,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);

    try {
      const translatedText = await translateText(trimmedText);
      const translatedMessage: Message = {
        text: translatedText,
        isUser1: activeUser !== 1,
        originalText: trimmedText,
        timestamp: Date.now(),
        expanded: false
      };

      setMessages(prev => [...prev, translatedMessage]);
    } catch (error) {
      console.error('Send error:', error);
      
      let errorTitle = 'Translation Error';
      let errorMessage = 'Failed to translate text. Please try again.';
      
      // Provide more specific error messages based on the error type
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          errorMessage = 'API key not properly configured. Please check your app settings.';
        } else if (error.message.includes('Network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        }
      }
      
      setErrorTitle(errorTitle);
      setErrorMessage(errorMessage);
      setErrorAlertVisible(true);
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const toggleMessageExpansion = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, expanded: !msg.expanded } : msg
    ));
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.toggleButton} onPress={() => router.push('/')}>
            <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.logo}>Translator</Text>
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

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            scrollViewRef.current?.scrollToEnd({ animated: shouldAnimateScroll });
          }
        }}
        onLayout={() => {
          if (messages.length > 0) {
            scrollViewRef.current?.scrollToEnd({ animated: shouldAnimateScroll });
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
              <Text style={styles.messageText}>
                {message.text}
              </Text>
              {message.originalText && (
                <TouchableOpacity
                  onPress={() => toggleMessageExpansion(index)}
                  style={styles.originalTextButton}
                >
                  <Text style={styles.originalTextButtonText}>
                    {message.expanded ? 'Hide Original' : 'Show Original'}
                  </Text>
                  {message.expanded && (
                    <Text style={styles.originalText}>
                      {message.originalText}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.bottomContainer}>
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

        <View style={[
          styles.inputContainer, 
          keyboardVisible && { paddingBottom: 4 }
        ]}>
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
          />
          <TouchableOpacity
            style={[styles.sendButton, { opacity: inputText.trim() ? 1 : 0.5 }]}
            onPress={handleSend}
            disabled={!inputText.trim() || isTranslating}
          >
            {isTranslating ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Ionicons name="send" size={24} color={colors.text} />
            )}
          </TouchableOpacity>
        </View>
      </View>

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
        onDismiss={() => setErrorAlertVisible(false)}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}