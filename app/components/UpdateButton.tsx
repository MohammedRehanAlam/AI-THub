import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { checkAndInstallUpdates } from '../utils/updateUtils';

interface UpdateButtonProps {
  label?: string;
  style?: object;
  textStyle?: object;
}

export default function UpdateButton({ 
  label = 'Check for Updates', 
  style = {}, 
  textStyle = {} 
}: UpdateButtonProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckForUpdates = async () => {
    setIsChecking(true);
    try {
      await checkAndInstallUpdates(false);
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, style]} 
      onPress={handleCheckForUpdates}
      disabled={isChecking}
    >
      {isChecking ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={[styles.loadingText, textStyle]}>Checking...</Text>
        </View>
      ) : (
        <Text style={[styles.buttonText, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#9999',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 