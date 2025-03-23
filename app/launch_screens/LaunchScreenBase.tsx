import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface LaunchScreenProps {
  title: string;
  description: string;
  instructions: string[];
  image?: ImageSourcePropType;
  toolRoute: string;
}

export default function LaunchScreenBase({ 
  title, 
  description, 
  instructions,
  image,
  toolRoute 
}: LaunchScreenProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const router = useRouter();

  const handleLaunch = () => {
    // Navigate to the tool
    router.push(toolRoute as any);
  };

  const handleGoBack = () => {
    // Go back to the index page
    router.push('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>{title}</Text>
        </View>
      </View>
      
      <View style={[styles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }]} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {image && (
          <View style={styles.imageContainer}>
            <Image source={image} style={styles.image} resizeMode="contain" />
          </View>
        )}

        <Text style={[styles.description, { color: isDark ? '#ddd' : '#333' }]}>
          {description}
        </Text>

        <View style={styles.instructionsContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            How to use:
          </Text>
          {instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={[styles.bulletPoint, { backgroundColor: isDark ? '#007AFF' : '#007AFF' }]} />
              <Text style={[styles.instructionText, { color: isDark ? '#ddd' : '#333' }]}>
                {instruction}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          onPress={handleLaunch} 
          style={[styles.launchButton, { backgroundColor: '#007AFF' }]}
        >
          <Text style={styles.launchButtonText}>Launch {title}</Text>
        </TouchableOpacity>
      </View>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    marginTop: 10,
    marginBottom: 0,
    width: '100%',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  image: {
    width: '80%',
    height: 200,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.2)',
    backgroundColor: 'transparent',
  },
  launchButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  launchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 