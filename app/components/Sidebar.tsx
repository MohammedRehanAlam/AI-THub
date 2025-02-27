import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AboutApp } from './AboutApp';
import { Settings } from './Settings';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIDEBAR_WIDTH = 250;
const currentYear = new Date().getFullYear();

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentTheme, setTheme } = useTheme();
  const isDark = currentTheme === 'dark';
  const insets = useSafeAreaInsets();
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark' | 'system'>('system');
  const translateX = React.useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isOpen]);

  const handleAboutPress = () => {
    setIsAboutVisible(true);
  };

  const handleThemePress = () => {
    setIsThemeMenuOpen(!isThemeMenuOpen);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setTheme(theme);
    setActiveTheme(theme);
    setIsThemeMenuOpen(false);
  };

  const getThemeItemStyle = (theme: 'light' | 'dark' | 'system') => {
    return [
      styles.submenuItem,
      theme === activeTheme && {
        backgroundColor: isDark ? '#444' : '#ddd',
      }
    ];
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <Animated.View 
        style={[
          styles.backdrop,
          {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: backdropOpacity,
          }
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: isDark ? '#2d2d2d' : '#f5f5f5',
            transform: [{ translateX }],
            borderRightColor: isDark ? '#444' : '#e0e0e0',
            paddingTop: insets.top,
          },
        ]}>
        <View style={styles.sidebarContent}>
          <View style={styles.headerSpace} />
          <View style={styles.titleSpace} />
          <View style={styles.menuItems}>
            <TouchableOpacity 
              style={[
                styles.menuItem,
                isThemeMenuOpen && styles.menuItemActive,
                { backgroundColor: isThemeMenuOpen ? (isDark ? '#444' : '#ddd') : 'transparent' }
              ]} 
              onPress={handleThemePress}
            >
              <Ionicons name="color-palette-outline" size={24} color={isDark ? '#fff' : '#000'} />
              <Text style={[styles.menuItemText, { color: isDark ? '#fff' : '#000' }]}>Themes</Text>
              <Ionicons 
                name={isThemeMenuOpen ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color={isDark ? '#fff' : '#000'} 
                style={styles.menuItemIcon}
              />
            </TouchableOpacity>
            
            {isThemeMenuOpen && (
              <View style={[styles.submenu, { backgroundColor: isDark ? '#363636' : '#ebebeb' }]}>
                <Pressable 
                  style={({ pressed }) => [
                    getThemeItemStyle('light'),
                    pressed && styles.submenuItemPressed
                  ]} 
                  onPress={() => handleThemeChange('light')}
                >
                  <View style={styles.themeOption}>
                    <Ionicons name="sunny" size={20} color={isDark ? '#fff' : '#000'} />
                    <Text style={[styles.submenuText, { color: isDark ? '#fff' : '#000' }]}>Light Mode</Text>
                    {activeTheme === 'light' && (
                      <Ionicons name="checkmark" size={20} color={isDark ? '#fff' : '#000'} style={styles.checkmark} />
                    )}
                  </View>
                </Pressable>
                <Pressable 
                  style={({ pressed }) => [
                    getThemeItemStyle('dark'),
                    pressed && styles.submenuItemPressed
                  ]} 
                  onPress={() => handleThemeChange('dark')}
                >
                  <View style={styles.themeOption}>
                    <Ionicons name="moon" size={20} color={isDark ? '#fff' : '#000'} />
                    <Text style={[styles.submenuText, { color: isDark ? '#fff' : '#000' }]}>Dark Mode</Text>
                    {activeTheme === 'dark' && (
                      <Ionicons name="checkmark" size={20} color={isDark ? '#fff' : '#000'} style={styles.checkmark} />
                    )}
                  </View>
                </Pressable>
                <Pressable 
                  style={({ pressed }) => [
                    getThemeItemStyle('system'),
                    pressed && styles.submenuItemPressed
                  ]} 
                  onPress={() => handleThemeChange('system')}
                >
                  <View style={styles.themeOption}>
                    <Ionicons name="phone-portrait" size={20} color={isDark ? '#fff' : '#000'} />
                    <Text style={[styles.submenuText, { color: isDark ? '#fff' : '#000' }]}>System Default</Text>
                    {activeTheme === 'system' && (
                      <Ionicons name="checkmark" size={20} color={isDark ? '#fff' : '#000'} style={styles.checkmark} />
                    )}
                  </View>
                </Pressable>
              </View>
            )}

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => setIsSettingsVisible(true)}
            >
              <Ionicons name="settings-outline" size={24} color={isDark ? '#fff' : '#000'} />
              <Text style={[styles.menuItemText, { color: isDark ? '#fff' : '#000' }]}>Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleAboutPress}
            >
              <Ionicons name="information-circle-outline" size={24} color={isDark ? '#fff' : '#000'} />
              <Text style={[styles.menuItemText, { color: isDark ? '#fff' : '#000' }]}>About</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerContainer}>
            <Text style={[styles.copyrightText, { color: isDark ? '#999' : '#666' }]}>
              © {currentYear} AI THub
            </Text>
            <Text style={[styles.copyrightText, { color: isDark ? '#999' : '#666' }]}>
              All Rights Reserved
            </Text>
          </View>
        </View>
      </Animated.View>
      
      <AboutApp 
        visible={isAboutVisible} 
        onClose={() => setIsAboutVisible(false)} 
      />
      <Settings
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
  },
  backdropPressable: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    borderRightWidth: 1,
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  sidebarContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  headerSpace: {
    height: 10,
  },
  titleSpace: {
    height: 44,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuItems: {
    paddingHorizontal: 10,
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
  },
  menuItemActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 10,
    flex: 1,
  },
  menuItemIcon: {
    marginLeft: 'auto',
  },
  submenu: {
    marginLeft: 34,
    marginTop: -2,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  submenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  submenuItemPressed: {
    opacity: 0.7,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submenuText: {
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
  },
  checkmark: {
    marginLeft: 8,
  },
  footerContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 2,
  },
}); 