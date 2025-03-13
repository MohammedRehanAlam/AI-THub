import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, Linking } from 'react-native';

interface ErrorAlertProps {
  visible: boolean;
  title: string;
  message: string;
  learnMoreUrl?: string;
  onDismiss: () => void;
  isDark: boolean;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ 
  visible, 
  title, 
  message, 
  learnMoreUrl,
  onDismiss, 
  isDark 
}) => {
  const handleLearnMore = () => {
    if (learnMoreUrl) {
      Linking.openURL(learnMoreUrl);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={[styles.blurContainer, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
        <View style={[styles.alertContainer, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>{title}</Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={[styles.message, { color: isDark ? '#E0E0E0' : '#333333' }]}>
              {message}
            </Text>
            {learnMoreUrl && (
              <TouchableOpacity 
                onPress={handleLearnMore}
                style={[
                  styles.learnMoreContainer,
                  { backgroundColor: isDark ? '#3A3A3C' : '#F2F2F7' }
                ]}
              >
                <Text style={[styles.learnMore, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
                  Learn More →
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: isDark ? '#3A3A3C' : '#F2F2F7' }]}
            onPress={onDismiss}
          >
            <Text style={[styles.buttonText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    width: width * 0.85,
    maxHeight: '80%',
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
  },
  learnMoreContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  learnMore: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'none',
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