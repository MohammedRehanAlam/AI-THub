import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';

interface ErrorAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  isDark: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ visible, title, message, onDismiss, isDark }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <BlurView
        intensity={10}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurContainer}
      >
        <View style={[styles.alertContainer, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>{title}</Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={[styles.message, { color: isDark ? '#E0E0E0' : '#333333' }]}>{message}</Text>
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isDark ? '#3A3A3C' : '#F2F2F7' }]}
            onPress={onDismiss}
          >
            <Text style={[styles.buttonText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>OK</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: width * 0.8,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContainer: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#CCCCCC',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  messageContainer: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#CCCCCC',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

export default ErrorAlert; 