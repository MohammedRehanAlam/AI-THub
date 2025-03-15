import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const getFullYear = () => {
    return new Date().getFullYear();
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
    const { currentTheme, themePreference, setTheme } = useTheme();
    const isDark = currentTheme === 'dark';
    const router = useRouter();
    const [isThemeExpanded, setIsThemeExpanded] = useState(false);
    const isFocused = useIsFocused();
    const dropdownAnimation = new Animated.Value(0);

    // Reset expanded state when leaving the screen
    useEffect(() => {
        if (!isFocused) {
            setIsThemeExpanded(false);
        }
    }, [isFocused]);

    // Animate dropdown
    useEffect(() => {
        Animated.timing(dropdownAnimation, {
            toValue: isThemeExpanded ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isThemeExpanded]);

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
            backgroundColor: isDark ? '#1a1a1a' : '#fff',
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
        },
        menuItems: {
            paddingHorizontal: 20,
        },
        menuItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 20,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            marginBottom: 4,
        },
        menuItemText: {
            fontSize: 17,
            marginLeft: 16,
            color: isDark ? '#fff' : '#000',
            flex: 1,
            letterSpacing: 0.2,
        },
        separator: {
            height: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            marginVertical: 10,
        },
        footerContent: {
            marginTop: 'auto',
            paddingBottom: 20,
        },
        footerContainer: {
            padding: 16,
            alignItems: 'center',
        },
        copyrightText: {
            fontSize: 12,
            color: isDark ? '#999' : '#666',
            marginVertical: 2,
        },
        themeSubmenu: {
            overflow: 'hidden',
            paddingTop: 1,
        },
        themeOption: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 16,
            paddingHorizontal: 12,
            marginVertical: 2,
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        },
        activeThemeOption: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)',
            borderRadius: 8,
        },
        valueText: {
            fontSize: 15,
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            marginRight: 8,
        },
        iconContainer: {
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        },
        sectionTitle: {
            fontSize: 13,
            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
            marginTop: 32,
            marginBottom: 16,
            marginLeft: 20,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
        },
    }), [isDark]);

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        setTheme(theme);
        setIsThemeExpanded(false);
    };

    const dropdownHeight = dropdownAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 210], // Increased height to accommodate all options
    });

    const rotateIcon = dropdownAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '90deg'],
    });

    const handleAPISettingsPress = async () => {
        const hasPassword = await AsyncStorage.getItem('api_settings_password');
        if (hasPassword) {
            router.push('/APISettingsAuth');
        } else {
            router.push('/APISettings');
        }
    };

    return (
        <SafeAreaView style={themedStyles.container}>
            <View style={themedStyles.header}>
                <View style={themedStyles.headerLeft}>
                    <TouchableOpacity style={themedStyles.toggleButton} onPress={() => router.push('/')}>
                        <Ionicons name="chevron-back-outline" size={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text style={themedStyles.logo}>Settings</Text>
                </View>
            </View>
            <View style={themedStyles.separator} />

            <ScrollView 
                style={themedStyles.content}
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="automatic"
            >
                <Text style={themedStyles.sectionTitle}>API Settings</Text>
                <View style={themedStyles.menuItems}>
                    <TouchableOpacity 
                        style={themedStyles.menuItem}
                        onPress={handleAPISettingsPress}
                    >
                        <View style={themedStyles.iconContainer}>
                            <Ionicons name="key-outline" size={20} color={isDark ? '#fff' : '#000'} />
                        </View>
                        <Text style={themedStyles.menuItemText}>API Settings</Text>
                        <Ionicons name="chevron-forward-outline" size={18} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                    </TouchableOpacity>
                </View>
                
                <Text style={themedStyles.sectionTitle}>Appearance</Text>
                <View style={themedStyles.menuItems}>
                    <TouchableOpacity 
                        style={themedStyles.menuItem}
                        onPress={() => setIsThemeExpanded(!isThemeExpanded)}
                    >
                        <View style={themedStyles.iconContainer}>
                            <Ionicons name="color-palette-outline" size={20} color={isDark ? '#fff' : '#000'} />
                        </View>
                        <Text style={themedStyles.menuItemText}>Theme</Text>
                        <Text style={themedStyles.valueText}>
                            {themePreference === 'system' ? `System (${isDark ? 'Dark' : 'Light'})` : themePreference === 'dark' ? 'Dark' : 'Light'}
                        </Text>
                        <Animated.View style={{ transform: [{ rotate: rotateIcon }] }}>
                            <Ionicons name="chevron-forward-outline" size={18} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                        </Animated.View>
                    </TouchableOpacity>

                    <Animated.View style={[themedStyles.themeSubmenu, { maxHeight: dropdownHeight }]}>
                        <TouchableOpacity 
                            style={[
                                themedStyles.themeOption,
                                themePreference === 'light' && themedStyles.activeThemeOption
                            ]}
                            onPress={() => handleThemeChange('light')}
                        >
                            <View style={themedStyles.iconContainer}>
                                <Ionicons name="sunny-outline" size={20} color={isDark ? '#fff' : '#000'} />
                            </View>
                            <Text style={themedStyles.menuItemText}>Light</Text>
                            {themePreference === 'light' && (
                                <Ionicons name="checkmark" size={20} color={isDark ? '#fff' : '#000'} />
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                themedStyles.themeOption,
                                themePreference === 'dark' && themedStyles.activeThemeOption
                            ]}
                            onPress={() => handleThemeChange('dark')}
                        >
                            <View style={themedStyles.iconContainer}>
                                <Ionicons name="moon-outline" size={20} color={isDark ? '#fff' : '#000'} />
                            </View>
                            <Text style={themedStyles.menuItemText}>Dark</Text>
                            {themePreference === 'dark' && (
                                <Ionicons name="checkmark" size={20} color={isDark ? '#fff' : '#000'} />
                            )}
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[
                                themedStyles.themeOption,
                                themePreference === 'system' && themedStyles.activeThemeOption
                            ]}
                            onPress={() => handleThemeChange('system')}
                        >
                            <View style={themedStyles.iconContainer}>
                                <Ionicons name="phone-portrait-outline" size={20} color={isDark ? '#fff' : '#000'} />
                            </View>
                            <Text style={themedStyles.menuItemText}>System Default</Text>
                            {themePreference === 'system' && (
                                <Ionicons name="checkmark" size={20} color={isDark ? '#fff' : '#000'} />
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                

                <Text style={themedStyles.sectionTitle}>Feedback & Support</Text>
                <View style={themedStyles.menuItems}>
                    <TouchableOpacity 
                        style={[themedStyles.menuItem, { borderBottomWidth: 0 }]}
                        onPress={() => router.push('/About')}
                    >
                        <View style={themedStyles.iconContainer}>
                            <Ionicons name="information-circle-outline" size={20} color={isDark ? '#fff' : '#000'} />
                        </View>
                        <Text style={themedStyles.menuItemText}>About</Text>
                        <Ionicons name="chevron-forward-outline" size={18} color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <View style={themedStyles.footerContent}>
                <View style={themedStyles.footerContainer}>
                    <Text style={themedStyles.copyrightText}>© {getFullYear()} AI T-Hub</Text>
                    <Text style={themedStyles.copyrightText}>All Rights Reserved</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Settings;