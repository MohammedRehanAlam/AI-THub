import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface CollapsibleErrorAlertProps {
  visible: boolean;
  title: string;
  message: string;
  detailedError?: string;
  onDismiss: () => void;
  isDark: boolean;
}

const CollapsibleErrorAlert: React.FC<CollapsibleErrorAlertProps> = ({ 
  visible, 
  title, 
  message, 
  detailedError, 
  onDismiss, 
  isDark 
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Function to detect URLs in text and make them clickable
  const renderTextWithLinks = (text: string) => {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split the text by URLs
    const parts = text.split(urlRegex);
    
    // Find all URLs in the text
    const urls = text.match(urlRegex) || [];
    
    // Combine parts and URLs
    const result = [];
    for (let i = 0; i < parts.length; i++) {
      // Add the text part
      if (parts[i]) {
        result.push(
          <Text 
            key={`text-${i}`} 
            style={{ 
              color: isDark ? '#E0E0E0' : '#333333',
              fontSize: 16,
              lineHeight: 22,
              textAlign: 'center'
            }}
          >
            {parts[i]}
          </Text>
        );
      }
      
      // Add the URL part if it exists
      if (urls[i - 1]) {
        result.push(
          <TouchableOpacity 
            key={`link-${i-1}`} 
            onPress={() => Linking.openURL(urls[i - 1])}
          >
            <Text 
              style={{ 
                color: isDark ? '#0A84FF' : '#007AFF', 
                textDecorationLine: 'underline',
                fontSize: 16,
                lineHeight: 22
              }}
            >
              {urls[i - 1]}
            </Text>
          </TouchableOpacity>
        );
      }
    }
    
    return result;
  };

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
            <View style={styles.messageTextContainer}>
              {renderTextWithLinks(message)}
            </View>
            
            {detailedError && (
              <View style={styles.detailedErrorContainer}>
                <TouchableOpacity 
                  style={styles.expandButton} 
                  onPress={toggleExpand}
                >
                  <Text style={[styles.expandButtonText, { color: isDark ? '#0A84FF' : '#007AFF' }]}>
                    {expanded ? 'Hide Details' : 'Show Details'}
                  </Text>
                  <Ionicons 
                    name={expanded ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color={isDark ? '#0A84FF' : '#007AFF'} 
                  />
                </TouchableOpacity>
                
                {expanded && (
                  <ScrollView 
                    style={styles.detailedErrorScroll}
                    contentContainerStyle={styles.detailedErrorContent}
                  >
                    <View style={[
                      styles.detailedErrorBox, 
                      { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }
                    ]}>
                      <Text style={[
                        styles.detailedErrorText, 
                        { color: isDark ? '#E0E0E0' : '#333333' }
                      ]}>
                        {detailedError}
                      </Text>
                    </View>
                  </ScrollView>
                )}
              </View>
            )}
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
  messageTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  detailedErrorContainer: {
    marginTop: 10,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  expandButtonText: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 5,
  },
  detailedErrorScroll: {
    maxHeight: 200,
  },
  detailedErrorContent: {
    paddingVertical: 5,
  },
  detailedErrorBox: {
    padding: 12,
    borderRadius: 8,
  },
  detailedErrorText: {
    fontSize: 14,
    fontFamily: 'monospace',
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

export default CollapsibleErrorAlert; 