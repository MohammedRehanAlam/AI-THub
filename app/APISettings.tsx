import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Linking, Switch } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { useProviders, ProviderType } from './context/ProviderContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { testOpenAIKey, testGoogleAIKey, testAnthropicKey, testOpenRouterKey, testGroqKey } from './_utils/apiTests';

// Import SVG logos as React components
import { OpenAILogo, GeminiLogo, AnthropicLogo, OpenRouterLogo, GroqLogo } from './components/LogoIcons';

// Default model names for each provider
const DEFAULT_MODELS = {
  openai: "gpt-3.5-turbo",
  google: "gemini-1.5-flash",
  anthropic: "claude-3-opus-20240229",
  openrouter: "openai/gpt-3.5-turbo",
  groq: "llama3-8b-8192"
};

const APISettings = () => {
    const { currentTheme } = useTheme();
    const { activeProviders, toggleProvider } = useProviders();
    const isDark = currentTheme === 'dark';
    const router = useRouter();
    
    // API key states
    const [openaiKey, setOpenaiKey] = useState('');
    const [googleKey, setGoogleKey] = useState('');
    const [anthropicKey, setAnthropicKey] = useState('');
    const [openrouterKey, setOpenrouterKey] = useState('');
    const [groqKey, setGroqKey] = useState('');
    
    // Model name states
    const [openaiModel, setOpenaiModel] = useState(DEFAULT_MODELS.openai);
    const [googleModel, setGoogleModel] = useState(DEFAULT_MODELS.google);
    const [anthropicModel, setAnthropicModel] = useState(DEFAULT_MODELS.anthropic);
    const [openrouterModel, setOpenrouterModel] = useState(DEFAULT_MODELS.openrouter);
    const [groqModel, setGroqModel] = useState(DEFAULT_MODELS.groq);
    
    // Loading states for verification
    const [openaiLoading, setOpenaiLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [anthropicLoading, setAnthropicLoading] = useState(false);
    const [openrouterLoading, setOpenrouterLoading] = useState(false);
    const [groqLoading, setGroqLoading] = useState(false);
    
    // Status states
    const [openaiStatus, setOpenaiStatus] = useState<null | boolean>(null);
    const [googleStatus, setGoogleStatus] = useState<null | boolean>(null);
    const [anthropicStatus, setAnthropicStatus] = useState<null | boolean>(null);
    const [openrouterStatus, setOpenrouterStatus] = useState<null | boolean>(null);
    const [groqStatus, setGroqStatus] = useState<null | boolean>(null);
    
    // Error message states
    const [openaiError, setOpenaiError] = useState<string | null>(null);
    const [googleError, setGoogleError] = useState<string | null>(null);
    const [anthropicError, setAnthropicError] = useState<string | null>(null);
    const [openrouterError, setOpenrouterError] = useState<string | null>(null);
    const [groqError, setGroqError] = useState<string | null>(null);

    // Load saved API keys and models on component mount
    useEffect(() => {
        const loadApiSettings = async () => {
            try {
                // Load API keys
                const savedOpenaiKey = await AsyncStorage.getItem('openai_api_key');
                const savedGoogleKey = await AsyncStorage.getItem('google_api_key');
                const savedAnthropicKey = await AsyncStorage.getItem('anthropic_api_key');
                const savedOpenrouterKey = await AsyncStorage.getItem('openrouter_api_key');
                const savedGroqKey = await AsyncStorage.getItem('groq_api_key');
                
                // Load model names
                const savedOpenaiModel = await AsyncStorage.getItem('openai_model');
                const savedGoogleModel = await AsyncStorage.getItem('google_model');
                const savedAnthropicModel = await AsyncStorage.getItem('anthropic_model');
                const savedOpenrouterModel = await AsyncStorage.getItem('openrouter_model');
                const savedGroqModel = await AsyncStorage.getItem('groq_model');
                
                // Set API keys if they exist
                if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
                if (savedGoogleKey) setGoogleKey(savedGoogleKey);
                if (savedAnthropicKey) setAnthropicKey(savedAnthropicKey);
                if (savedOpenrouterKey) setOpenrouterKey(savedOpenrouterKey);
                if (savedGroqKey) setGroqKey(savedGroqKey);
                
                // Set model names if they exist
                if (savedOpenaiModel) setOpenaiModel(savedOpenaiModel);
                if (savedGoogleModel) setGoogleModel(savedGoogleModel);
                if (savedAnthropicModel) setAnthropicModel(savedAnthropicModel);
                if (savedOpenrouterModel) setOpenrouterModel(savedOpenrouterModel);
                if (savedGroqModel) setGroqModel(savedGroqModel);

                // Check if API keys are valid and update provider states
                // We don't want to actually test the API keys here to avoid rate limiting
                // Instead, we'll just check if they exist and set the status accordingly
                if (savedOpenaiKey) setOpenaiStatus(true);
                if (savedGoogleKey) setGoogleStatus(true);
                if (savedAnthropicKey) setAnthropicStatus(true);
                if (savedOpenrouterKey) setOpenrouterStatus(true);
                if (savedGroqKey) setGroqStatus(true);
            } catch (error) {
                console.error('Error loading API settings:', error);
            }
        };
        
        loadApiSettings();
    }, []);

    // Save API key and model to AsyncStorage
    const saveApiSettings = async (keyName: string, keyValue: string, modelName: string, modelValue: string) => {
        try {
            await AsyncStorage.setItem(keyName, keyValue);
            await AsyncStorage.setItem(modelName, modelValue);
            return true;
        } catch (error) {
            console.error(`Error saving ${keyName} or ${modelName}:`, error);
            return false;
        }
    };

    // Verify OpenAI API key
    const verifyOpenAI = async () => {
        if (!openaiKey.trim()) {
            setOpenaiError('Please enter an OpenAI API key');
            return;
        }
        
        if (!openaiModel.trim()) {
            setOpenaiError('Please enter a model name');
            return;
        }
        
        setOpenaiLoading(true);
        setOpenaiStatus(null);
        setOpenaiError(null);
        
        try {
            const result = await testOpenAIKey(openaiKey, openaiModel);
            setOpenaiStatus(result.success);
            
            if (result.success) {
                const saved = await saveApiSettings('openai_api_key', openaiKey, 'openai_model', openaiModel);
                if (saved) {
                    // Automatically enable the provider when verified successfully
                    await toggleProvider('openai', true);
                } else {
                    setOpenaiError('Failed to save settings. Please try again.');
                }
            } else {
                setOpenaiError(result.message || 'Failed to verify API key');
                
                // Check if this is a usage limit error rather than an invalid credential error
                const isUsageLimitError = result.message && (
                    result.message.toLowerCase().includes('rate limit') ||
                    result.message.toLowerCase().includes('quota') ||
                    result.message.toLowerCase().includes('usage limit') ||
                    result.message.toLowerCase().includes('credit') ||
                    result.message.toLowerCase().includes('billing') ||
                    result.message.toLowerCase().includes('payment') ||
                    result.message.toLowerCase().includes('exceeded') ||
                    result.message.toLowerCase().includes('capacity')
                );
                
                const isCredentialError = result.message && (
                    result.message.toLowerCase().includes('invalid api key') ||
                    result.message.toLowerCase().includes('authentication') ||
                    result.message.toLowerCase().includes('not found') ||
                    result.message.toLowerCase().includes('insufficient permissions')
                );
                
                // Only disable the provider if it's a credential error, not a usage limit error
                if (isCredentialError && !isUsageLimitError) {
                    await toggleProvider('openai', false);
                } else if (isUsageLimitError) {
                    // Save the API key even if there's a usage limit error
                    const saved = await saveApiSettings('openai_api_key', openaiKey, 'openai_model', openaiModel);
                    if (!saved) {
                        setOpenaiError('Failed to save settings. Please try again.');
                    }
                    // Don't automatically change the toggle state for usage limit errors
                }
            }
        } catch (error: any) {
            console.error('Error verifying OpenAI API key:', error);
            setOpenaiStatus(false);
            setOpenaiError('Network error. Please check your internet connection.');
            // Disable the provider if verification fails due to network error
            await toggleProvider('openai', false);
        } finally {
            setOpenaiLoading(false);
        }
    };

    // Verify Google AI API key
    const verifyGoogle = async () => {
        if (!googleKey.trim()) {
            setGoogleError('Please enter a Google AI API key');
            return;
        }
        
        if (!googleModel.trim()) {
            setGoogleError('Please enter a model name');
            return;
        }
        
        setGoogleLoading(true);
        setGoogleStatus(null);
        setGoogleError(null);
        
        try {
            const result = await testGoogleAIKey(googleKey, googleModel);
            setGoogleStatus(result.success);
            
            if (result.success) {
                const saved = await saveApiSettings('google_api_key', googleKey, 'google_model', googleModel);
                if (saved) {
                    // Automatically enable the provider when verified successfully
                    await toggleProvider('google', true);
                } else {
                    setGoogleError('Failed to save settings. Please try again.');
                }
            } else {
                setGoogleError(result.message || 'Failed to verify API key');
                
                // Check if this is a usage limit error rather than an invalid credential error
                const isUsageLimitError = result.message && (
                    result.message.toLowerCase().includes('rate limit') ||
                    result.message.toLowerCase().includes('quota') ||
                    result.message.toLowerCase().includes('usage limit') ||
                    result.message.toLowerCase().includes('credit') ||
                    result.message.toLowerCase().includes('billing') ||
                    result.message.toLowerCase().includes('payment') ||
                    result.message.toLowerCase().includes('exceeded') ||
                    result.message.toLowerCase().includes('capacity')
                );
                
                const isCredentialError = result.message && (
                    result.message.toLowerCase().includes('invalid api key') ||
                    result.message.toLowerCase().includes('authentication') ||
                    result.message.toLowerCase().includes('not found') ||
                    result.message.toLowerCase().includes('insufficient permissions')
                );
                
                // Only disable the provider if it's a credential error, not a usage limit error
                if (isCredentialError && !isUsageLimitError) {
                    await toggleProvider('google', false);
                } else if (isUsageLimitError) {
                    // Save the API key even if there's a usage limit error
                    const saved = await saveApiSettings('google_api_key', googleKey, 'google_model', googleModel);
                    if (!saved) {
                        setGoogleError('Failed to save settings. Please try again.');
                    }
                    // Don't automatically change the toggle state for usage limit errors
                }
            }
        } catch (error: any) {
            console.error('Error verifying Google AI API key:', error);
            setGoogleStatus(false);
            setGoogleError('Network error. Please check your internet connection.');
            // Disable the provider if verification fails due to network error
            await toggleProvider('google', false);
        } finally {
            setGoogleLoading(false);
        }
    };

    // Verify Anthropic API key
    const verifyAnthropic = async () => {
        if (!anthropicKey.trim()) {
            setAnthropicError('Please enter an Anthropic API key');
            return;
        }
        
        if (!anthropicModel.trim()) {
            setAnthropicError('Please enter a model name');
            return;
        }
        
        setAnthropicLoading(true);
        setAnthropicStatus(null);
        setAnthropicError(null);
        
        try {
            const result = await testAnthropicKey(anthropicKey, anthropicModel);
            setAnthropicStatus(result.success);
            
            if (result.success) {
                const saved = await saveApiSettings('anthropic_api_key', anthropicKey, 'anthropic_model', anthropicModel);
                if (saved) {
                    // Automatically enable the provider when verified successfully
                    await toggleProvider('anthropic', true);
                } else {
                    setAnthropicError('Failed to save settings. Please try again.');
                }
            } else {
                setAnthropicError(result.message || 'Failed to verify API key');
                
                // Check if this is a usage limit error rather than an invalid credential error
                const isUsageLimitError = result.message && (
                    result.message.toLowerCase().includes('rate limit') ||
                    result.message.toLowerCase().includes('quota') ||
                    result.message.toLowerCase().includes('usage limit') ||
                    result.message.toLowerCase().includes('credit') ||
                    result.message.toLowerCase().includes('billing') ||
                    result.message.toLowerCase().includes('payment') ||
                    result.message.toLowerCase().includes('exceeded') ||
                    result.message.toLowerCase().includes('capacity')
                );
                
                const isCredentialError = result.message && (
                    result.message.toLowerCase().includes('invalid api key') ||
                    result.message.toLowerCase().includes('authentication') ||
                    result.message.toLowerCase().includes('not found') ||
                    result.message.toLowerCase().includes('insufficient permissions')
                );
                
                // Only disable the provider if it's a credential error, not a usage limit error
                if (isCredentialError && !isUsageLimitError) {
                    await toggleProvider('anthropic', false);
                } else if (isUsageLimitError) {
                    // Save the API key even if there's a usage limit error
                    const saved = await saveApiSettings('anthropic_api_key', anthropicKey, 'anthropic_model', anthropicModel);
                    if (!saved) {
                        setAnthropicError('Failed to save settings. Please try again.');
                    }
                    // Don't automatically change the toggle state for usage limit errors
                }
            }
        } catch (error: any) {
            console.error('Error verifying Anthropic API key:', error);
            setAnthropicStatus(false);
            setAnthropicError('Network error. Please check your internet connection.');
            // Disable the provider if verification fails due to network error
            await toggleProvider('anthropic', false);
        } finally {
            setAnthropicLoading(false);
        }
    };

    // Verify OpenRouter API key
    const verifyOpenRouter = async () => {
        if (!openrouterKey.trim()) {
            setOpenrouterError('Please enter an OpenRouter API key');
            return;
        }
        
        if (!openrouterModel.trim()) {
            setOpenrouterError('Please enter a model name');
            return;
        }
        
        setOpenrouterLoading(true);
        setOpenrouterStatus(null);
        setOpenrouterError(null);
        
        try {
            const result = await testOpenRouterKey(openrouterKey, openrouterModel);
            setOpenrouterStatus(result.success);
            
            if (result.success) {
                const saved = await saveApiSettings('openrouter_api_key', openrouterKey, 'openrouter_model', openrouterModel);
                if (saved) {
                    // Automatically enable the provider when verified successfully
                    await toggleProvider('openrouter', true);
                } else {
                    setOpenrouterError('Failed to save settings. Please try again.');
                }
            } else {
                setOpenrouterError(result.message || 'Failed to verify API key');
                
                // Check if this is a usage limit error rather than an invalid credential error
                const isUsageLimitError = result.message && (
                    result.message.toLowerCase().includes('rate limit') ||
                    result.message.toLowerCase().includes('quota') ||
                    result.message.toLowerCase().includes('usage limit') ||
                    result.message.toLowerCase().includes('credit') ||
                    result.message.toLowerCase().includes('billing') ||
                    result.message.toLowerCase().includes('payment') ||
                    result.message.toLowerCase().includes('exceeded') ||
                    result.message.toLowerCase().includes('capacity')
                );
                
                const isCredentialError = result.message && (
                    result.message.toLowerCase().includes('invalid api key') ||
                    result.message.toLowerCase().includes('authentication') ||
                    result.message.toLowerCase().includes('not found') ||
                    result.message.toLowerCase().includes('insufficient permissions')
                );
                
                // Only disable the provider if it's a credential error, not a usage limit error
                if (isCredentialError && !isUsageLimitError) {
                    await toggleProvider('openrouter', false);
                } else if (isUsageLimitError) {
                    // Save the API key even if there's a usage limit error
                    const saved = await saveApiSettings('openrouter_api_key', openrouterKey, 'openrouter_model', openrouterModel);
                    if (!saved) {
                        setOpenrouterError('Failed to save settings. Please try again.');
                    }
                    // Don't automatically change the toggle state for usage limit errors
                }
            }
        } catch (error: any) {
            console.error('Error verifying OpenRouter API key:', error);
            setOpenrouterStatus(false);
            setOpenrouterError('Network error. Please check your internet connection.');
            // Disable the provider if verification fails due to network error
            await toggleProvider('openrouter', false);
        } finally {
            setOpenrouterLoading(false);
        }
    };

    // Verify Groq API key
    const verifyGroq = async () => {
        if (!groqKey.trim()) {
            setGroqError('Please enter a Groq API key');
            return;
        }
        
        if (!groqModel.trim()) {
            setGroqError('Please enter a model name');
            return;
        }
        
        setGroqLoading(true);
        setGroqStatus(null);
        setGroqError(null);
        
        try {
            const result = await testGroqKey(groqKey, groqModel);
            setGroqStatus(result.success);
            
            if (result.success) {
                const saved = await saveApiSettings('groq_api_key', groqKey, 'groq_model', groqModel);
                if (saved) {
                    // Automatically enable the provider when verified successfully
                    await toggleProvider('groq', true);
                } else {
                    setGroqError('Failed to save settings. Please try again.');
                }
            } else {
                setGroqError(result.message || 'Failed to verify API key');
                
                // Check if this is a usage limit error rather than an invalid credential error
                const isUsageLimitError = result.message && (
                    result.message.toLowerCase().includes('rate limit') ||
                    result.message.toLowerCase().includes('quota') ||
                    result.message.toLowerCase().includes('usage limit') ||
                    result.message.toLowerCase().includes('credit') ||
                    result.message.toLowerCase().includes('billing') ||
                    result.message.toLowerCase().includes('payment') ||
                    result.message.toLowerCase().includes('exceeded') ||
                    result.message.toLowerCase().includes('capacity')
                );
                
                const isCredentialError = result.message && (
                    result.message.toLowerCase().includes('invalid api key') ||
                    result.message.toLowerCase().includes('authentication') ||
                    result.message.toLowerCase().includes('not found') ||
                    result.message.toLowerCase().includes('insufficient permissions')
                );
                
                // Only disable the provider if it's a credential error, not a usage limit error
                if (isCredentialError && !isUsageLimitError) {
                    await toggleProvider('groq', false);
                } else if (isUsageLimitError) {
                    // Save the API key even if there's a usage limit error
                    const saved = await saveApiSettings('groq_api_key', groqKey, 'groq_model', groqModel);
                    if (!saved) {
                        setGroqError('Failed to save settings. Please try again.');
                    }
                    // Don't automatically change the toggle state for usage limit errors
                }
            }
        } catch (error: any) {
            console.error('Error verifying Groq API key:', error);
            setGroqStatus(false);
            setGroqError('Network error. Please check your internet connection.');
            // Disable the provider if verification fails due to network error
            await toggleProvider('groq', false);
        } finally {
            setGroqLoading(false);
        }
    };

    const themedStyles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#121212' : '#f5f5f5',
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
        toggleButton: {
            padding: 4,
        },
        logo: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#000',
        },
        content: {
            flex: 1,
            padding: 16,
            width: '100%',
        },
        text: {
            fontSize: 16,
            color: isDark ? '#fff' : '#000',
            marginBottom: 12,
        },
        input: {
            borderWidth: 1,
            borderColor: isDark ? '#444' : '#ddd',
            borderRadius: 8,
            padding: 12,
            marginVertical: 8,
            color: isDark ? '#fff' : '#000',
            backgroundColor: isDark ? '#2d2d2d' : '#f5f5f5',
            width: '100%',
            minHeight: 45,
        },
        label: {
            fontSize: 16,
            color: isDark ? '#fff' : '#000',
            fontWeight: '500',
        },
        separator: {
            height: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
            marginVertical: 16,
        },
        section: {
            marginBottom: 24,
            backgroundColor: isDark ? '#252525' : '#f9f9f9',
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#eee',
            width: '100%',
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        sectionIcon: {
            width: 24,
            height: 24,
            marginRight: 10,
            justifyContent: 'center',
            alignItems: 'center',
        },
        verifyButton: {
            backgroundColor: isDark ? '#4a90e2' : '#2196F3',
            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 12,
        },
        buttonText: {
            color: '#fff',
            fontWeight: '500',
            fontSize: 16,
        },
        statusContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 8,
        },
        statusText: {
            fontSize: 14,
            marginLeft: 8,
        },
        successText: {
            color: '#4CAF50',
        },
        errorText: {
            color: '#F44336',
        },
        warningText: {
            color: '#FFA500',
        },
        infoText: {
            fontSize: 14,
            color: isDark ? '#aaa' : '#666',
            marginTop: 4,
            marginBottom: 8,
        },
        inputGroup: {
            marginBottom: 12,
            width: '100%',
        },
        inputLabel: {
            fontSize: 14,
            color: isDark ? '#bbb' : '#555',
            marginBottom: 4,
        },
        errorContainer: {
            backgroundColor: isDark ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)',
            padding: 10,
            borderRadius: 8,
            marginTop: 8,
            borderLeftWidth: 3,
            borderLeftColor: '#F44336',
        },
        errorMessage: {
            color: isDark ? '#ff8a80' : '#d32f2f',
            fontSize: 14,
        },
        modelInfoText: {
            fontSize: 13,
            color: isDark ? '#888' : '#777',
            fontStyle: 'italic',
            marginTop: 2,
        },
        inputLabelContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        linkText: {
            color: isDark ? '#4a90e2' : '#2196F3',
            fontSize: 12,
            fontWeight: '500',
        },
        toggleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 'auto',
        },
        toggleLabel: {
            fontSize: 14,
            marginRight: 8,
            color: isDark ? '#bbb' : '#555',
        },
        disabledText: {
            color: isDark ? '#666' : '#aaa',
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginRight: 8,
            gap: 4,
        },
        verifiedBadge: {
            backgroundColor: '#4CAF50',
        },
        limitBadge: {
            backgroundColor: '#FFA500',
        },
        errorBadge: {
            backgroundColor: '#F44336',
        },
        statusBadgeText: {
            fontSize: 12,
            fontWeight: '500',
            color: '#fff',
        },
        summaryContainer: {
            marginBottom: 24,
            padding: 16,
            backgroundColor: isDark ? '#252525' : '#f9f9f9',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#eee',
        },
        summaryTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#000',
            marginBottom: 8,
        },
        summarySubtitle: {
            fontSize: 14,
            color: isDark ? '#aaa' : '#666',
        },
        activeProvidersList: {
            marginTop: 12,
            gap: 8,
        },
        activeProviderItem: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            borderRadius: 8,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
        },
        providerIconContainer: {
            width: 24,
            height: 24,
            marginRight: 8,
        },
        activeProviderName: {
            flex: 1,
            fontSize: 16,
            color: isDark ? '#fff' : '#000',
        },
        noActiveProvidersText: {
            fontSize: 14,
            color: isDark ? '#aaa' : '#666',
            textAlign: 'center',
        },
    }), [isDark, activeProviders]);

    // Helper function to render API key input section with model name input
    const renderApiSection = (
        title: string,
        logoComponent: React.ReactNode,
        keyValue: string,
        onChangeKey: (text: string) => void,
        modelValue: string,
        onChangeModel: (text: string) => void,
        onVerify: () => void,
        loading: boolean,
        status: boolean | null,
        error: string | null,
        info: string,
        modelInfo: string,
        defaultModel: string,
        apiKeyLink: string,
        modelLink: string,
        providerType: ProviderType
    ) => {
        // Determine if the toggle should be enabled
        // Allow toggling if:
        // 1. API verification was successful (status === true)
        // 2. OR if there's an error related to usage limits or credits, but the credentials are valid
        const isCredentialError = error && (
            error.toLowerCase().includes('invalid api key') || 
            error.toLowerCase().includes('authentication') ||
            error.toLowerCase().includes('not found') ||
            error.toLowerCase().includes('insufficient permissions')
        );
        
        const isUsageLimitError = error && (
            error.toLowerCase().includes('rate limit') ||
            error.toLowerCase().includes('quota') ||
            error.toLowerCase().includes('usage limit') ||
            error.toLowerCase().includes('credit') ||
            error.toLowerCase().includes('billing') ||
            error.toLowerCase().includes('payment') ||
            error.toLowerCase().includes('exceeded') ||
            error.toLowerCase().includes('capacity')
        );
        
        // Enable toggle if API key is valid and either verification succeeded or it's just a usage limit error
        const isToggleEnabled = keyValue.trim() !== '' && (status === true || (status === false && isUsageLimitError && !isCredentialError));
        
        const handleToggleChange = async (value: boolean) => {
            if (isToggleEnabled) {
                await toggleProvider(providerType, value);
            }
        };
        
        // Determine the status badge to display
        const getStatusBadge = () => {
            if (status === true) {
                return (
                    <View style={[themedStyles.statusBadge, themedStyles.verifiedBadge]}>
                        <Ionicons name="checkmark-circle" size={14} color="#fff" />
                        <Text style={themedStyles.statusBadgeText}>Verified</Text>
                    </View>
                );
            } else if (status === false && isUsageLimitError && !isCredentialError) {
                return (
                    <View style={[themedStyles.statusBadge, themedStyles.limitBadge]}>
                        <Ionicons name="alert-circle" size={14} color="#fff" />
                        <Text style={themedStyles.statusBadgeText}>Usage Limit</Text>
                    </View>
                );
            } else if (status === false) {
                return (
                    <View style={[themedStyles.statusBadge, themedStyles.errorBadge]}>
                        <Ionicons name="close-circle" size={14} color="#fff" />
                        <Text style={themedStyles.statusBadgeText}>Error</Text>
                    </View>
                );
            }
            return null;
        };
        
        return (
        <View style={themedStyles.section}>
            <View style={themedStyles.sectionHeader}>
                <View style={themedStyles.sectionIcon}>
                    {logoComponent}
                </View>
                <Text style={themedStyles.label}>{title}</Text>
                <View style={{ flex: 1 }} />
                {getStatusBadge()}
                <View style={themedStyles.toggleContainer}>
                    <Text style={[themedStyles.toggleLabel, !isToggleEnabled && themedStyles.disabledText]}>
                        {activeProviders[providerType] ? 'Active' : 'Inactive'}
                    </Text>
                    <Switch
                        trackColor={{ false: isDark ? '#444' : '#ccc', true: isDark ? '#4a90e2' : '#2196F3' }}
                        thumbColor={activeProviders[providerType] ? (isDark ? '#fff' : '#fff') : (isDark ? '#888' : '#f4f3f4')}
                        ios_backgroundColor={isDark ? '#444' : '#ccc'}
                        onValueChange={handleToggleChange}
                        value={activeProviders[providerType]}
                        disabled={!isToggleEnabled}
                    />
                </View>
            </View>
            
            <Text style={themedStyles.infoText}>{info}</Text>
            
            <View style={themedStyles.inputGroup}>
                <View style={themedStyles.inputLabelContainer}>
                    <Text style={themedStyles.inputLabel}>API Key</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(apiKeyLink)}>
                        <Text style={themedStyles.linkText}>Get API Key</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={themedStyles.input}
                    placeholder="Enter your API key"
                    placeholderTextColor={isDark ? '#888' : '#aaa'}
                    value={keyValue}
                    onChangeText={(text) => {
                        onChangeKey(text);
                        // If API key is cleared, disable the provider
                        if (text.trim() === '') {
                            toggleProvider(providerType, false);
                        }
                    }}
                    secureTextEntry
                    multiline={false}
                    numberOfLines={1}
                />
            </View>
            
            <View style={themedStyles.inputGroup}>
                <View style={themedStyles.inputLabelContainer}>
                    <Text style={themedStyles.inputLabel}>Model Name</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(modelLink)}>
                        <Text style={themedStyles.linkText}>View Models</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    style={themedStyles.input}
                    placeholder={`Default: ${defaultModel}`}
                    placeholderTextColor={isDark ? '#888' : '#aaa'}
                    value={modelValue}
                    onChangeText={onChangeModel}
                    multiline={false}
                    numberOfLines={1}
                />
                <Text style={themedStyles.modelInfoText}>{modelInfo}</Text>
            </View>
            
            {error && (
                <View style={themedStyles.errorContainer}>
                    <Text style={themedStyles.errorMessage}>{error}</Text>
                </View>
            )}
            
            {status !== null && (
                <View style={[
                    themedStyles.statusContainer,
                    status ? 
                        { backgroundColor: isDark ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.05)' } : 
                        (isUsageLimitError ? 
                            { backgroundColor: isDark ? 'rgba(255,165,0,0.1)' : 'rgba(255,165,0,0.05)' } : 
                            { backgroundColor: isDark ? 'rgba(244,67,54,0.1)' : 'rgba(244,67,54,0.05)' })
                ]}>
                    <Ionicons 
                        name={status ? "checkmark-circle" : (isUsageLimitError ? "alert-circle" : "close-circle")} 
                        size={20} 
                        color={status ? "#4CAF50" : (isUsageLimitError ? "#FFA500" : "#F44336")} 
                    />
                    <Text style={[
                        themedStyles.statusText, 
                        status ? 
                            themedStyles.successText : 
                            (isUsageLimitError ? themedStyles.warningText : themedStyles.errorText)
                    ]}>
                        {status ? 
                            `${title} verified successfully` : 
                            (isUsageLimitError ? 
                                `API key is valid but has usage limits or credit issues. You can still toggle it on.` : 
                                `Verification failed. Please check your credentials.`)}
                    </Text>
                </View>
            )}
            
            <TouchableOpacity 
                style={themedStyles.verifyButton} 
                onPress={onVerify}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text style={themedStyles.buttonText}>Verify & Save</Text>
                )}
            </TouchableOpacity>
        </View>
    )};

    return (
        <SafeAreaView style={themedStyles.container}>   
            <View style={themedStyles.header}>
                <View style={themedStyles.headerLeft}>
                    <TouchableOpacity style={themedStyles.toggleButton} onPress={() => router.push('/Settings')}>
                        <Ionicons name="chevron-back-outline" size={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text style={themedStyles.logo}>API Settings</Text>
                </View>
            </View>
            <View style={themedStyles.separator} />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView 
                    style={themedStyles.content}
                    showsVerticalScrollIndicator={true}
                    indicatorStyle={isDark ? "white" : "black"}
                > 
                    {/* Active Providers Summary */}
                    <View style={themedStyles.summaryContainer}>
                        <Text style={themedStyles.summaryTitle}>Active Providers</Text>
                        <Text style={themedStyles.summarySubtitle}>
                            These providers will be available for selection in the app
                        </Text>
                        
                        <View style={themedStyles.activeProvidersList}>
                            {Object.entries(activeProviders).some(([_, isActive]) => isActive) ? (
                                Object.entries(activeProviders).map(([provider, isActive]) => {
                                    if (!isActive) return null;
                                    const providerType = provider as ProviderType;
                                    return (
                                        <View key={provider} style={themedStyles.activeProviderItem}>
                                            <View style={themedStyles.providerIconContainer}>
                                                {providerType === 'openai' && <OpenAILogo width={20} height={20} useThemeColor={true} />}
                                                {providerType === 'google' && <GeminiLogo width={20} height={20} />}
                                                {providerType === 'anthropic' && <AnthropicLogo width={20} height={20} fill="#d97757" />}
                                                {providerType === 'openrouter' && <OpenRouterLogo width={20} height={20} useThemeColor={true} />}
                                                {providerType === 'groq' && <GroqLogo width={20} height={20} fill="#ffffff" />}
                                            </View>
                                            <Text style={themedStyles.activeProviderName}>
                                                {providerType === 'openai' && 'OpenAI'}
                                                {providerType === 'google' && 'Google AI'}
                                                {providerType === 'anthropic' && 'Anthropic'}
                                                {providerType === 'openrouter' && 'OpenRouter'}
                                                {providerType === 'groq' && 'Groq'}
                                            </Text>
                                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                        </View>
                                    );
                                })
                            ) : (
                                <Text style={themedStyles.noActiveProvidersText}>
                                    No active providers. Verify and enable providers below.
                                </Text>
                            )}
                        </View>
                    </View>
                    
                    <View style={themedStyles.separator} />
                    
                    {renderApiSection(
                        "OpenAI",
                        <OpenAILogo width={24} height={24} useThemeColor={true} />,
                        openaiKey, 
                        setOpenaiKey,
                        openaiModel,
                        setOpenaiModel,
                        verifyOpenAI, 
                        openaiLoading, 
                        openaiStatus,
                        openaiError,
                        "Your API key is stored securely and used only for making requests to OpenAI's services.",
                        "Examples: gpt-3.5-turbo, gpt-4-turbo, gpt-4o",
                        DEFAULT_MODELS.openai,
                        "https://platform.openai.com/api-keys",
                        "https://platform.openai.com/settings/organization/limits",
                        "openai"
                    )}
                    
                    {renderApiSection(
                        "Google AI",
                        <GeminiLogo width={24} height={24} />,
                        googleKey, 
                        setGoogleKey,
                        googleModel,
                        setGoogleModel,
                        verifyGoogle, 
                        googleLoading, 
                        googleStatus,
                        googleError,
                        "Required for accessing Google's Gemini models.",
                        "Examples: gemini-1.5-flash, gemini-1.5-pro",
                        DEFAULT_MODELS.google,
                        "https://aistudio.google.com/app/apikey",
                        "https://aistudio.google.com/app/prompts/new_chat",
                        "google"
                    )}
                    
                    {renderApiSection(
                        "Anthropic",
                        <AnthropicLogo width={24} height={24} fill="#d97757" />,
                        anthropicKey, 
                        setAnthropicKey,
                        anthropicModel,
                        setAnthropicModel,
                        verifyAnthropic, 
                        anthropicLoading, 
                        anthropicStatus,
                        anthropicError,
                        "Required for accessing Anthropic's Claude models.",
                        "Examples: claude-3-opus-20240229, claude-3-sonnet-20240229",
                        DEFAULT_MODELS.anthropic,
                        "https://console.anthropic.com/settings/keys",
                        "https://console.anthropic.com/settings/keys",
                        "anthropic"
                    )}
                    
                    {renderApiSection(
                        "OpenRouter",
                        <OpenRouterLogo width={24} height={24} useThemeColor={true} />,
                        openrouterKey, 
                        setOpenrouterKey,
                        openrouterModel,
                        setOpenrouterModel,
                        verifyOpenRouter, 
                        openrouterLoading, 
                        openrouterStatus,
                        openrouterError,
                        "OpenRouter provides access to multiple AI models through a single API.",
                        "Examples: openai/gpt-3.5-turbo, anthropic/claude-3-opus",
                        DEFAULT_MODELS.openrouter,
                        "https://openrouter.ai/keys",
                        "https://openrouter.ai/docs",
                        "openrouter"
                    )}
                    
                    {renderApiSection(
                        "Groq",
                        <GroqLogo width={24} height={24} fill="#ffffff" />,
                        groqKey, 
                        setGroqKey,
                        groqModel,
                        setGroqModel,
                        verifyGroq, 
                        groqLoading, 
                        groqStatus,
                        groqError,
                        "Groq provides fast inference for various open-source models.",
                        "Examples: llama3-8b-8192, llama3-70b-8192, mixtral-8x7b-32768",
                        DEFAULT_MODELS.groq,
                        "https://console.groq.com/keys",
                        "https://console.groq.com/docs/models",
                        "groq"
                    )}
                    
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default APISettings;