import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface AboutAppProps {
  visible: boolean;
  onClose: () => void;
}

const currentYear = new Date().getFullYear();

export function AboutApp({ visible, onClose }: AboutAppProps) {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'dark';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View 
          style={[
            styles.modalContent,
            { backgroundColor: isDark ? '#2d2d2d' : '#ffffff' }
          ]}
        >
          <View style={[
            styles.modalHeader,
            { borderBottomColor: isDark ? '#444' : '#e0e0e0' }
          ]}>
            <Text style={[
              styles.modalTitle,
              { color: isDark ? '#fff' : '#000' }
            ]}>
              About AI THub
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons 
                name="close" 
                size={24} 
                color={isDark ? '#fff' : '#000'} 
              />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Overview
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#ddd' : '#333' }]}>
                AI THub is a powerful translation application that leverages advanced AI technology to provide accurate and context-aware translations across multiple languages.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Features
              </Text>
              <View style={styles.featureList}>
                <Text style={[styles.featureItem, { color: isDark ? '#ddd' : '#333' }]}>
                  • Real-time translation
                </Text>
                <Text style={[styles.featureItem, { color: isDark ? '#ddd' : '#333' }]}>
                  • Support for multiple languages
                </Text>
                <Text style={[styles.featureItem, { color: isDark ? '#ddd' : '#333' }]}>
                  • Context-aware translations
                </Text>
                <Text style={[styles.featureItem, { color: isDark ? '#ddd' : '#333' }]}>
                  • User-friendly interface
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Version
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#ddd' : '#333' }]}>
                1.0.0
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Contact
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#ddd' : '#333' }]}>
                For support or feedback, please contact us at:
                support@aithub.com
              </Text>
            </View>

            <View style={[styles.section, styles.legalSection]}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Legal Information
              </Text>
              <Text style={[styles.sectionText, { color: isDark ? '#ddd' : '#333' }]}>
                © {currentYear} AI THub. All Rights Reserved.
              </Text>
              <Text style={[styles.legalText, { color: isDark ? '#ddd' : '#333' }]}>
                AI THub and its contents are protected by copyright and other intellectual property laws. Any unauthorized use, reproduction, or distribution of this application or its contents may violate applicable laws and could result in civil or criminal penalties.
              </Text>
              <Text style={[styles.legalText, { color: isDark ? '#ddd' : '#333', marginTop: 8 }]}>
                All trademarks, service marks, trade names, and logos displayed in this application are the property of their respective owners.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  featureList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  legalSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 20,
  },
  legalText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    fontStyle: 'italic',
  },
}); 