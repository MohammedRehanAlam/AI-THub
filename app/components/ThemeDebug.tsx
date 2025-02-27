import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Appearance, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import * as SystemUI from 'expo-system-ui';

export default function ThemeDebug() {
  const { currentTheme, forceRefresh } = useTheme();
  const [appearanceTheme, setAppearanceTheme] = useState<string | null>(
    Appearance.getColorScheme() || 'null'
  );
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [logs, setLogs] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  // Add a log entry
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]);
  };

  // Update the appearance theme every second
  useEffect(() => {
    const interval = setInterval(() => {
      const theme = Appearance.getColorScheme();
      if (theme !== appearanceTheme) {
        addLog(`Appearance API changed: ${appearanceTheme} -> ${theme}`);
      }
      setAppearanceTheme(theme || 'null');
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [appearanceTheme]);

  const handleRefresh = () => {
    addLog('Manual refresh triggered');
    forceRefresh();
    setLastUpdate(new Date());
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleSystemUITest = async () => {
    try {
      addLog(`Setting SystemUI to ${currentTheme === 'dark' ? 'light' : 'dark'}`);
      await SystemUI.setBackgroundColorAsync(
        currentTheme === 'dark' ? '#ffffff' : '#000000'
      );
      addLog('SystemUI color set successfully');
    } catch (error) {
      addLog(`Error setting SystemUI: ${error}`);
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: currentTheme === 'dark' ? '#222' : '#f5f5f5',
        borderColor: currentTheme === 'dark' ? '#444' : '#ccc' 
      }
    ]}>
      <TouchableOpacity onPress={toggleExpanded} style={styles.header}>
        <Text style={[styles.headerText, { color: currentTheme === 'dark' ? '#fff' : '#000' }]}>
          Theme Debug Info {expanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expanded && (
        <>
          <View style={styles.infoContainer}>
            <Text style={[styles.text, { color: currentTheme === 'dark' ? '#fff' : '#000' }]}>
              Current Theme: <Text style={styles.highlight}>{currentTheme}</Text>
            </Text>
            <Text style={[styles.text, { color: currentTheme === 'dark' ? '#fff' : '#000' }]}>
              Appearance API: <Text style={styles.highlight}>{appearanceTheme}</Text>
            </Text>
            <Text style={[styles.text, { color: currentTheme === 'dark' ? '#fff' : '#000' }]}>
              Platform: <Text style={styles.highlight}>{Platform.OS}</Text>
            </Text>
            <Text style={[styles.text, { color: currentTheme === 'dark' ? '#fff' : '#000' }]}>
              Last Update: <Text style={styles.highlight}>{lastUpdate.toLocaleTimeString()}</Text>
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.button, 
                { backgroundColor: currentTheme === 'dark' ? '#444' : '#ddd' }
              ]} 
              onPress={handleRefresh}
            >
              <Text style={[styles.buttonText, { color: currentTheme === 'dark' ? '#fff' : '#000' }]}>
                Force Refresh
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.button, 
                { backgroundColor: currentTheme === 'dark' ? '#444' : '#ddd' }
              ]} 
              onPress={handleSystemUITest}
            >
              <Text style={[styles.buttonText, { color: currentTheme === 'dark' ? '#fff' : '#000' }]}>
                Test SystemUI
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: currentTheme === 'dark' ? '#fff' : '#000' }]}>
            Log:
          </Text>
          <ScrollView style={styles.logContainer}>
            {logs.map((log, index) => (
              <Text 
                key={index} 
                style={[styles.logText, { color: currentTheme === 'dark' ? '#ccc' : '#333' }]}
              >
                {log}
              </Text>
            ))}
            {logs.length === 0 && (
              <Text style={[styles.logText, { color: currentTheme === 'dark' ? '#888' : '#888' }]}>
                No logs yet...
              </Text>
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 8,
    margin: 10,
    overflow: 'hidden',
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 4,
  },
  highlight: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  button: {
    padding: 8,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: 5,
  },
  logContainer: {
    maxHeight: 100,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    margin: 10,
    borderRadius: 4,
  },
  logText: {
    fontSize: 10,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
}); 