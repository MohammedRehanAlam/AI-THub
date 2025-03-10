import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { testOpenAIKey, testGoogleAIKey, testAnthropicKey, testOpenRouterKey, testGroqKey } from './utils/apiTests';

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
                    // Success, no need for an alert as we show the status visually
                } else {
                    setOpenaiError('Failed to save settings. Please try again.');
                }
            } else {
                setOpenaiError(result.message || 'Failed to verify API key');
            }
        } catch (error: any) {
            console.error('Error verifying OpenAI API key:', error);
            setOpenaiStatus(false);
            setOpenaiError('Network error. Please check your internet connection.');
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
                if (!saved) {
                    setGoogleError('Failed to save settings. Please try again.');
                }
            } else {
                setGoogleError(result.message || 'Failed to verify API key');
            }
        } catch (error: any) {
            console.error('Error verifying Google AI API key:', error);
            setGoogleStatus(false);
            setGoogleError('Network error. Please check your internet connection.');
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
                if (!saved) {
                    setAnthropicError('Failed to save settings. Please try again.');
                }
            } else {
                setAnthropicError(result.message || 'Failed to verify API key');
            }
        } catch (error: any) {
            console.error('Error verifying Anthropic API key:', error);
            setAnthropicStatus(false);
            setAnthropicError('Network error. Please check your internet connection.');
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
                if (!saved) {
                    setOpenrouterError('Failed to save settings. Please try again.');
                }
            } else {
                setOpenrouterError(result.message || 'Failed to verify API key');
            }
        } catch (error: any) {
            console.error('Error verifying OpenRouter API key:', error);
            setOpenrouterStatus(false);
            setOpenrouterError('Network error. Please check your internet connection.');
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
                if (!saved) {
                    setGroqError('Failed to save settings. Please try again.');
                }
            } else {
                setGroqError(result.message || 'Failed to verify API key');
            }
        } catch (error: any) {
            console.error('Error verifying Groq API key:', error);
            setGroqStatus(false);
            setGroqError('Network error. Please check your internet connection.');
        } finally {
            setGroqLoading(false);
        }
    };

    const themedStyles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
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
        },
        label: {
            fontSize: 16,
            color: isDark ? '#fff' : '#000',
            marginBottom: 8,
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
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        sectionIcon: {
            marginRight: 8,
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
            marginTop: 12,
            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            padding: 10,
            borderRadius: 8,
        },
        statusText: {
            marginLeft: 8,
            fontSize: 14,
            flex: 1,
        },
        successText: {
            color: '#4CAF50',
        },
        errorText: {
            color: '#F44336',
        },
        infoText: {
            fontSize: 14,
            color: isDark ? '#aaa' : '#666',
            marginTop: 4,
            marginBottom: 8,
        },
        inputGroup: {
            marginBottom: 12,
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
    }), [isDark]);

    // Helper function to render API key input section with model name input
    const renderApiSection = (
        title: string,
        icon: string,
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
        modelLink: string
    ) => (
        <View style={themedStyles.section}>
            <View style={themedStyles.sectionHeader}>
                <MaterialIcons 
                    name={icon as any} 
                    size={22} 
                    color={isDark ? '#4a90e2' : '#2196F3'} 
                    style={themedStyles.sectionIcon} 
                />
                <Text style={themedStyles.label}>{title}</Text>
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
                    onChangeText={onChangeKey}
                    secureTextEntry
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
                />
                <Text style={themedStyles.modelInfoText}>{modelInfo}</Text>
            </View>
            
            {error && (
                <View style={themedStyles.errorContainer}>
                    <Text style={themedStyles.errorMessage}>{error}</Text>
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
            
            {status !== null && (
                <View style={[
                    themedStyles.statusContainer,
                    status ? { backgroundColor: isDark ? 'rgba(76,175,80,0.1)' : 'rgba(76,175,80,0.05)' } : {}
                ]}>
                    <Ionicons 
                        name={status ? "checkmark-circle" : "close-circle"} 
                        size={20} 
                        color={status ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                        themedStyles.statusText, 
                        status ? themedStyles.successText : themedStyles.errorText
                    ]}>
                        {status ? `${title} verified successfully` : `Verification failed`}
                    </Text>
                </View>
            )}
        </View>
    );

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
                    {renderApiSection(
                        "OpenAI",
                        "bolt", 
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
                        "https://platform.openai.com/settings/organization/limits"
                    )}
                    
                    {renderApiSection(
                        "Google AI",
                        "cloud", 
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
                        "https://aistudio.google.com/app/prompts/new_chat"
                    )}
                    
                    {renderApiSection(
                        "Anthropic",
                        "psychology", 
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
                        "https://console.anthropic.com/workbench"
                    )}
                    
                    {renderApiSection(
                        "OpenRouter",
                        "router", 
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
                        "https://openrouter.ai/settings/keys",
                        "https://openrouter.ai/models?max_price=0"
                    )}
                    
                    {renderApiSection(
                        "Groq",
                        "speed", 
                        groqKey, 
                        setGroqKey,
                        groqModel,
                        setGroqModel,
                        verifyGroq, 
                        groqLoading, 
                        groqStatus,
                        groqError,
                        "Required for accessing Groq's fast inference API.",
                        "Examples: llama3-8b-8192, llama3-70b-8192, mixtral-8x7b-32768",
                        DEFAULT_MODELS.groq,
                        "https://console.groq.com/keys",
                        "https://console.groq.com/docs/rate-limits"
                    )}
                    
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default APISettings;