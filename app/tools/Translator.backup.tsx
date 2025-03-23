import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Platform, Keyboard, Modal, AppState, KeyboardAvoidingView, Image, ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { Collapsible } from '../components/Collapsible';
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
import Markdown from '@ronradtke/react-native-markdown-display';
import { DEFAULT_MODELS } from '../APISettings';

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
  KEYBOARD_OFFSET: 5,   // Distance in pixels between keyboard and input field when keyboard is open
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

type MarkdownStylesType = {
  body: TextStyle;
  heading1: TextStyle;
  heading2: TextStyle;
  heading3: TextStyle;
  paragraph: TextStyle;
  link: TextStyle;
  list_item: TextStyle;
  bullet_list: ViewStyle;
  ordered_list: ViewStyle;
  bullet_list_icon: TextStyle;
  bullet_list_content: ViewStyle;
  ordered_list_icon: TextStyle;
  ordered_list_content: ViewStyle;
  code_inline: TextStyle;
  code_block: TextStyle;
  blockquote: ViewStyle;
  image: ImageStyle;
  hr: ViewStyle;
  table: ViewStyle;
  thead: ViewStyle;
  th: TextStyle;
  td: TextStyle;
}

type StylesType = {
  container: ViewStyle;
  header: ViewStyle;
  headerLeft: ViewStyle;
  headerRight: ViewStyle;
  toggleButton: ViewStyle;
  clearButton: ViewStyle;
  clearButtonDisabled: ViewStyle;
  logo: TextStyle;
  languageSelector: ViewStyle;
  languageSelectorContainer: ViewStyle;
  languageBox: ViewStyle;
  swapButton: ViewStyle;
  overlay: ViewStyle;
  alertBox: ViewStyle;
  alertTitle: TextStyle;
  alertMessage: TextStyle;
  buttonContainer: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
  messagesContainer: ViewStyle;
  messagesContent: ViewStyle;
  messageContainer: ViewStyle;
  user1Container: ViewStyle;
  user2Container: ViewStyle;
  messageBubble: ViewStyle;
  user1Bubble: ViewStyle;
  user2Bubble: ViewStyle;
  messageContent: ViewStyle;
  messageText: TextStyle;
  messageTextWithImage: TextStyle;
  messageTextOnly: TextStyle;
  originalTextButton: ViewStyle;
  originalTextButtonText: TextStyle;
  originalText: TextStyle;
  bottomContainer: ViewStyle;
  userToggle: ViewStyle;
  userButton: ViewStyle;
  activeUserButton: ViewStyle;
  userButtonText: TextStyle;
  userLanguageText: TextStyle;
  userLanguageLegend: ViewStyle;
  userLanguageLegendText: TextStyle;
  activeUserButtonText: TextStyle;
  inputContainer: ViewStyle;
  inputRow: ViewStyle;
  input: TextStyle;
  previewImageContainer: ViewStyle;
  previewImage: ImageStyle;
  clearImageButton: ViewStyle;
  messageImage: ImageStyle;
  originalMessageImage: ImageStyle;
  sendButton: ViewStyle;
  providerSelector: ViewStyle;
  providerButton: ViewStyle;
  providerButtonContent: ViewStyle;
  providerText: TextStyle;
  dropdownContent: ViewStyle;
  dropdownModal: ViewStyle;
  dropdownItem: ViewStyle;
  selectedItem: ViewStyle;
  dropdownItemText: TextStyle;
  dropdownItemContent: ViewStyle;
  dropdownItemModel: TextStyle;
  modelsList: ViewStyle;
  modelOption: ViewStyle;
  modelOptionText: TextStyle;
  selectedModel: ViewStyle;
  selectedModelText: TextStyle;
  expandButton: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  noProvidersText: TextStyle;
  modalOverlay: ViewStyle;
  mediaOptionsContainer: ViewStyle;
  mediaOption: ViewStyle;
  mediaOptionActive: ViewStyle;
  mediaOptionText: TextStyle;
  mediaOptionDivider: ViewStyle;
  mediaButton: ViewStyle;
  markdownContainer: ViewStyle;
  dropdownDivider: ViewStyle;
};

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

