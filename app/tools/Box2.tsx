import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Box2() {
    const { currentTheme } = useTheme();
    const isDark = currentTheme === 'dark';
    const router = useRouter();
  
    const styles = StyleSheet.create({
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
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDark ? '#fff' : '#000',
        marginBottom: 20,
      },
      text: {
        color: isDark ? '#fff' : '#000',
        fontSize: 16,
        textAlign: 'center',
      },
      separator: {
        height: 1,
        backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
        marginVertical: 10,
      },
    });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.toggleButton} onPress={() => router.push('/')}>
            <Ionicons name="chevron-back-outline" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={styles.logo}>Box 2</Text>
        </View>
      </View>
      <View style={styles.separator} />
      <View style={styles.content}>
        <Text style={styles.title}>Box 2 Content</Text>
        <Text style={styles.text}>This is the content for Box 2. You can customize this page as needed.</Text>
      </View>
    </SafeAreaView>
  );
}