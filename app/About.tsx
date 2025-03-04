import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const About = () => {
    const { currentTheme } = useTheme();
    const isDark = currentTheme === 'dark';
    const navigation = useNavigation(); // To enable navigation back

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#2d2d2d' : '#f0f0f0' }}>
          {/* Custom Header */}
          <View style={[styles.header, { backgroundColor: 'red' }]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name='chevron-back' size={24} color='#fff' />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>About</Text>
          </View>
          {/* About Content */}
          <View style={styles.container}> 
            <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>About Screen</Text>
            <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>Here you can learn more about the app.</Text>
            <Text style={[styles.text, { color: isDark ? '#fff' : '#000' }]}>Demo text: This app helps you manage your tasks efficiently!</Text>
          </View>
        </View>
    );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    color: '#fff',
    marginLeft: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 24,
    margin: 10,
  },
});

export default About; 