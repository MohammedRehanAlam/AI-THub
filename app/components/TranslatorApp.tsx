import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, Keyboard, LayoutChangeEvent, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LanguageSelector from './LanguageSelector';
import { LANGUAGES } from '../constants/languages';
import { PLACEHOLDER_TRANSLATIONS } from '../constants/placeholders';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = keyof typeof PLACEHOLDER_TRANSLATIONS;

interface Message {
  text: string;
  isUser1: boolean;
  originalText?: string;
  timestamp: number;
  expanded?: boolean;
}

interface TranslatorAppProps {
  onClose: () => void;
}

const CustomAlert = ({ visible, title, message, onCancel, onConfirm, isDark }: { visible: boolean; title: string; message: string; onCancel: () => void; onConfirm: () => void; isDark: boolean; }) => {
  return (
    <Modal transparent={true} visible={visible} animationType='fade'>
      <View style={styles.overlay}>
        <View style={[styles.alertBox, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}> 
          <Text style={[styles.alertTitle, { color: isDark ? '#ffffff' : '#000000' }]}>{title}</Text>
          <Text style={[styles.alertMessage, { color: isDark ? '#ffffff' : '#000000' }]}>{message}</Text>
          <View style={[styles.buttonContainer, { justifyContent: 'center' }]}>
            <TouchableOpacity onPress={onCancel} style={styles.button}><Text style={styles.buttonText}>CANCEL</Text></TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.button}><Text style={styles.buttonText}>CLEAR</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const TranslatorApp: React.FC<TranslatorAppProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState<Language>('Hindi');
  const [targetLanguage, setTargetLanguage] = useState<Language>('English');
  const [activeUser, setActiveUser] = useState(1);
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastTranslationTime, setLastTranslationTime] = useState<number>(0);
  const [requestQueue, setRequestQueue] = useState<number>(0);
  const RATE_LIMIT_DELAY = 1000;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  const [shouldAnimateScroll, setShouldAnimateScroll] = useState(true);
  const [inputHeight, setInputHeight] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [preventScroll, setPreventScroll] = useState(false);
  const scrollPositionRef = useRef(0);
  const [isAlertVisible, setAlertVisible] = useState(false);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedSourceLang = await AsyncStorage.getItem('sourceLanguage');
        const savedTargetLang = await AsyncStorage.getItem('targetLanguage');
        const savedActiveUser = await AsyncStorage.getItem('activeUser');
        const savedMessages = await AsyncStorage.getItem('chatMessages');

        if (savedSourceLang && savedSourceLang in PLACEHOLDER_TRANSLATIONS) {
          setSourceLanguage(savedSourceLang as Language);
        }
        if (savedTargetLang && savedTargetLang in PLACEHOLDER_TRANSLATIONS) {
          setTargetLanguage(savedTargetLang as Language);
        }
        if (savedActiveUser) {
          setActiveUser(parseInt(savedActiveUser, 10));
        }
        if (savedMessages) {
          const parsedMessages = JSON.parse(savedMessages);
          // Ensure all messages with originalText have expanded property set to false by default
          const updatedMessages = parsedMessages.map((msg: Message) => {
            if (msg.originalText && msg.expanded === undefined) {
              return { ...msg, expanded: false };
            }
            return msg;
          });
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
    if (messages.length > 0 && shouldAnimateScroll) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < messages.length) {
          scrollViewRef.current?.scrollTo({
            y: currentIndex * 10, // Approximate height per message
            animated: true
          });
          currentIndex++;
        } else {
          clearInterval(interval);
          // Ensure we're at the very bottom at the end
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 10);
          setShouldAnimateScroll(false);
        }
      }, 10); // Adjust timing between scrolls

      return () => clearInterval(interval);
    }
  }, [messages, shouldAnimateScroll]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const getPlaceholder = () => {
    const lang = activeUser === 1 ? sourceLanguage : targetLanguage;
    return PLACEHOLDER_TRANSLATIONS[lang];
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

      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API key is not configured');
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
            }],
            generationConfig: {
              temperature: 0.1,
              topP: 1,
              topK: 1,
              maxOutputTokens: 1024, 
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Translation API error:', errorData);
        
        if (response.status === 429 && retryCount < MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return translateText(text, retryCount + 1);
        }
        
        throw new Error(errorData.error?.message || 'Translation failed');
      }

      const data = await response.json();
      const translation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!translation) {
        throw new Error('No translation received');
      }

      return translation;
    } catch (error) {
      console.error('Translation error:', error);
      Alert.alert('Translation Error', error instanceof Error ? error.message : 'An error occurred');
      return 'Translation failed';
    } finally {
      setRequestQueue(prev => Math.max(0, prev - 1));
      setTimeout(() => {
        setIsTranslating(false);
      }, requestQueue > 0 ? RATE_LIMIT_DELAY : 0);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isTranslating) return;

    const newMessage: Message = {
      text: inputText,
      isUser1: activeUser === 1,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    const translation = await translateText(inputText);
    
    if (translation !== 'Translation failed') {
      const translatedMessage: Message = {
        text: translation,
        isUser1: activeUser !== 1,
        originalText: inputText,
        timestamp: Date.now(),
        expanded: false,
      };

      setMessages(prev => [...prev, translatedMessage]);
    }
  };

  const clearChat = () => {
    if (messages.length === 0) return; // Do nothing if there are no messages
    setAlertVisible(true);
  };

  const handleConfirmClear = async () => {
    setMessages([]);
    try {
      await AsyncStorage.removeItem('chatMessages');
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
    setAlertVisible(false);
  };

  const handleScroll = (event: any) => {
    scrollPositionRef.current = event.nativeEvent.contentOffset.y;
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
    
    requestAnimationFrame(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: currentScrollPosition, animated: false });
        
        setTimeout(() => {
          setPreventScroll(false);
        }, 300);
      }
    });
  };

  const scrollToBottom = () => {
    if (!shouldAnimateScroll && !preventScroll) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    if (!shouldAnimateScroll && !preventScroll && messages.length > 0) {
      // Only scroll to bottom for new messages, not for expand/collapse actions
      const isNewMessage = messages[messages.length - 1].timestamp > Date.now() - 1000;
      if (isNewMessage) {
        scrollToBottom();
      }
    }
  }, [messages, shouldAnimateScroll, preventScroll]);

  const handleClose = () => {
    setShouldAnimateScroll(true);
    onClose();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      <CustomAlert 
        visible={isAlertVisible} 
        title='Clear Chat' 
        message='Are you sure you want to clear all messages? This cannot be undone.' 
        onCancel={() => setAlertVisible(false)} 
        onConfirm={handleConfirmClear} 
        isDark={isDark} 
      />
      <View style={[styles.header, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Translator</Text>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton} disabled={messages.length === 0}>
          <Ionicons name="trash-outline" size={24} color={messages.length === 0 ? '#aaa' : (isDark ? '#fff' : '#000')} />
        </TouchableOpacity>
      </View>

      <View style={[styles.languageBar, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
        <View style={styles.languageSelector}>
          <LanguageSelector
            selectedLanguage={sourceLanguage}
            onSelect={setSourceLanguage}
            languages={LANGUAGES}
            isDark={isDark}
          />
        </View>
        <TouchableOpacity 
          onPress={() => {
            const temp = sourceLanguage;
            setSourceLanguage(targetLanguage);
            setTargetLanguage(temp);
          }} 
          style={styles.swapButton}
        >
          <Ionicons name="swap-horizontal" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <View style={styles.languageSelector}>
          <LanguageSelector
            selectedLanguage={targetLanguage}
            onSelect={setTargetLanguage}
            languages={LANGUAGES}
            isDark={isDark}
          />
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={[styles.messagesContainer, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}
        contentContainerStyle={styles.messagesContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.isUser1 ? styles.user1Message : styles.user2Message,
              { backgroundColor: isDark 
                ? (message.isUser1 ? '#0066cc' : '#1a1a1a') 
                : (message.isUser1 ? '#007AFF' : '#f0f0f0') 
              }
            ]}
          >
            <Text style={[styles.messageText, { color: isDark ? '#fff' : '#000' }]} numberOfLines={0}>
              {message.text}
            </Text>
            
            {message.originalText && (
              <>
                {message.expanded && (
                  <>
                    <View 
                      style={[
                        styles.separator, 
                        { 
                          backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                          width: 'auto',         // Allow it to fill the container
                          alignSelf: 'stretch'   // Stretch to fill width
                        }
                      ]} 
                    />
                    <Text style={[styles.originalTextLabel, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
                      Original message:
                    </Text>
                    <Text style={[styles.originalText, { color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]} numberOfLines={0}>
                      {message.originalText}
                    </Text>
                  </>
                )}
                
                <TouchableOpacity 
                  onPress={() => toggleMessageExpansion(index)} 
                  style={[
                    styles.expandButton,
                    { 
                      borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }
                  ]}
                >
                  <Text style={[styles.expandButtonText, { color: isDark ? '#aaa' : '#666' }]}>
                    {message.expanded ? "Hide original" : "Show original"}
                  </Text>
                  <Ionicons 
                    name={message.expanded ? "chevron-up" : "chevron-down"} 
                    size={18} 
                    color={isDark ? '#aaa' : '#666'} 
                  />
                </TouchableOpacity>
              </>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
        <TouchableOpacity
          style={[
            styles.userButton,
            { borderColor: isDark ? '#666' : '#ccc' },
            activeUser === 1 && [
              styles.activeUserButton,
              { backgroundColor: isDark ? '#0066cc' : '#007AFF' }
            ]
          ]}
          onPress={() => setActiveUser(1)}
        >
          <Text style={[
            styles.userButtonText,
            { color: isDark ? '#666' : '#999' },
            activeUser === 1 && styles.activeUserButtonText
          ]}>User 1</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.userButton,
            { borderColor: isDark ? '#666' : '#ccc' },
            activeUser === 2 && [
              styles.activeUserButton,
              { backgroundColor: isDark ? '#0066cc' : '#007AFF' }
            ]
          ]}
          onPress={() => setActiveUser(2)}
        >
          <Text style={[
            styles.userButtonText,
            { color: isDark ? '#666' : '#999' },
            activeUser === 2 && styles.activeUserButtonText
          ]}>User 2</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: isDark ? '#2d2d2d' : '#ffffff',
              color: isDark ? '#fff' : '#000',
              borderWidth: isDark ? 0 : 1,
              borderColor: '#e0e0e0'
            }
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder={getPlaceholder()}
          placeholderTextColor={isDark ? '#666' : '#999'}
          multiline
          onContentSizeChange={(e) => {
            const height = e.nativeEvent.contentSize.height;
          }}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton,
            { 
              backgroundColor: isDark ? '#0066cc' : '#007AFF',
              opacity: isTranslating || !inputText.trim() ? 0.5 : 1,
              alignSelf: 'flex-end'
            }
          ]}
          disabled={isTranslating || !inputText.trim()}
        >
          <Ionicons name="arrow-forward" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
    paddingBottom: 0,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  clearButton: {
    padding: 8,
  },
  languageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    justifyContent: 'space-between',
    gap: 4,
  },
  languageSelector: {
    flex: 1,
    minWidth: 0,
  },
  swapButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 12,
    gap: 8,
  },
  messageContainer: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '75%',
    marginVertical: 4,
    minHeight: 40,
  },
  user1Message: {
    alignSelf: 'flex-start',
  },
  user2Message: {
    alignSelf: 'flex-end',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  expandButton: {
    alignSelf: 'flex-start',
    padding: 4,
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 2,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButtonText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginRight: 6,
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: 10,
  },
  originalTextContainer: {
    marginTop: 6,
  },
  originalTextLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    marginTop: 3,
  },
  originalText: {
    fontSize: 14,
    lineHeight: 18,
    fontStyle: 'italic',
    flexWrap: 'wrap',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
    paddingBottom: 6,
  },
  userButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeUserButton: {
    borderColor: 'transparent',
  },
  userButtonText: {
    fontSize: 16,
  },
  activeUserButtonText: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 8,
    position: 'relative',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    padding: 12,
    paddingTop: 12,
    maxHeight: 200,
    fontSize: 16,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBox: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#ffffff',
  },
});

export default TranslatorApp; 