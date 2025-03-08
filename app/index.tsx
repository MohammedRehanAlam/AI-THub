import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import { Box } from './components/Box';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomePage() {
  const { currentTheme } = useTheme();
  const [isSettingsOpen] = useState(false);
  const router = useRouter();
  
  // Individual boxes for better control over position and properties
  type BoxRoute = '/tools/Box1' | '/tools/Box2' | '/tools/Box3' | '/tools/ComingSoon' | '/components/TranslatorApp';

  interface BoxItem {
    id: number;
    route: BoxRoute;
    title: string;
  }

  const boxes: BoxItem[] = [
    { id: 1, route: '/tools/Box1', title: 'Translator' },
    { id: 2, route: '/tools/Box2', title: 'Box 2 two' },
    { id: 3, route: '/tools/Box3', title: 'Box 3 three' },
    { id: 4, route: '/tools/ComingSoon', title: 'Coming Soon' },
    { id: 5, route: '/components/TranslatorApp', title: 'Translator old' },
  ];

  const isDark = currentTheme === 'dark';

  // Use useMemo to prevent unnecessary style recalculations
  const themedStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#fff',
    },
    mainContent: {
      flex: 1,
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'flex-start',
      marginHorizontal: -8,
    },
    comingSoonContainer: {
      width: '47%',
      aspectRatio: 1,
      justifyContent: 'center',
    },
    comingSoonText: {
      fontSize: 18,
      color: isDark ? '#999' : '#666',
      fontStyle: 'italic',
    },
    buttonText: {
      fontSize: 18,
      margin: 10,
      color: 'blue',
    },
    separator: {
      height: 1,
      backgroundColor: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
      marginVertical: 10,
  },
  }), [isDark]);

 

  return (
    <SafeAreaView style={themedStyles.container}>
      <View style={themedStyles.mainContent}>
        <View style={themedStyles.header}>
          <View style={themedStyles.headerLeft}>
            <TouchableOpacity style={themedStyles.toggleButton} onPress={() => router.push('/Settings')}>
              <Ionicons
                name={isSettingsOpen ? 'chevron-back-outline' : 'chevron-forward-outline'}
                size={24}
                color={isDark ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <Text style={themedStyles.logo}>AppLogo</Text>
          </View>
        </View>
        <View style={themedStyles.separator} />
        <ScrollView 
          contentContainerStyle={themedStyles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle={isDark ? "white" : "black"}
        >     
          <View style={themedStyles.grid}>
            {boxes.map((box) => (
              <Box
                key={box.id}
                isDark={isDark}
                title={box.title}
                onPress={() => {
                  if (box.route === '/tools/ComingSoon') {
                    router.push({
                      pathname: '/tools/ComingSoon',
                      params: { title: box.title }
                    });
                  } else {
                    router.push({
                      pathname: box.route as BoxRoute
                    });
                  }
                }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 