const createMarkdownStyles = (isDark: boolean): MarkdownStylesType => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  return {
    body: {
      color: 'inherit',
      fontSize: 16,
      lineHeight: 22,
    },
    heading1: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: 'bold',
      color: colors.text,
      marginVertical: 6,
    },
    heading2: {
      fontSize: 17,
      lineHeight: 21,
      fontWeight: 'bold',
      color: colors.text,
      marginVertical: 5,
    },
    heading3: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginVertical: 4,
    },
    paragraph: {
      marginVertical: 4,
      color: colors.text,
    },
    link: {
      color: colors.primary,
    },
    list_item: {
      marginVertical: 2,
      color: colors.text,
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    bullet_list_icon: {
      marginLeft: 10,
      marginRight: 10,
      color: colors.text,
    },
    bullet_list_content: {
      flex: 1,
    },
    ordered_list_icon: {
      marginLeft: 10,
      marginRight: 10,
      color: colors.text,
    },
    ordered_list_content: {
      flex: 1,
    },
    code_inline: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      paddingHorizontal: 4,
      borderRadius: 4,
      color: colors.text,
    },
    code_block: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      padding: 8,
      borderRadius: 6,
      marginVertical: 4,
      color: colors.text,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      paddingLeft: 8,
      opacity: 0.8,
      marginVertical: 4,
    },
    image: {
      maxWidth: '100%',
      borderRadius: 8,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: 8,
    },
    table: {
      borderColor: colors.border,
    },
    thead: {
      backgroundColor: isDark ? '#333' : '#f0f0f0',
    },
    th: {
      padding: 6,
      color: colors.text,
    },
    td: {
      padding: 6,
      color: colors.text,
    },
  };
};

