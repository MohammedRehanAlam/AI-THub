import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const getFullYear = () => {
    return new Date().getFullYear();
}

const About = () => {
    const { currentTheme } = useTheme();
    const isDark = currentTheme === 'dark';
    const router = useRouter();

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
        heading: {
            fontSize: 20,
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#000',
            marginBottom: 16,
            marginTop: 24,
        },
        separator: {
            height: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            marginTop: 5,
            marginBottom: 10,
        },
        section: {
            marginBottom: 24,
        },
        version: {
            fontSize: 14,
            color: isDark ? '#888' : '#666',
            marginTop: 8,
        },
        copyrightText: {
            fontSize: 12,
            color: isDark ? '#999' : '#666',
            marginVertical: 2,
        },
    }), [isDark]);

    return (
        // to make all the contents in full screen
        <SafeAreaView style={themedStyles.container} edges={['top', 'left', 'right']}>
            <View style={themedStyles.header}>
                <View style={themedStyles.headerLeft}>
                    <TouchableOpacity style={themedStyles.toggleButton} onPress={() => router.push('/Settings') }>
                        <Ionicons name="chevron-back-outline" size={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text style={themedStyles.logo}>About</Text>
                </View>
            </View>
            <View style={themedStyles.separator} />
            <ScrollView 
                style={themedStyles.content}
                showsVerticalScrollIndicator={true}
                indicatorStyle={isDark ? "white" : "black"}
            > 
                <View style={themedStyles.section}>
                    <Text style={themedStyles.text}>
                        Welcome to AI T-Hub, your comprehensive toolkit for AI-powered solutions.
                    </Text>
                    <Text style={themedStyles.heading}>Features</Text>
                    <Text style={themedStyles.text}>• Advanced language processing</Text>
                    <Text style={themedStyles.text}>• Real-time translations</Text>
                    <Text style={themedStyles.text}>• Smart content generation</Text>
                    <Text style={themedStyles.text}>• AI-powered assistance</Text>
                    <Text style={themedStyles.heading}>Version</Text>
                    <Text style={themedStyles.version}>1.0.0</Text>
                    <Text style={themedStyles.version}> </Text>
                    <Text style={themedStyles.copyrightText}>© {getFullYear()} AI T-Hub</Text>
                    <Text style={themedStyles.copyrightText}>All Rights Reserved</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default About;