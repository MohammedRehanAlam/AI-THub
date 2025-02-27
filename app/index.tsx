import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './context/ThemeContext';
import { Box } from './components/Box';
import { Sidebar } from './components/Sidebar';
import { Ionicons } from '@expo/vector-icons';

const SIDEBAR_WIDTH = 250;

export default function HomePage() {
  const { currentTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // You can modify this array to add more boxes as needed
  const boxes = [1, 2, 3, 4];

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
      padding: 28,      
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
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
      zIndex: 1000,
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
  }), [isDark]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SafeAreaView style={themedStyles.container}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <View style={themedStyles.mainContent}>
        <View style={themedStyles.header}>
          <View style={themedStyles.headerLeft}>
            <TouchableOpacity onPress={toggleSidebar} style={themedStyles.toggleButton}>
              <Ionicons
                name={isSidebarOpen ? 'chevron-back-outline' : 'chevron-forward-outline'}
                size={24}
                color={isDark ? '#fff' : '#000'}
              />
            </TouchableOpacity>
            <Text style={themedStyles.logo}>AppLogo</Text>
          </View>
        </View>
        
        <ScrollView 
          contentContainerStyle={themedStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          indicatorStyle={isDark ? "white" : "black"}
        >
          <View style={themedStyles.grid}>
            {boxes.map((num) => (
              <Box
                key={num}
                number={num}
                isDark={isDark}
                totalBoxes={boxes.length}
                onPress={() => console.log(`Box ${num} pressed`)}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
} 