const createOriginalMarkdownStyles = (isDark: boolean): MarkdownStylesType => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  return {
    body: {
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      fontSize: 16,
      lineHeight: 22,
    },
    heading1: {
      fontSize: 18,
      lineHeight: 22,
      fontWeight: 'bold',
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      marginVertical: 6,
    },
    heading2: {
      fontSize: 17,
      lineHeight: 21,
      fontWeight: 'bold',
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      marginVertical: 5,
    },
    heading3: {
      fontSize: 16,
      lineHeight: 20,
      fontWeight: 'bold',
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      marginVertical: 4,
    },
    paragraph: {
      marginVertical: 4,
      fontSize: 16,
      lineHeight: 22,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
    link: {
      color: isDark ? 'rgba(0, 122, 255, 0.8)' : 'rgba(0, 122, 255, 0.7)',
      fontSize: 16,
    },
    list_item: {
      marginVertical: 2,
      fontSize: 16,
      lineHeight: 22,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
    bullet_list: {
      marginVertical: 4,
    },
    ordered_list: {
      marginVertical: 4,
    },
    bullet_list_icon: {
      marginLeft: 10,
      marginRight: 10,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
    bullet_list_content: {
      flex: 1,
    },
    ordered_list_icon: {
      marginLeft: 10,
      marginRight: 10,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
    ordered_list_content: {
      flex: 1,
    },
    code_inline: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      backgroundColor: isDark ? 'rgba(51, 51, 51, 0.7)' : 'rgba(240, 240, 240, 0.7)',
      paddingHorizontal: 4,
      borderRadius: 4,
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
    code_block: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      backgroundColor: isDark ? 'rgba(51, 51, 51, 0.7)' : 'rgba(240, 240, 240, 0.7)',
      padding: 8,
      borderRadius: 6,
      marginVertical: 4,
      fontSize: 16,
      lineHeight: 22,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: isDark ? 'rgba(0, 122, 255, 0.6)' : 'rgba(0, 122, 255, 0.5)',
      paddingLeft: 8,
      opacity: 0.7,
      marginVertical: 4,
    },
    image: {
      maxWidth: '100%',
      borderRadius: 8,
      opacity: 0.9,
    },
    hr: {
      backgroundColor: isDark ? 'rgba(150, 150, 150, 0.2)' : 'rgba(150, 150, 150, 0.15)',
      height: 1,
      marginVertical: 8,
    },
    table: {
      borderColor: isDark ? 'rgba(150, 150, 150, 0.2)' : 'rgba(150, 150, 150, 0.15)',
    },
    thead: {
      backgroundColor: isDark ? 'rgba(51, 51, 51, 0.7)' : 'rgba(240, 240, 240, 0.7)',
    },
    th: {
      padding: 6,
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
    td: {
      padding: 6,
      fontSize: 16,
      color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    },
  };
};

const createStyles = (isDark: boolean): StylesType => {
  const colors = isDark ? COLORS.dark : COLORS.light;
  
  return StyleSheet.create<StylesType>({
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
      gap: 12,
      flex: 0.3,
      minWidth: 100,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
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
      // width: '100%',   // this is to make the bubble full width
    },
    user1Bubble: {
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 0,
    },
    user2Bubble: {
      borderTopRightRadius: 16,
      borderBottomRightRadius: 0,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
      marginTop: 8,
    },
    user1MessageText: {
      color: colors.text,
    },
    user2MessageText: {
      // color: isDark ? '#4CAF50' : '#2E7D32',
      color: colors.text,
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
      alignSelf: 'flex-start',
      width: '100%',
    },
    originalTextButtonText: {
      color: colors.primary,
      fontSize: 14,
      marginBottom: 4,
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
      paddingBottom: 5,
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
      alignItems: 'flex-start',
      width: '100%',
    },
    messageImage: {
      width: 230,
      height: 230,
      borderRadius: 8,
      marginVertical: 4,
    },
    originalMessageImage: {
      width: 150,
      height: 150,
      borderRadius: 8,
      marginTop: 8,
      alignSelf: 'center',
    },
    sendButton: {
      alignSelf: 'flex-end',
      padding: 8,
      paddingBottom: 14,
    },
    providerSelector: {
      flex: 1,
      alignItems: 'flex-end',
      maxWidth: 150,
      // paddingVertical: 0,
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
      padding: 2,
      paddingVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
      // backgroundColor: colors.surface,
    },
    markdownContainer: {
      flex: 1,
      width: '100%',
      alignSelf: 'flex-start',
    },
    dropdownDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 8,
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

  // Constants for storage keys
  const TOOL_PROVIDER_KEY = 'box1_selected_provider';
  const TOOL_MODEL_KEY = 'box1_selected_model';
  const GLOBAL_PROVIDER_KEY = 'selected_provider';
  const GLOBAL_MODEL_KEY = 'current_models';

  const markdownStyles = createMarkdownStyles(isDark);
  const originalMarkdownStyles = createOriginalMarkdownStyles(isDark);

  // Add state to track if we're using global models
  const [isUsingGlobalModels, setIsUsingGlobalModels] = useState(true);

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
          
          // Also check for tool-specific models
          await loadToolSpecificModels(toolProvider as ProviderType);
        } else {
          // If no tool-specific provider, try to load the global provider
          const globalProvider = await AsyncStorage.getItem(GLOBAL_PROVIDER_KEY);
          
          if (globalProvider && isProviderActive(globalProvider as ProviderType)) {
            // If there's a saved global provider and it's active, use it
            setSelectedProvider(globalProvider as ProviderType);
            setIsUsingGlobalProvider(true);
            setIsUsingGlobalModels(true);
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
              setIsUsingGlobalModels(true);
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

  // Function to load tool-specific models
  const loadToolSpecificModels = async (providerType: ProviderType) => {
    try {
      const savedToolModels = await AsyncStorage.getItem(TOOL_MODEL_KEY);
      if (savedToolModels) {
        const toolModels = JSON.parse(savedToolModels);
        
        // If the saved model exists for the provider, use it
        if (toolModels && toolModels[providerType]) {
          // Update only this provider's model in our state
          setCurrentModels(prev => ({
            ...prev,
            [providerType]: toolModels[providerType]
          }));
          setIsUsingGlobalModels(false);
        } else {
          setIsUsingGlobalModels(true);
        }
      } else {
        setIsUsingGlobalModels(true);
      }
    } catch (error) {
      console.error('Error loading tool-specific models:', error);
      setIsUsingGlobalModels(true);
    }
  };

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

      // Create translation request with the selected model
      const request: TranslationRequest = {
        text,
        fromLanguage,
        toLanguage,
        model: currentModels[selectedProvider] // Include the selected model
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
          
          // Handle both image and text if present
          if (textToTranslate) {
            // First, translate the text
            const translatedText = await translateText(textToTranslate);
            
            // Then, translate the image
            const request: TranslationRequest = {
              text: base64,
              fromLanguage: activeUser === 1 ? sourceLanguage : targetLanguage,
              toLanguage: activeUser === 1 ? targetLanguage : sourceLanguage
            };

            const imageTranslationResult = await apiTranslateText(request, selectedProvider as ProviderType);
            
            if (!imageTranslationResult.success) {
              throw new Error(imageTranslationResult.error || 'Image translation failed');
            }

            // Create a combined message with both translations
            const translatedMessage: Message = {
              text: `${translatedText}\n\n${imageTranslationResult.translatedText}`,
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
            const request: TranslationRequest = {
              text: base64,
              fromLanguage: activeUser === 1 ? sourceLanguage : targetLanguage,
              toLanguage: activeUser === 1 ? targetLanguage : sourceLanguage
            };

            const imageTranslationResult = await apiTranslateText(request, selectedProvider as ProviderType);
            
            if (!imageTranslationResult.success) {
              throw new Error(imageTranslationResult.error || 'Translation failed');
            }

            const translatedMessage: Message = {
              text: imageTranslationResult.translatedText,
              isUser1: activeUser !== 1,
              originalText: "Image only",
              timestamp: Date.now(),
              expanded: false,
              originalImageUri: newMessage.imageUri,
              imageUri: undefined
            };

            setMessages(prev => [...prev, translatedMessage]);
          }
        } catch (error) {
          console.error('Error processing image and text:', error);
          throw new Error('Failed to process image and text for translation. Please try again.');
        }
      } else if (textToTranslate) {
        // Text only translation
        const translatedText = await translateText(textToTranslate);
        const translatedMessage: Message = {
          text: translatedText,
          isUser1: activeUser !== 1,
          originalText: textToTranslate,
          timestamp: Date.now(),
          expanded: false
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
        
        // Check global models if we're using them
        if (isUsingGlobalModels) {
          const savedGlobalModels = await AsyncStorage.getItem(GLOBAL_MODEL_KEY);
          if (savedGlobalModels) {
            const parsedGlobalModels = JSON.parse(savedGlobalModels);
            // Only update if we have a selected provider and there's a difference in the model
            if (selectedProvider && parsedGlobalModels[selectedProvider] !== currentModels[selectedProvider]) {
              setCurrentModels(prev => ({
                ...prev,
                [selectedProvider]: parsedGlobalModels[selectedProvider]
              }));
            }
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
  }, [isUsingGlobalProvider, isUsingGlobalModels, selectedProvider, isProviderActive, currentModels]);

  // Function to reset UI positioning
  const resetUIPositioning = () => {
    if (needsReset) {
      // Force a re-render to reset positioning
      setNeedsReset(false);
      // Small delay to ensure the reset happens after keyboard is fully dismissed
      setTimeout(() => {
        // This will trigger a re-render and reset the position
        setInputText(inputText => inputText);
      }, 10);
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
      }, 10);
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
        // Only load global models if we're using them
        if (isUsingGlobalModels) {
          const savedModels = await AsyncStorage.getItem(GLOBAL_MODEL_KEY);
          if (savedModels) {
            setCurrentModels(JSON.parse(savedModels));
          }
        }
      } catch (error) {
        console.error('Error loading current models:', error);
      }
    };
    
    loadCurrentModels();
  }, [isUsingGlobalModels]);

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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Fixed Header
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.toggleButton} onPress={() => router.push('/')}>
            <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
          </TouchableOpacity>
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
      </View> */}

      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.toggleButton} onPress={() => router.push('/')}>
            <Ionicons name="chevron-back-outline" size={24} color={colors.text} />
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
                  <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
                </>
              ) : (
                <>
                  <Ionicons name="cloud-outline" size={24} color={colors.text} />
                  <View style={styles.dropdownItemContent}>
                    <Text style={styles.providerText} numberOfLines={1} ellipsizeMode="tail">
                      {activeProvidersList.length > 0 ? 'Select Provider' : 'No Providers'}
                    </Text>
                  </View>
                  <Ionicons name={dropdownVisible ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
                </>
              )}
            </TouchableOpacity>
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

      {/* Main content area with messages */}
      <View style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={[
            styles.messagesContent,
            { paddingBottom: keyboardVisible ? 10 : 120 }
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
                    <View style={styles.markdownContainer}>
                      {/* Comment this section if you want to completely hide thinking/reasoning sections */}
                      {message.text.match(/<(reasoning|thinking|think)[^>]*>([\s\S]*?)<\/\1>/g) ? (
                        message.text.split(/(<(?:reasoning|thinking|think)[^>]*>[\s\S]*?<\/(?:reasoning|thinking|think)>)/).map((segment, index) => {
                          const tagMatch = segment.match(/<(reasoning|thinking|think)[^>]*>([\s\S]*?)<\/\1>/);
                          if (tagMatch) {
                            const [_, tagName, content] = tagMatch;
                            return (
                              <Collapsible key={index} title={tagName.charAt(0).toUpperCase() + tagName.slice(1)}>
                                <Markdown style={markdownStyles} mergeStyle={false}>{content}</Markdown>
                              </Collapsible>
                            );
                          } else {
                            return segment ? (
                              <Markdown key={index} style={markdownStyles} mergeStyle={true}>{segment}</Markdown>
                            ) : null;
                          }
                        })
                      ) : (
                        <Markdown style={markdownStyles} mergeStyle={false}>{message.text}</Markdown>
                      )}
                      
                      {/* To completely hide thinking/reasoning sections, uncomment the following code and comment out the above section
                      <Markdown 
                        style={markdownStyles} 
                        mergeStyle={false}
                      >
                        {message.text.replace(/<(reasoning|thinking|think)[^>]*>[\s\S]*?<\/\1>/g, '')}
                      </Markdown>
                      */}
                    </View>
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
                            <View style={styles.markdownContainer}>
                              <Markdown 
                                style={originalMarkdownStyles}
                                mergeStyle={false}
                              >
                                {message.originalText}
                              </Markdown>
                            </View>
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

      {/* Bottom input area */}
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
              <ScrollView style={{ maxHeight: 420 }}> 
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
                          color={colors.text}
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
                                style={{ marginLeft: 8 }}
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
                <View style={styles.dropdownDivider} />
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={resetToGlobalProvider}
                >
                  <Ionicons name="globe-outline" size={24} color={colors.text} />
                  <Text style={styles.dropdownItemText} numberOfLines={1} ellipsizeMode="tail">
                    Use Global Provider
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <Text style={styles.noProvidersText}>
                No active providers
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      <CustomAlert 
        visible={isAlertVisible}
        title="Clear Chat"
        message="Are you sure you want to clear all messages?"
        onCancel={() => setAlertVisible(false)}
        onConfirm={clearChat}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}