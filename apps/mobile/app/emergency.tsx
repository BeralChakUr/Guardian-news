import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Linking,
  Share,
  Clipboard,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/appStore';
import { getTheme } from '../src/theme/colors';
import { mockEmergencyScenarios } from '../src/data/mockEmergency';
import { EmergencyScenario, Contact, Template } from '../src/types';

export default function EmergencyScreen() {
  const { isDarkMode } = useAppStore();
  const theme = getTheme(isDarkMode);
  const [selectedScenario, setSelectedScenario] = useState<EmergencyScenario | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url);
  };

  const handleShare = async (scenario: EmergencyScenario) => {
    try {
      const message = `🚨 ${scenario.title}\n\nActions immédiates:\n${scenario.immediateActions.map(a => `• ${a}`).join('\n')}\n\n📱 Envoyé depuis CyberGuard`;
      await Share.share({ message });
    } catch (error) {
      console.error(error);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copié !', 'Le texte a été copié dans le presse-papiers');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Urgence</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Réagir en cas d'incident</Text>
        </View>
        <View style={[styles.emergencyBadge, { backgroundColor: theme.danger + '20' }]}>
          <Ionicons name="call" size={16} color={theme.danger} />
          <Text style={[styles.emergencyNumber, { color: theme.danger }]}>17</Text>
        </View>
      </View>

      {/* Intro */}
      <View style={[styles.introCard, { backgroundColor: theme.danger + '10', borderColor: theme.danger + '30' }]}>
        <Ionicons name="warning" size={24} color={theme.danger} />
        <View style={styles.introContent}>
          <Text style={[styles.introTitle, { color: theme.text }]}>En cas d'urgence</Text>
          <Text style={[styles.introText, { color: theme.textSecondary }]}>
            Sélectionnez votre situation pour obtenir les actions à suivre et les contacts utiles.
          </Text>
        </View>
      </View>

      {/* Scenarios */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Que vous arrive-t-il ?</Text>
        
        {mockEmergencyScenarios.map(scenario => (
          <TouchableOpacity
            key={scenario.id}
            style={[styles.scenarioCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedScenario(scenario)}
            activeOpacity={0.7}
          >
            <View style={[styles.scenarioIcon, { backgroundColor: theme.warning + '20' }]}>
              <Ionicons name={scenario.icon as any} size={28} color={theme.warning} />
            </View>
            <View style={styles.scenarioInfo}>
              <Text style={[styles.scenarioTitle, { color: theme.text }]}>{scenario.title}</Text>
              <Text style={[styles.scenarioDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                {scenario.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        ))}

        {/* Quick Contacts */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Numéros d'urgence</Text>
        <View style={[styles.quickContacts, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
          <TouchableOpacity style={styles.quickContact} onPress={() => handleCall('17')}>
            <View style={[styles.quickContactIcon, { backgroundColor: theme.danger + '20' }]}>
              <Ionicons name="call" size={24} color={theme.danger} />
            </View>
            <Text style={[styles.quickContactNumber, { color: theme.text }]}>17</Text>
            <Text style={[styles.quickContactLabel, { color: theme.textSecondary }]}>Police</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickContact} onPress={() => handleCall('112')}>
            <View style={[styles.quickContactIcon, { backgroundColor: theme.warning + '20' }]}>
              <Ionicons name="call" size={24} color={theme.warning} />
            </View>
            <Text style={[styles.quickContactNumber, { color: theme.text }]}>112</Text>
            <Text style={[styles.quickContactLabel, { color: theme.textSecondary }]}>Urgences EU</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickContact} onPress={() => handleCall('0805805817')}>
            <View style={[styles.quickContactIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="information-circle" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.quickContactNumber, { color: theme.text }]}>0 805</Text>
            <Text style={[styles.quickContactLabel, { color: theme.textSecondary }]}>Info Escroqueries</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Scenario Detail Modal */}
      <Modal visible={!!selectedScenario && !selectedTemplate} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedScenario(null)}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                {selectedScenario?.title}
              </Text>
              <TouchableOpacity onPress={() => selectedScenario && handleShare(selectedScenario)}>
                <Ionicons name="share-outline" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {selectedScenario && (
              <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: 16 }}>
                {/* Immediate Actions */}
                <View style={[styles.urgentSection, { backgroundColor: theme.danger + '10', borderColor: theme.danger + '40' }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="flash" size={22} color={theme.danger} />
                    <Text style={[styles.sectionTitleModal, { color: theme.text }]}>Actions immédiates</Text>
                  </View>
                  {selectedScenario.immediateActions.map((action, i) => (
                    <View key={i} style={styles.actionItem}>
                      <View style={[styles.actionNumber, { backgroundColor: theme.danger }]}>
                        <Text style={styles.actionNumberText}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.actionText, { color: theme.textSecondary }]}>{action}</Text>
                    </View>
                  ))}
                </View>

                {/* Contacts */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="call" size={20} color={theme.primary} />
                    <Text style={[styles.sectionTitleModal, { color: theme.text }]}>Qui contacter</Text>
                  </View>
                  {selectedScenario.contacts.map((contact, i) => (
                    <View key={i} style={[styles.contactCard, { borderColor: theme.border }]}>
                      <View style={[styles.contactIcon, { backgroundColor: theme.primary + '20' }]}>
                        <Ionicons name={contact.icon as any} size={20} color={theme.primary} />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={[styles.contactName, { color: theme.text }]}>{contact.name}</Text>
                        <Text style={[styles.contactDesc, { color: theme.textSecondary }]}>{contact.description}</Text>
                      </View>
                      <View style={styles.contactActions}>
                        {contact.phone && (
                          <TouchableOpacity
                            style={[styles.contactButton, { backgroundColor: theme.success }]}
                            onPress={() => handleCall(contact.phone!)}
                          >
                            <Ionicons name="call" size={16} color="#fff" />
                          </TouchableOpacity>
                        )}
                        {contact.website && (
                          <TouchableOpacity
                            style={[styles.contactButton, { backgroundColor: theme.primary }]}
                            onPress={() => handleWebsite(contact.website!)}
                          >
                            <Ionicons name="open-outline" size={16} color="#fff" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Evidence */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="document-text" size={20} color={theme.warning} />
                    <Text style={[styles.sectionTitleModal, { color: theme.text }]}>Conserver les preuves</Text>
                  </View>
                  {selectedScenario.evidence.map((item, i) => (
                    <View key={i} style={styles.checkItem}>
                      <Ionicons name="checkbox-outline" size={18} color={theme.warning} />
                      <Text style={[styles.checkText, { color: theme.textSecondary }]}>{item}</Text>
                    </View>
                  ))}
                </View>

                {/* Report Links */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="flag" size={20} color={theme.accent} />
                    <Text style={[styles.sectionTitleModal, { color: theme.text }]}>Signaler / Déclarer</Text>
                  </View>
                  {selectedScenario.reportLinks.map((link, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.reportLink, { borderColor: theme.border }]}
                      onPress={() => handleWebsite(link.url)}
                    >
                      <View>
                        <Text style={[styles.reportLinkName, { color: theme.text }]}>{link.name}</Text>
                        <Text style={[styles.reportLinkDesc, { color: theme.textSecondary }]}>{link.description}</Text>
                      </View>
                      <Ionicons name="open-outline" size={18} color={theme.primary} />
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Templates */}
                {selectedScenario.templates && selectedScenario.templates.length > 0 && (
                  <View style={[styles.section, { backgroundColor: theme.surface }]}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="create" size={20} color={theme.primary} />
                      <Text style={[styles.sectionTitleModal, { color: theme.text }]}>Modèles</Text>
                    </View>
                    {selectedScenario.templates.map((template, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[styles.templateCard, { borderColor: theme.border }]}
                        onPress={() => setSelectedTemplate(template)}
                      >
                        <Ionicons 
                          name={template.type === 'email' ? 'mail-outline' : template.type === 'complaint' ? 'document-outline' : 'list-outline'} 
                          size={20} 
                          color={theme.primary} 
                        />
                        <Text style={[styles.templateTitle, { color: theme.text }]}>{template.title}</Text>
                        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <View style={{ height: 100 }} />
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Template Modal */}
      <Modal visible={!!selectedTemplate} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedTemplate?.title}</Text>
              <TouchableOpacity onPress={() => selectedTemplate && copyToClipboard(selectedTemplate.content)}>
                <Ionicons name="copy-outline" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            {selectedTemplate && (
              <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: 16 }}>
                <View style={[styles.templateContent, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.templateText, { color: theme.textSecondary }]}>
                    {selectedTemplate.content}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.copyButton, { backgroundColor: theme.primary }]}
                  onPress={() => copyToClipboard(selectedTemplate.content)}
                >
                  <Ionicons name="copy" size={20} color="#fff" />
                  <Text style={styles.copyButtonText}>Copier le texte</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  emergencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  emergencyNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  introCard: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  introContent: {
    flex: 1,
    marginLeft: 12,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  introText: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  scenarioIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scenarioDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  quickContacts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickContact: {
    alignItems: 'center',
  },
  quickContactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickContactNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  quickContactLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  modalContent: {
    flex: 1,
  },
  urgentSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitleModal: {
    fontSize: 17,
    fontWeight: '600',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '600',
  },
  contactDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
  },
  reportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  reportLinkName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reportLinkDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  templateTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  templateContent: {
    borderRadius: 16,
    padding: 16,
  },
  templateText: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 16,
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
