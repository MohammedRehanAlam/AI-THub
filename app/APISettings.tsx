import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Linking, Switch, Modal, Alert } from 'react-native';
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
export const DEFAULT_MODELS = {
  openai: "gpt-3.5-turbo",
  google: "gemini-1.5-flash",
  anthropic: "claude-3-opus-20240229",
  openrouter: "deepseek/deepseek-r1:free",
  groq: "llama3-8b-8192"
};

// Constants for storage keys
export const GLOBAL_MODEL_KEY = 'current_models';

// Add these interfaces after the DEFAULT_MODELS constant
interface VerifiedModel {
    name: string;
    order: number;
}

interface ProviderModels {
    openai: VerifiedModel[];
    google: VerifiedModel[];
    anthropic: VerifiedModel[];
    openrouter: VerifiedModel[];
    groq: VerifiedModel[];
}

const APISettings = () => {
    const { currentTheme } = useTheme();
    const { activeProviders, toggleProvider } = useProviders();
    const isDark = currentTheme === 'dark';
    const router = useRouter();
    
    // Add expanded sections state
    const [expandedSections, setExpandedSections] = useState<{[key in ProviderType]: boolean}>({
        openai: false,
        google: false,
        anthropic: false,
        openrouter: false,
        groq: false
    });
    
    // API key states
    const [openaiKey, setOpenaiKey] = useState('');
    const [googleKey, setGoogleKey] = useState('');
    const [anthropicKey, setAnthropicKey] = useState('');
    const [openrouterKey, setOpenrouterKey] = useState('');
    const [groqKey, setGroqKey] = useState('');
    
    // Model name states
    const [openaiModel, setOpenaiModel] = useState('');
    const [googleModel, setGoogleModel] = useState('');
    const [anthropicModel, setAnthropicModel] = useState('');
    const [openrouterModel, setOpenrouterModel] = useState('');
    const [groqModel, setGroqModel] = useState('');

    // Verified models state
    const [verifiedModels, setVerifiedModels] = useState<ProviderModels>({
        openai: [],
        google: [],
        anthropic: [],
        openrouter: [],
        groq: []
    });
    
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

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [hasPassword, setHasPassword] = useState(false);
    const [isPasswordPending, setIsPasswordPending] = useState(false);
    const [disablePasswordStep, setDisablePasswordStep] = useState(0);

    // Load saved API keys, models, and verified models on component mount
    useEffect(() => {
        const loadApiSettings = async () => {
            try {
                // Load API keys
                const savedOpenaiKey = await AsyncStorage.getItem('openai_api_key');
                const savedGoogleKey = await AsyncStorage.getItem('google_api_key');
                const savedAnthropicKey = await AsyncStorage.getItem('anthropic_api_key');
                const savedOpenrouterKey = await AsyncStorage.getItem('openrouter_api_key');
                const savedGroqKey = await AsyncStorage.getItem('groq_api_key');
                
                // Load verified models
                const savedVerifiedModels = await AsyncStorage.getItem('verified_models');
                
                // Set API keys if they exist
                if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
                if (savedGoogleKey) setGoogleKey(savedGoogleKey);
                if (savedAnthropicKey) setAnthropicKey(savedAnthropicKey);
                if (savedOpenrouterKey) setOpenrouterKey(savedOpenrouterKey);
                if (savedGroqKey) setGroqKey(savedGroqKey);
                
                // Set verified models if they exist
                if (savedVerifiedModels) {
                    const parsedModels = JSON.parse(savedVerifiedModels);
                    setVerifiedModels(parsedModels);
                }

                // Set status for providers with valid API keys
                if (savedOpenaiKey) setOpenaiStatus(true);
                if (savedGoogleKey) setGoogleStatus(true);
                if (savedAnthropicKey) setAnthropicStatus(true);
                if (savedOpenrouterKey) setOpenrouterStatus(true);
                if (savedGroqKey) setGroqStatus(true);

                // Check if password is set
                const storedPassword = await AsyncStorage.getItem('api_settings_password');
                setHasPassword(!!storedPassword);
                setIsPasswordPending(storedPassword === 'pending');
            } catch (error) {
                console.error('Error loading API settings:', error);
            }
        };
        
        loadApiSettings();
    }, []);

    // Save verified models to AsyncStorage
    const saveVerifiedModels = async (newVerifiedModels: ProviderModels) => {
        try {
            await AsyncStorage.setItem('verified_models', JSON.stringify(newVerifiedModels));
            
            // Update current models in AsyncStorage
            // Get the first model from each provider's list, or use default
            const currentModels = {
                openai: newVerifiedModels.openai[0]?.name || DEFAULT_MODELS.openai,
                google: newVerifiedModels.google[0]?.name || DEFAULT_MODELS.google,
                anthropic: newVerifiedModels.anthropic[0]?.name || DEFAULT_MODELS.anthropic,
                openrouter: newVerifiedModels.openrouter[0]?.name || DEFAULT_MODELS.openrouter,
                groq: newVerifiedModels.groq[0]?.name || DEFAULT_MODELS.groq
            };
            await AsyncStorage.setItem(GLOBAL_MODEL_KEY, JSON.stringify(currentModels));
            
            return true;
        } catch (error) {
            console.error('Error saving models:', error);
            return false;
        }
    };

    // Add a new verified model
    const addVerifiedModel = async (provider: keyof ProviderModels, modelName: string) => {
        const newVerifiedModels = { ...verifiedModels };
        const newModel: VerifiedModel = {
            name: modelName,
            order: 0 // New models are added at the top
        };
        
        // Update order of existing models
        newVerifiedModels[provider] = newVerifiedModels[provider].map(model => ({
            ...model,
            order: model.order + 1
        }));
        
        // Add new model at the top
        newVerifiedModels[provider] = [newModel, ...newVerifiedModels[provider]];
        
        const saved = await saveVerifiedModels(newVerifiedModels);
        if (saved) {
            setVerifiedModels(newVerifiedModels);
            return true;
        }
        return false;
    };

    // Reorder models
    const reorderModels = async (provider: keyof ProviderModels, fromIndex: number, toIndex: number) => {
        if (fromIndex === toIndex) return;

        const newVerifiedModels = { ...verifiedModels };
        const models = [...newVerifiedModels[provider]];
        const [movedModel] = models.splice(fromIndex, 1);
        models.splice(toIndex, 0, movedModel);

        // Update order values
        models.forEach((model, index) => {
            model.order = index;
        });

        newVerifiedModels[provider] = models;
        const saved = await saveVerifiedModels(newVerifiedModels);
        if (saved) {
            setVerifiedModels(newVerifiedModels);
        }
    };

    // Modify the saveApiSettings function to handle clearing
    const saveApiSettings = async (keyName: string, keyValue: string, modelName: string, modelValue: string) => {
        try {
            if (!keyValue.trim()) {
                // If key is empty, remove both key and model from storage
                await AsyncStorage.removeItem(keyName);
                await AsyncStorage.removeItem(modelName);
                // Also clear verified models for this provider
                const providerType = keyName.split('_')[0] as keyof ProviderModels;
                const newVerifiedModels = { ...verifiedModels };
                newVerifiedModels[providerType] = [];
                await saveVerifiedModels(newVerifiedModels);
                setVerifiedModels(newVerifiedModels);
                // Disable the provider only when explicitly clearing the key
                await toggleProvider(providerType, false);
            } else {
                // Save new values
                await AsyncStorage.setItem(keyName, keyValue);
                await AsyncStorage.setItem(modelName, modelValue);
            }
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
            await saveApiSettings('openai_api_key', '', 'openai_model', '');
            await toggleProvider('openai', false);
            return;
        }
        
        if (!openaiModel.trim()) {
            setOpenaiError('Please enter a model name');
            return;
        }
        
        // Check if model already exists
        if (verifiedModels.openai.some(m => m.name === openaiModel.trim())) {
            setOpenaiError('This model is already verified');
            return;
        }
        
        setOpenaiLoading(true);
        setOpenaiStatus(null);
        setOpenaiError(null);
        
        try {
            const result = await testOpenAIKey(openaiKey, openaiModel);
            
            // Check if this is a usage limit error
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

            // Set status based on the type of error
            setOpenaiStatus(result.success || isUsageLimitError);
            
            if (result.success || isUsageLimitError) {
                const saved = await saveApiSettings('openai_api_key', openaiKey, 'openai_model', openaiModel);
                if (saved) {
                    // Add the model to verified models
                    const modelAdded = await addVerifiedModel('openai', openaiModel);
                    if (modelAdded) {
                        // Clear the model input
                        setOpenaiModel('');
                        // Set error message if it's a usage limit error
                        if (isUsageLimitError) {
                            setOpenaiError(result.message);
                        }
                        // Automatically enable the provider
                        await toggleProvider('openai', true);
                    } else {
                        setOpenaiError('Failed to save model. Please try again.');
                    }
                } else {
                    setOpenaiError('Failed to save settings. Please try again.');
                }
            } else {
                setOpenaiError(result.message || 'Failed to verify API key');
                if (isCredentialError) {
                    await toggleProvider('openai', false);
                }
            }
        } catch (error: any) {
            console.error('Error verifying OpenAI API key:', error);
            setOpenaiStatus(false);
            setOpenaiError('Network error. Please check your internet connection.');
            await toggleProvider('openai', false);
        } finally {
            setOpenaiLoading(false);
        }
    };

    // Verify Google AI API key
    const verifyGoogle = async () => {
        if (!googleKey.trim()) {
            setGoogleError('Please enter a Google AI API key');
            await saveApiSettings('google_api_key', '', 'google_model', '');
            await toggleProvider('google', false);
            return;
        }
        
        if (!googleModel.trim()) {
            setGoogleError('Please enter a model name');
            return;
        }
        
        // Check if model already exists
        if (verifiedModels.google.some(m => m.name === googleModel.trim())) {
            setGoogleError('This model is already verified');
            return;
        }
        
        setGoogleLoading(true);
        setGoogleStatus(null);
        setGoogleError(null);
        
        try {
            const result = await testGoogleAIKey(googleKey, googleModel);
            
            // Check if this is a usage limit error
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

            // Set status based on the type of error
            setGoogleStatus(result.success || isUsageLimitError);
            
            if (result.success || isUsageLimitError) {
                const saved = await saveApiSettings('google_api_key', googleKey, 'google_model', googleModel);
                if (saved) {
                    // Add the model to verified models
                    const modelAdded = await addVerifiedModel('google', googleModel);
                    if (modelAdded) {
                        // Clear the model input
                        setGoogleModel('');
                        // Set error message if it's a usage limit error
                        if (isUsageLimitError) {
                            setGoogleError(result.message);
                        }
                        // Automatically enable the provider
                        await toggleProvider('google', true);
                    } else {
                        setGoogleError('Failed to save model. Please try again.');
                    }
                } else {
                    setGoogleError('Failed to save settings. Please try again.');
                }
            } else {
                setGoogleError(result.message || 'Failed to verify API key');
                if (isCredentialError) {
                    await toggleProvider('google', false);
                }
            }
        } catch (error: any) {
            console.error('Error verifying Google AI API key:', error);
            setGoogleStatus(false);
            setGoogleError('Network error. Please check your internet connection.');
            await toggleProvider('google', false);
        } finally {
            setGoogleLoading(false);
        }
    };

    // Verify Anthropic API key
    const verifyAnthropic = async () => {
        if (!anthropicKey.trim()) {
            setAnthropicError('Please enter an Anthropic API key');
            await saveApiSettings('anthropic_api_key', '', 'anthropic_model', '');
            await toggleProvider('anthropic', false);
            return;
        }
        
        if (!anthropicModel.trim()) {
            setAnthropicError('Please enter a model name');
            return;
        }
        
        // Check if model already exists
        if (verifiedModels.anthropic.some(m => m.name === anthropicModel.trim())) {
            setAnthropicError('This model is already verified');
            return;
        }
        
        setAnthropicLoading(true);
        setAnthropicStatus(null);
        setAnthropicError(null);
        
        try {
            const result = await testAnthropicKey(anthropicKey, anthropicModel);
            
            // Check if this is a usage limit error
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

            // Set status based on the type of error
            setAnthropicStatus(result.success || isUsageLimitError);
            
            if (result.success || isUsageLimitError) {
                const saved = await saveApiSettings('anthropic_api_key', anthropicKey, 'anthropic_model', anthropicModel);
                if (saved) {
                    // Add the model to verified models
                    const modelAdded = await addVerifiedModel('anthropic', anthropicModel);
                    if (modelAdded) {
                        // Clear the model input
                        setAnthropicModel('');
                        // Set error message if it's a usage limit error
                        if (isUsageLimitError) {
                            setAnthropicError(result.message);
                        }
                        // Automatically enable the provider
                        await toggleProvider('anthropic', true);
                    } else {
                        setAnthropicError('Failed to save model. Please try again.');
                    }
                } else {
                    setAnthropicError('Failed to save settings. Please try again.');
                }
            } else {
                setAnthropicError(result.message || 'Failed to verify API key');
                if (isCredentialError) {
                    await toggleProvider('anthropic', false);
                }
            }
        } catch (error: any) {
            console.error('Error verifying Anthropic API key:', error);
            setAnthropicStatus(false);
            setAnthropicError('Network error. Please check your internet connection.');
            await toggleProvider('anthropic', false);
        } finally {
            setAnthropicLoading(false);
        }
    };

    // Verify OpenRouter API key
    const verifyOpenRouter = async () => {
        if (!openrouterKey.trim()) {
            setOpenrouterError('Please enter an OpenRouter API key');
            await saveApiSettings('openrouter_api_key', '', 'openrouter_model', '');
            await toggleProvider('openrouter', false);
            return;
        }
        
        if (!openrouterModel.trim()) {
            setOpenrouterError('Please enter a model name');
            return;
        }
        
        // Check if model already exists
        if (verifiedModels.openrouter.some(m => m.name === openrouterModel.trim())) {
            setOpenrouterError('This model is already verified');
            return;
        }
        
        setOpenrouterLoading(true);
        setOpenrouterStatus(null);
        setOpenrouterError(null);
        
        try {
            const result = await testOpenRouterKey(openrouterKey, openrouterModel);
            
            // Check if this is a usage limit error
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

            // Set status based on the type of error
            setOpenrouterStatus(result.success || isUsageLimitError);
            
            if (result.success || isUsageLimitError) {
                const saved = await saveApiSettings('openrouter_api_key', openrouterKey, 'openrouter_model', openrouterModel);
                if (saved) {
                    // Add the model to verified models
                    const modelAdded = await addVerifiedModel('openrouter', openrouterModel);
                    if (modelAdded) {
                        // Clear the model input
                        setOpenrouterModel('');
                        // Set error message if it's a usage limit error
                        if (isUsageLimitError) {
                            setOpenrouterError(result.message);
                        }
                        // Automatically enable the provider
                        await toggleProvider('openrouter', true);
                    } else {
                        setOpenrouterError('Failed to save model. Please try again.');
                    }
                } else {
                    setOpenrouterError('Failed to save settings. Please try again.');
                }
            } else {
                setOpenrouterError(result.message || 'Failed to verify API key');
                if (isCredentialError) {
                    await toggleProvider('openrouter', false);
                }
            }
        } catch (error: any) {
            console.error('Error verifying OpenRouter API key:', error);
            setOpenrouterStatus(false);
            setOpenrouterError('Network error. Please check your internet connection.');
            await toggleProvider('openrouter', false);
        } finally {
            setOpenrouterLoading(false);
        }
    };

    // Verify Groq API key
    const verifyGroq = async () => {
        if (!groqKey.trim()) {
            setGroqError('Please enter a Groq API key');
            await saveApiSettings('groq_api_key', '', 'groq_model', '');
            await toggleProvider('groq', false);
            return;
        }
        
        if (!groqModel.trim()) {
            setGroqError('Please enter a model name');
            return;
        }
        
        // Check if model already exists
        if (verifiedModels.groq.some(m => m.name === groqModel.trim())) {
            setGroqError('This model is already verified');
            return;
        }
        
        setGroqLoading(true);
        setGroqStatus(null);
        setGroqError(null);
        
        try {
            const result = await testGroqKey(groqKey, groqModel);
            
            // Check if this is a usage limit error
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

            // Set status based on the type of error
            setGroqStatus(result.success || isUsageLimitError);
            
            if (result.success || isUsageLimitError) {
                const saved = await saveApiSettings('groq_api_key', groqKey, 'groq_model', groqModel);
                if (saved) {
                    // Add the model to verified models
                    const modelAdded = await addVerifiedModel('groq', groqModel);
                    if (modelAdded) {
                        // Clear the model input
                        setGroqModel('');
                        // Set error message if it's a usage limit error
                        if (isUsageLimitError) {
                            setGroqError(result.message);
                        }
                        // Automatically enable the provider
                        await toggleProvider('groq', true);
                    } else {
                        setGroqError('Failed to save model. Please try again.');
                    }
                } else {
                    setGroqError('Failed to save settings. Please try again.');
                }
            } else {
                setGroqError(result.message || 'Failed to verify API key');
                if (isCredentialError) {
                    await toggleProvider('groq', false);
                }
            }
        } catch (error: any) {
            console.error('Error verifying Groq API key:', error);
            setGroqStatus(false);
            setGroqError('Network error. Please check your internet connection.');
            await toggleProvider('groq', false);
        } finally {
            setGroqLoading(false);
        }
    };

    
    // Add password management functions
    const handleResetPassword = async () => {
        await AsyncStorage.setItem('is_resetting_password', 'true');
        setShowPasswordModal(false);
        router.push('/APISettingsAuth');
    };

    const handleEnablePassword = async () => {
        setShowPasswordModal(false);
        await AsyncStorage.setItem('api_settings_password', 'pending');
        setHasPassword(true);
        setIsPasswordPending(true);
    };

    const handleDisablePassword = async () => { 
        await AsyncStorage.removeItem('api_settings_password');
        setHasPassword(false);
        setIsPasswordPending(false);
        setShowPasswordModal(false);
        setDisablePasswordStep(0);
    };

    // Reset disable password step when modal is closed
    useEffect(() => {
        if (!showPasswordModal) {
            setDisablePasswordStep(0);
        }
    }, [showPasswordModal]);

    const PasswordSettingsModal = () => (
        <Modal
            visible={showPasswordModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
                setShowPasswordModal(false);
                setDisablePasswordStep(0);
            }}
        >
            <TouchableOpacity 
                style={themedStyles.modalOverlay}
                activeOpacity={1}
                onPress={() => {
                    setShowPasswordModal(false);
                    setDisablePasswordStep(0);
                }}
            >
                <View style={[themedStyles.modalContent, { backgroundColor: isDark ? '#252525' : '#fff' }]}>
                    <View style={themedStyles.modalOption}>
                        <View style={{ flexDirection: 'column', flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={[themedStyles.modalOptionText, { color: isDark ? '#fff' : '#000' }]}>
                                    Password Protection
                                </Text>
                                <Switch
                                    value={hasPassword}
                                    onValueChange={(value) => {
                                        if (value) {
                                            handleEnablePassword();
                                        } else {
                                            if (disablePasswordStep === 0) {
                                                setDisablePasswordStep(1);
                                            } else {
                                                handleDisablePassword();
                                            }
                                        }
                                    }}
                                    trackColor={{ false: isDark ? '#444' : '#ccc', true: isDark ? '#4a90e2' : '#2196F3' }}
                                    thumbColor={hasPassword ? (isDark ? '#fff' : '#fff') : (isDark ? '#888' : '#f4f3f4')}
                                    ios_backgroundColor={isDark ? '#444' : '#ccc'}
                                />
                            </View>
                            {disablePasswordStep === 1 && (
                                <Text style={[themedStyles.disableWarning]}>
                                    Click again to disable password protection
                                </Text>
                            )}
                        </View>
                    </View>
                    
                    {hasPassword && !isPasswordPending && (
                        <>
                            <View style={themedStyles.modalDivider} />
                            <TouchableOpacity 
                                style={themedStyles.modalOption}
                                onPress={handleResetPassword}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <Text style={[
                                        themedStyles.modalOptionText,
                                        { color: isDark ? '#ff4444' : '#ff0000' }
                                    ]}>
                                        Reset Password
                                    </Text>
                                    <Ionicons 
                                        name="key-outline" 
                                        size={24} 
                                        color={isDark ? '#ff4444' : '#ff0000'} 
                                        style={{ marginLeft: 60 }}
                                    />
                                </View>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </TouchableOpacity>
        </Modal>
    );

    // Modify removeVerifiedModel to update current models
    const removeVerifiedModel = async (provider: keyof ProviderModels, modelIndex: number) => {
        const newVerifiedModels = { ...verifiedModels };
        newVerifiedModels[provider] = newVerifiedModels[provider].filter((_, index) => index !== modelIndex);
        
        // Update order values after removal
        newVerifiedModels[provider].forEach((model, index) => {
            model.order = index;
        });
        
        const saved = await saveVerifiedModels(newVerifiedModels);
        if (saved) {
            setVerifiedModels(newVerifiedModels);
        }
    };

    // Add function to toggle section expansion
    const toggleSectionExpansion = (provider: keyof ProviderModels) => {
        setExpandedSections(prev => ({
            ...prev,
            [provider]: !prev[provider]
        }));
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
        headerRight: {
            position: 'absolute',
            right: 16,
            padding: 8,
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
            fontSize: 15,
            color: isDark ? '#fff' : '#000',
            fontWeight: '500',
            marginRight: 6,
        },
        separator: {
            height: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            marginTop: 5,
            marginBottom: 10,
        },
        section: {
            marginBottom: 20,
            backgroundColor: isDark ? '#252525' : '#f9f9f9',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: isDark ? '#333' : '#eee',
            width: '100%',
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            flexWrap: 'nowrap',
            width: '100%'
        },
        sectionIcon: {
            width: 24,
            height: 24,
            marginRight: 8,
            justifyContent: 'center',
            alignItems: 'center',
            flexShrink: 0,
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
            fontSize: 12,
            marginLeft: 6,
            flex: 1,
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
            fontSize: 12,
            color: isDark ? '#aaa' : '#666',
            marginTop: 2,
            marginBottom: 8,
        },
        inputGroup: {
            marginBottom: 12,
            width: '100%',
        },
        inputLabelContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
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
        linkText: {
            color: isDark ? '#4a90e2' : '#2196F3',
            fontSize: 12,
            fontWeight: '500',
        },
        toggleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 4,
            flexShrink: 0
        },
        toggleLabel: {
            fontSize: 12,
            marginRight: 0,
            color: isDark ? '#bbb' : '#555',
            minWidth: 45,
            textAlign: 'right',
        },
        disabledText: {
            color: isDark ? '#666' : '#aaa',
        },
        statusBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: 22,
            height: 22,
            borderRadius: 11,
            marginRight: 0,
            flexShrink: 0,
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
            fontSize: 10,
            fontWeight: '500',
            color: '#fff',
        },
        summaryContainer: {
            marginBottom: 16,
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
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            paddingTop: 70,
            paddingRight: 16,
            justifyContent: 'flex-start',
            alignItems: 'flex-end',
        },
        modalContent: {
            width: '80%',
            maxWidth: 250,
            borderRadius: 12,
            padding: 12,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
        },
        modalOption: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 8,
            gap: 10,
        },
        modalOptionText: {
            fontSize: 16,
            fontWeight: '500',
        },
        modalDivider: {
            height: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            marginVertical: 8,
        },
        disableWarning: {
            fontSize: 10,
            color: isDark ? '#ff4444' : '#ff0000',
            textAlign: 'center',
        },
        verifiedModelsContainer: {
            marginTop: 12,
            flexDirection: 'column',
            gap: 8,
        },
        modelCapsule: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? '#444' : '#e0e0e0',
            borderRadius: 16,
            paddingVertical: 6,
            paddingHorizontal: 12,
            marginRight: 8,
            marginBottom: 8,
        },
        modelCapsuleText: {
            color: isDark ? '#fff' : '#000',
            fontSize: 12,
            fontWeight: '500',
            flex: 1,
        },
        modelCapsuleActions: {
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 8,
            gap: 4,
        },
        reorderButton: {
            padding: 4,
        },
        addModelButton: {
            padding: 4,
        },
        expandCollapseHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 8,
            paddingHorizontal: 4,
        },
        removeButton: {
            padding: 4,
            marginLeft: 4,
        },
    }), [isDark]);

    // Modify the renderApiSection function to handle API key changes
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

        // Show add button if:
        // 1. API key is present AND
        // 2. Either verification was successful OR there's a non-credential error (like usage limits)
        const showAddButton = keyValue.trim() !== '' && (status === true || (status === false && !isCredentialError));
        
        const handleToggleChange = async (value: boolean) => {
            if (isToggleEnabled) {
                await toggleProvider(providerType, value);
            }
        };
        
        const handleKeyChange = async (text: string) => {
            onChangeKey(text);
            // Only clear settings and disable provider when explicitly clearing the key
            if (!text.trim()) {
                await saveApiSettings(`${providerType}_api_key`, '', `${providerType}_model`, '');
                // Reset status and error states
                switch (providerType) {
                    case 'openai':
                        setOpenaiStatus(null);
                        setOpenaiError(null);
                        break;
                    case 'google':
                        setGoogleStatus(null);
                        setGoogleError(null);
                        break;
                    case 'anthropic':
                        setAnthropicStatus(null);
                        setAnthropicError(null);
                        break;
                    case 'openrouter':
                        setOpenrouterStatus(null);
                        setOpenrouterError(null);
                        break;
                    case 'groq':
                        setGroqStatus(null);
                        setGroqError(null);
                        break;
                }
            }
        };
        
        // Determine the status badge to display
        const getStatusBadge = () => {
            if (status === true) {
                return (
                    <View style={[themedStyles.statusBadge, themedStyles.verifiedBadge]}>
                        <Ionicons name="checkmark-circle" size={14} color="#fff" />
                    </View>
                );
            } else if (status === false && isUsageLimitError && !isCredentialError) {
                return (
                    <View style={[themedStyles.statusBadge, themedStyles.limitBadge]}>
                        <Ionicons name="alert-circle" size={14} color="#fff" />
                    </View>
                );
            } else if (status === false) {
                return (
                    <View style={[themedStyles.statusBadge, themedStyles.errorBadge]}>
                        <Ionicons name="close-circle" size={14} color="#fff" />
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
                <Text style={[themedStyles.label, { flex: 1, flexShrink: 1 }]} numberOfLines={1} ellipsizeMode="tail">{title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 0 }}>
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
                    onChangeText={handleKeyChange}
                    secureTextEntry
                    multiline={false}
                    numberOfLines={1}
                />
            </View>
            
            <View style={themedStyles.inputGroup}>
                <View style={themedStyles.inputLabelContainer}>
                    <Text style={themedStyles.inputLabel}>Model Name</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <TouchableOpacity onPress={() => Linking.openURL(modelLink)}>
                            <Text style={themedStyles.linkText}>View Models</Text>
                        </TouchableOpacity>
                        {/* the add button beside the view models */}
                        {/* {showAddButton && (
                            <TouchableOpacity 
                                onPress={() => {
                                    if (modelValue.trim()) {
                                        onVerify();
                                    }
                                }}
                                style={themedStyles.addModelButton}
                            >
                                <Ionicons 
                                    name="add-circle-outline" 
                                    size={24} 
                                    color={isDark ? '#4a90e2' : '#2196F3'} 
                                />
                            </TouchableOpacity>
                        )} */}
                    </View>
                </View>
                <View style={{ position: 'relative' }}>
                    <TextInput
                        style={[themedStyles.input, { paddingRight: 40 }]} // Add padding to make space for the add button
                        placeholder={`Default: ${defaultModel}`}
                        placeholderTextColor={isDark ? '#888' : '#aaa'}
                        value={modelValue}
                        onChangeText={onChangeModel}
                        multiline={false}
                        numberOfLines={1}
                    />
                    {showAddButton && (
                        <TouchableOpacity 
                            onPress={() => {
                                if (modelValue.trim()) {
                                    onVerify();
                                }
                            }}
                            style={[themedStyles.addModelButton, { 
                                position: 'absolute', 
                                right: 5, 
                                top: '40%', 
                                transform: [{ translateY: -12 }],     // position the button vertically
                                zIndex: 1 
                            }]}
                        >
                            <Ionicons 
                                name="add-circle-outline" 
                                size={24} 
                                color={isDark ? '#4a90e2' : '#2196F3'} 
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <Text style={themedStyles.modelInfoText}>{modelInfo}</Text>
            </View>
            
            
            {/* Verified Models List */}
            {verifiedModels[providerType].length > 0 && (
                <View style={themedStyles.verifiedModelsContainer}>
                    <TouchableOpacity 
                        onPress={() => toggleSectionExpansion(providerType)}
                        style={themedStyles.expandCollapseHeader}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons 
                                name={expandedSections[providerType] ? "chevron-down" : "chevron-forward"} 
                                size={20} 
                                color={isDark ? '#fff' : '#000'} 
                            />
                            <Text style={[themedStyles.modelCapsuleText, { marginLeft: 4 }]}>
                                {verifiedModels[providerType].length} {verifiedModels[providerType].length === 1 ? 'Model' : 'Models'}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Show only first model when collapsed, all models when expanded */}
                    {verifiedModels[providerType]
                        .filter((_, index) => expandedSections[providerType] || index === 0)
                        .map((model, index) => (
                            <View key={`${model.name}-${index}`} style={themedStyles.modelCapsule}>
                                <Text style={themedStyles.modelCapsuleText}>{model.name}</Text>
                                <View style={themedStyles.modelCapsuleActions}>
                                    {expandedSections[providerType] && (
                                        <>
                                            {index > 0 && (
                                                <TouchableOpacity 
                                                    onPress={() => reorderModels(providerType, index, index - 1)}
                                                    style={themedStyles.reorderButton}
                                                >
                                                    <Ionicons name="chevron-up" size={16} color={isDark ? '#fff' : '#000'} />
                                                </TouchableOpacity>
                                            )}
                                            {index < verifiedModels[providerType].length - 1 && (
                                                <TouchableOpacity 
                                                    onPress={() => reorderModels(providerType, index, index + 1)}
                                                    style={themedStyles.reorderButton}
                                                >
                                                    <Ionicons name="chevron-down" size={16} color={isDark ? '#fff' : '#000'} />
                                                </TouchableOpacity>
                                            )}
                                        </>
                                    )}
                                    <TouchableOpacity 
                                        onPress={() => removeVerifiedModel(providerType, index)}
                                        style={themedStyles.removeButton}
                                    >
                                        <Ionicons name="close-circle" size={16} color={isDark ? '#ff4444' : '#ff0000'} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                    ))}
                </View>
            )}
            
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
                        size={18} 
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
                                `API key is valid but has usage limits.` : 
                                `Verification failed. Check your credentials.`)}
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
        // to make all the contents in full screen
        <SafeAreaView style={themedStyles.container} edges={['top', 'left', 'right']}>
            <View style={themedStyles.header}>
                <View style={themedStyles.headerLeft}>
                    <TouchableOpacity style={themedStyles.toggleButton} onPress={() => router.push('/Settings')}>
                        <Ionicons name="chevron-back-outline" size={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text style={themedStyles.logo}>API Settings</Text>
                </View>
                <TouchableOpacity 
                    style={themedStyles.headerRight}
                    onPress={() => setShowPasswordModal(true)}
                >
                    <Ionicons 
                        name={hasPassword ? "lock-closed" : "lock-open-outline"} 
                        size={24} 
                        color={isDark ? '#fff' : '#000'} 
                    />
                </TouchableOpacity>
            </View>
            <View style={[themedStyles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]} />
            
            <PasswordSettingsModal />
            
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
            >
                <ScrollView 
                    style={[themedStyles.content, { flex: 1 }]}
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
                    
                    <View style={[themedStyles.separator, { marginBottom: 26 }]} />
                    
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
                        "https://console.anthropic.com/workbench",
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
                        "Examples: deepseek/deepseek-r1:free, qwen/qwq-32b:free",
                        DEFAULT_MODELS.openrouter,
                        "https://openrouter.ai/keys",
                        "https://openrouter.ai/models",
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
                        "https://console.groq.com/docs/rate-limits",
                        "groq"
                    )}
                    
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default APISettings;