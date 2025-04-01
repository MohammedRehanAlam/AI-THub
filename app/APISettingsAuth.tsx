import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Animated, Alert } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const APISettingsAuth = () => {
    const { currentTheme } = useTheme();
    const isDark = currentTheme === 'dark';
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [hasPassword, setHasPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [isLocked, setIsLocked] = useState(false);
    const [lockTimer, setLockTimer] = useState(0);
    const [isFromSettings, setIsFromSettings] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [inputError, setInputError] = useState('');
    const [storedPasswordLength, setStoredPasswordLength] = useState(0);
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [oldPasswordVerified, setOldPasswordVerified] = useState(false);
    const shakeAnimation = new Animated.Value(0);
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    useEffect(() => {
        checkPassword();
    }, []);

    useEffect(() => {
        if (hasPassword && !isResettingPassword && password.length === storedPasswordLength) {
            handleVerifyPassword();
        }
    }, [password]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLocked && lockTimer > 0) {
            interval = setInterval(() => {
                setLockTimer((prev) => {
                    if (prev <= 1) {
                        setIsLocked(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isLocked, lockTimer]);

    useEffect(() => {
        const checkNavigation = async () => {
            const storedPassword = await AsyncStorage.getItem('api_settings_password');
            const isReset = await AsyncStorage.getItem('is_resetting_password');
            
            if (storedPassword && storedPassword !== 'pending') {
                setIsFromSettings(true);
                if (isReset === 'true') {
                    setIsResettingPassword(true);
                }
            }
        };
        checkNavigation();
    }, []);

    const checkPassword = async () => {
        const storedPassword = await AsyncStorage.getItem('api_settings_password');
        setHasPassword(!!storedPassword);
        
        if (!storedPassword || storedPassword === 'pending') {
            setHasPassword(false);
        } else {
            setHasPassword(true);
            setStoredPasswordLength(storedPassword.length);
        }
        
        if (!storedPassword) {
            router.push('/APISettings');
        }
    };

    const handleSetPassword = async () => {
        setPasswordError('');
        setConfirmPasswordError('');
        
        if (password.length < 4) {
            setPasswordError('Password must be at least 4 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            return;
        }

        if (isResettingPassword && password === oldPassword) {
            setPasswordError('New password cannot be the same as the old password');
            return;
        }

        try {
            await AsyncStorage.setItem('api_settings_password', password);
            await AsyncStorage.removeItem('is_resetting_password');
            router.push('/APISettings');
        } catch (error) {
            console.error('Error setting password:', error);
            setPasswordError('Failed to set password. Please try again.');
        }
    };

    const handleVerifyPassword = async () => {
        try {
            const storedPassword = await AsyncStorage.getItem('api_settings_password');
            
            if (isResettingPassword) {
                if (oldPassword === storedPassword) {
                    setOldPasswordVerified(true);
                    setAttempts(0);
                    setInputError('');
                } else {
                    const newAttempts = attempts + 1;
                    setAttempts(newAttempts);
                    setInputError('Incorrect old password. Try again.');
                    setOldPasswordVerified(false);
                    handleShakeAnimation();
                    
                    if (newAttempts >= 3) {
                        setIsLocked(true);
                        setLockTimer(30);
                        setAttempts(0);
                        setOldPassword('');
                        setInputError('');
                    }
                }
                return;
            }
            
            if (password === storedPassword) {
                setAttempts(0);
                setInputError('');
                setIsVerified(true);
            } else {
                const newAttempts = attempts + 1;
                setAttempts(newAttempts);
                setInputError('Incorrect password. Try again.');
                setIsVerified(false);
                handleShakeAnimation();

                if (newAttempts >= 3) {
                    setIsLocked(true);
                    setLockTimer(30);
                    setAttempts(0);
                    setPassword('');
                    setInputError('');
                }
            }
        } catch (error) {
            console.error('Error verifying password:', error);
            Alert.alert('Error', 'Failed to verify password');
        }
    };

    const handleShakeAnimation = () => {
        Animated.sequence([
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true
            }),
            Animated.timing(shakeAnimation, {
                toValue: -10,
                duration: 100,
                useNativeDriver: true
            }),
            Animated.timing(shakeAnimation, {
                toValue: 10,
                duration: 100,
                useNativeDriver: true
            }),
            Animated.timing(shakeAnimation, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true
            })
        ]).start();
    };

    const handleVerifiedButtonPress = () => {
        if (isVerified) {
            router.push('/APISettings');
        } else if (isResettingPassword && !oldPasswordVerified) {
            handleVerifyPassword();
        } else {
            handleVerifyPassword();
        }
    };

    const handleBackPress = async () => {
        if (isResettingPassword) {
            await AsyncStorage.removeItem('is_resetting_password');
        }
        if (isFromSettings) {
            router.push('/Settings');
        } else {
            router.push('/APISettings');
        }
    };

    const { width } = Dimensions.get('window');

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        },
        backButton: {
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            left: 16,
            gap: 12,
        },
        header: {
            padding: 34,      
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        backText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
        },
        content: {
            flex: 1,
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
        },
        icon: {
            marginBottom: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            color: isDark ? '#ffffff' : '#000000',
            marginBottom: 10,
        },
        subtitle: {
            fontSize: 16,
            textAlign: 'center',
            color: isDark ? '#cccccc' : '#666666',
            marginBottom: 30,
            paddingHorizontal: 20,
        },
        inputContainer: {
            width: '100%',
            marginBottom: 20,
            position: 'relative',
        },
        input: {
            width: '100%',
            height: 50,
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingRight: 50,
            fontSize: 16,
            borderWidth: 1,
            marginBottom: 12,
            backgroundColor: isDark ? '#2d2d2d' : '#f5f5f5',
            color: isDark ? '#ffffff' : '#000000',
            borderColor: isDark ? '#444444' : '#dddddd',
        },
        showPasswordButton: {
            position: 'absolute',
            right: 12,
            paddingVertical: 12,
            padding: 4,
        },
        button: {
            width: width * 0.8,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 20,
            backgroundColor: '#007AFF',
        },
        buttonText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: '600',
        },
        lockedContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 20,
            padding: 16,
            borderRadius: 8,
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
        },
        lockedText: {
            marginLeft: 8,
            fontSize: 14,
            fontWeight: '500',
            color: isDark ? '#ff4444' : '#ff0000',
        },
        inputError: {
            borderColor: '#ff4444',
        },
        verifiedButton: {
            backgroundColor: '#4CAF50',
        },
        errorText: {
            color: '#ff4444',
            fontSize: 14,
            marginTop: 4,
            marginLeft: 4,
        },
    });

    return (
         // to make all the contents in full screen
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

            <View style={styles.header}>
                <View style={styles.backButton}>
                    <TouchableOpacity 
                        onPress={handleBackPress}
                        style={{ padding: 4 }}
                    >
                        <Ionicons 
                            name="chevron-back-outline" 
                            size={24} 
                            color={isDark ? '#ffffff' : '#000000'} 
                        />
                    </TouchableOpacity>
                    <Text style={styles.backText}>Back</Text>
                </View>
            </View>

            <View style={styles.content}>
                <Ionicons 
                    name="shield-checkmark-outline" 
                    size={60} 
                    color={isDark ? '#ffffff' : '#000000'} 
                    style={styles.icon}
                />
                
                <Text style={styles.title}>
                    {!hasPassword ? 'Enable Password Protection' : 
                     (isResettingPassword ? (oldPasswordVerified ? 'Set New Password' : 'Verify Current Password') : 
                     'Enter Password')}
                </Text>
                
                <Text style={styles.subtitle}>
                    {!hasPassword ? 'Create a password to protect your API settings' :
                     (isResettingPassword ? (oldPasswordVerified ? 'Enter your new password' : 
                     'Enter your current password to continue') : 'Enter your password to access API settings')}
                </Text>

                {isResettingPassword && !oldPasswordVerified ? (
                    <Animated.View style={[
                        styles.inputContainer,
                        { transform: [{ translateX: shakeAnimation }] }
                    ]}>
                        <TextInput
                            style={[
                                styles.input,
                                inputError ? styles.inputError : null
                            ]}
                            placeholder="Enter current password"
                            placeholderTextColor={isDark ? '#888888' : '#999999'}
                            value={oldPassword}
                            onChangeText={(text) => {
                                setOldPassword(text);
                                setInputError('');
                            }}
                            secureTextEntry={!showPassword}
                            editable={!isLocked}
                            autoCapitalize="none"
                        />
                        {inputError ? (
                            <Text style={styles.errorText}>{inputError}</Text>
                        ) : null}
                        <TouchableOpacity 
                            style={styles.showPasswordButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Ionicons 
                                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                size={24} 
                                color={isDark ? '#ffffff' : '#000000'} 
                            />
                        </TouchableOpacity>
                    </Animated.View>
                ) : (
                    <>
                        <Animated.View style={[
                            styles.inputContainer,
                            { transform: [{ translateX: shakeAnimation }] }
                        ]}>
                            <TextInput
                                style={[
                                    styles.input,
                                    (inputError || passwordError) ? styles.inputError : null
                                ]}
                                placeholder={!hasPassword || oldPasswordVerified ? "Enter new password" : 
                                           (inputError || "Enter password")}
                                placeholderTextColor={inputError ? '#ff4444' : (isDark ? '#888888' : '#999999')}
                                value={password}
                                onChangeText={(text) => {
                                    setPassword(text);
                                    setInputError('');
                                    setPasswordError('');
                                }}
                                secureTextEntry={!showPassword}
                                editable={!isLocked && !isVerified}
                                autoCapitalize="none"
                            />
                            {passwordError ? (
                                <Text style={styles.errorText}>{passwordError}</Text>
                            ) : null}
                            <TouchableOpacity 
                                style={styles.showPasswordButton}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={24} 
                                    color={isDark ? '#ffffff' : '#000000'} 
                                />
                            </TouchableOpacity>
                        </Animated.View>

                        {(!hasPassword || oldPasswordVerified) && (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        confirmPasswordError ? styles.inputError : null
                                    ]}
                                    placeholder="Confirm new password"
                                    placeholderTextColor={isDark ? '#888888' : '#999999'}
                                    value={confirmPassword}
                                    onChangeText={(text) => {
                                        setConfirmPassword(text);
                                        setConfirmPasswordError('');
                                    }}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                {confirmPasswordError ? (
                                    <Text style={styles.errorText}>{confirmPasswordError}</Text>
                                ) : null}
                            </View>
                        )}
                    </>
                )}

                {isLocked ? (
                    <View style={styles.lockedContainer}>
                        <Ionicons name="lock-closed" size={24} color="#ff4444" />
                        <Text style={styles.lockedText}>
                            Too many attempts. Try again in {lockTimer} seconds
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[
                            styles.button,
                            isVerified && styles.verifiedButton
                        ]}
                        onPress={isResettingPassword ? 
                            (oldPasswordVerified ? handleSetPassword : handleVerifyPassword) :
                            (!hasPassword ? handleSetPassword : handleVerifiedButtonPress)}
                        disabled={(!hasPassword && !password.trim()) || 
                                (!hasPassword && !confirmPassword.trim()) ||
                                (isResettingPassword && !oldPasswordVerified && !oldPassword.trim()) ||
                                (isResettingPassword && oldPasswordVerified && (!password.trim() || !confirmPassword.trim()))}
                    >
                        <Text style={styles.buttonText}>
                            {!hasPassword ? 'Set Password' : 
                             (isResettingPassword ? 
                                (oldPasswordVerified ? 'Set New Password' : 'Verify Current Password') :
                                (isVerified ? 'Verified' : 'Verify'))}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

export default APISettingsAuth; 