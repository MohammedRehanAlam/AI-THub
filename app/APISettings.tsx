import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { testOpenAIKey, testGoogleAIKey, testAnthropicKey, testOpenRouterKey, testGroqKey } from './utils/apiUtils';

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

    // Load saved API keys on component mount
    React.useEffect(() => {
        const loadApiKeys = async () => {
            try {
                const savedOpenaiKey = await AsyncStorage.getItem('openai_api_key');
                const savedGoogleKey = await AsyncStorage.getItem('google_api_key');
                const savedAnthropicKey = await AsyncStorage.getItem('anthropic_api_key');
                const savedOpenrouterKey = await AsyncStorage.getItem('openrouter_api_key');
                const savedGroqKey = await AsyncStorage.getItem('groq_api_key');
                
                if (savedOpenaiKey) setOpenaiKey(savedOpenaiKey);
                if (savedGoogleKey) setGoogleKey(savedGoogleKey);
                if (savedAnthropicKey) setAnthropicKey(savedAnthropicKey);
                if (savedOpenrouterKey) setOpenrouterKey(savedOpenrouterKey);
                if (savedGroqKey) setGroqKey(savedGroqKey);
            } catch (error) {
                console.error('Error loading API keys:', error);
            }
        };
        
        loadApiKeys();
    }, []);

    // Save API key to AsyncStorage
    const saveApiKey = async (key: string, value: string) => {
        try {
            await AsyncStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            Alert.alert('Error', `Failed to save ${key}. Please try again.`);
        }
    };

    // Verify API keys
    const verifyOpenAI = async () => {
        if (!openaiKey.trim()) {
            Alert.alert('Error', 'Please enter an OpenAI API key');
            return;
        }
        
        setOpenaiLoading(true);
        setOpenaiStatus(null);
        
        try {
            const result = await testOpenAIKey(openaiKey);
            setOpenaiStatus(result.success);
            
            if (result.success) {
                await saveApiKey('openai_api_key', openaiKey);
                Alert.alert('Success', 'OpenAI API key verified and saved successfully');
            } else {
                Alert.alert('Error', result.message || 'Failed to verify OpenAI API key');
            }
        } catch (error) {
            console.error('Error verifying OpenAI API key:', error);
            setOpenaiStatus(false);
            Alert.alert('Error', 'Failed to verify OpenAI API key. Please check your internet connection and try again.');
        } finally {
            setOpenaiLoading(false);
        }
    };

    const verifyGoogle = async () => {
        if (!googleKey.trim()) {
            Alert.alert('Error', 'Please enter a Google AI API key');
            return;
        }
        
        setGoogleLoading(true);
        setGoogleStatus(null);
        
        try {
            const result = await testGoogleAIKey(googleKey);
            setGoogleStatus(result.success);
            
            if (result.success) {
                await saveApiKey('google_api_key', googleKey);
                Alert.alert('Success', 'Google AI API key verified and saved successfully');
            } else {
                Alert.alert('Error', result.message || 'Failed to verify Google AI API key');
            }
        } catch (error) {
            console.error('Error verifying Google AI API key:', error);
            setGoogleStatus(false);
            Alert.alert('Error', 'Failed to verify Google AI API key. Please check your internet connection and try again.');
        } finally {
            setGoogleLoading(false);
        }
    };

    const verifyAnthropic = async () => {
        if (!anthropicKey.trim()) {
            Alert.alert('Error', 'Please enter an Anthropic API key');
            return;
        }
        
        setAnthropicLoading(true);
        setAnthropicStatus(null);
        
        try {
            const result = await testAnthropicKey(anthropicKey);
            setAnthropicStatus(result.success);
            
            if (result.success) {
                await saveApiKey('anthropic_api_key', anthropicKey);
                Alert.alert('Success', 'Anthropic API key verified and saved successfully');
            } else {
                Alert.alert('Error', result.message || 'Failed to verify Anthropic API key');
            }
        } catch (error) {
            console.error('Error verifying Anthropic API key:', error);
            setAnthropicStatus(false);
            Alert.alert('Error', 'Failed to verify Anthropic API key. Please check your internet connection and try again.');
        } finally {
            setAnthropicLoading(false);
        }
    };

    const verifyOpenRouter = async () => {
        if (!openrouterKey.trim()) {
            Alert.alert('Error', 'Please enter an OpenRouter API key');
            return;
        }
        
        setOpenrouterLoading(true);
        setOpenrouterStatus(null);
        
        try {
            const result = await testOpenRouterKey(openrouterKey);
            setOpenrouterStatus(result.success);
            
            if (result.success) {
                await saveApiKey('openrouter_api_key', openrouterKey);
                Alert.alert('Success', 'OpenRouter API key verified and saved successfully');
            } else {
                Alert.alert('Error', result.message || 'Failed to verify OpenRouter API key');
            }
        } catch (error) {
            console.error('Error verifying OpenRouter API key:', error);
            setOpenrouterStatus(false);
            Alert.alert('Error', 'Failed to verify OpenRouter API key. Please check your internet connection and try again.');
        } finally {
            setOpenrouterLoading(false);
        }
    };

    const verifyGroq = async () => {
        if (!groqKey.trim()) {
            Alert.alert('Error', 'Please enter a Groq API key');
            return;
        }
        
        setGroqLoading(true);
        setGroqStatus(null);
        
        try {
            const result = await testGroqKey(groqKey);
            setGroqStatus(result.success);
            
            if (result.success) {
                await saveApiKey('groq_api_key', groqKey);
                Alert.alert('Success', 'Groq API key verified and saved successfully');
            } else {
                Alert.alert('Error', result.message || 'Failed to verify Groq API key');
            }
        } catch (error) {
            console.error('Error verifying Groq API key:', error);
            setGroqStatus(false);
            Alert.alert('Error', 'Failed to verify Groq API key. Please check your internet connection and try again.');
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
            backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            marginVertical: 10,
        },
        section: {
            marginBottom: 24,
        },
        verifyButton: {
            backgroundColor: isDark ? '#4a90e2' : '#2196F3',
            padding: 10,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 8,
        },
        buttonText: {
            color: '#fff',
            fontWeight: '500',
        },
        statusContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
        },
        statusText: {
            marginLeft: 8,
            fontSize: 14,
        },
        successText: {
            color: '#4CAF50',
        },
        errorText: {
            color: '#F44336',
        },
        infoText: {
            fontSize: 14,
            color: isDark ? '#888' : '#666',
            marginTop: 4,
        },
    }), [isDark]);

    // Helper function to render API key input section
    const renderApiSection = (
        title: string, 
        value: string, 
        onChangeText: (text: string) => void,
        onVerify: () => void,
        loading: boolean,
        status: boolean | null,
        info: string
    ) => (
        <View style={themedStyles.section}>
            <Text style={themedStyles.label}>{title}</Text>
            <TextInput
                style={themedStyles.input}
                placeholder={`Enter your ${title}`}
                placeholderTextColor={isDark ? '#888' : '#666'}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry
            />
            <Text style={themedStyles.infoText}>{info}</Text>
            
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
                <View style={themedStyles.statusContainer}>
                    <Ionicons 
                        name={status ? "checkmark-circle" : "close-circle"} 
                        size={18} 
                        color={status ? "#4CAF50" : "#F44336"} 
                    />
                    <Text style={[
                        themedStyles.statusText, 
                        status ? themedStyles.successText : themedStyles.errorText
                    ]}>
                        {status ? "API key is valid" : "API key is invalid"}
                    </Text>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView style={themedStyles.container}>   
            <View style={themedStyles.header}>
                <View style={themedStyles.headerLeft}>
                    <TouchableOpacity style={themedStyles.toggleButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back-outline" size={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text style={themedStyles.logo}>API Settings</Text>
                </View>
            </View>
            <View style={themedStyles.separator} />
            <ScrollView 
                style={themedStyles.content}
                showsVerticalScrollIndicator={true}
                indicatorStyle={isDark ? "white" : "black"}
            > 
                {renderApiSection(
                    "OpenAI API Key", 
                    openaiKey, 
                    setOpenaiKey, 
                    verifyOpenAI, 
                    openaiLoading, 
                    openaiStatus,
                    "Your API key is stored securely and used only for making requests to OpenAI's services."
                )}
                
                <View style={themedStyles.separator} />
                
                {renderApiSection(
                    "Google AI API Key", 
                    googleKey, 
                    setGoogleKey, 
                    verifyGoogle, 
                    googleLoading, 
                    googleStatus,
                    "Required for accessing Google's Gemini models."
                )}
                
                <View style={themedStyles.separator} />
                
                {renderApiSection(
                    "Anthropic API Key", 
                    anthropicKey, 
                    setAnthropicKey, 
                    verifyAnthropic, 
                    anthropicLoading, 
                    anthropicStatus,
                    "Required for accessing Anthropic's Claude models."
                )}
                
                <View style={themedStyles.separator} />
                
                {renderApiSection(
                    "OpenRouter API Key", 
                    openrouterKey, 
                    setOpenrouterKey, 
                    verifyOpenRouter, 
                    openrouterLoading, 
                    openrouterStatus,
                    "OpenRouter provides access to multiple AI models through a single API."
                )}
                
                <View style={themedStyles.separator} />
                
                {renderApiSection(
                    "Groq API Key", 
                    groqKey, 
                    setGroqKey, 
                    verifyGroq, 
                    groqLoading, 
                    groqStatus,
                    "Required for accessing Groq's fast inference API."
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default APISettings;