import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const APISettings = () => {
    const { currentTheme } = useTheme();
    const isDark = currentTheme === 'dark';
    const router = useRouter();
    const [apiKey, setApiKey] = useState('');

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
    }), [isDark]);

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
                <View style={themedStyles.section}>
                    <Text style={themedStyles.label}>OpenAI API Key</Text>
                    <TextInput
                        style={themedStyles.input}
                        placeholder="Enter your OpenAI API key"
                        placeholderTextColor={isDark ? '#888' : '#666'}
                        value={apiKey}
                        onChangeText={setApiKey}
                        secureTextEntry
                    />
                    <Text style={[themedStyles.text, { fontSize: 14, color: isDark ? '#888' : '#666' }]}>
                        Your API key is stored securely and used only for making requests to OpenAI's services.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default APISettings;