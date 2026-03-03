import React, { useState, useMemo } from 'react';
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
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/appStore';
import { getTheme } from '../src/theme/colors';
import { mockTools, toolCategories, glossary } from '../src/data/mockTools';
import { Tool, GlossaryItem } from '../src/types';

export default function ToolboxScreen() {
  const { isDarkMode, toggleDarkMode, isProMode, toggleProMode, notificationsEnabled, toggleNotifications } = useAppStore();
  const theme = getTheme(isDarkMode);
  const [activeTab, setActiveTab] = useState<'tools' | 'glossary' | 'settings'>('tools');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [selectedGlossaryItem, setSelectedGlossaryItem] = useState<GlossaryItem | null>(null);

  const filteredTools = useMemo(() => {
    if (!selectedCategory) return mockTools;
    return mockTools.filter(t => t.category === selectedCategory);
  }, [selectedCategory]);

  const filteredGlossary = useMemo(() => {
    if (!glossarySearch) return glossary;
    return glossary.filter(
      g => g.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
           g.definition.toLowerCase().includes(glossarySearch.toLowerCase())
    );
  }, [glossarySearch]);

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debutant': return theme.levelBeginner;
      case 'intermediaire': return theme.levelIntermediate;
      case 'avance': return theme.levelAdvanced;
      default: return theme.secondary;
    }
  };

  const tabs = [
    { id: 'tools', label: 'Outils', icon: 'construct-outline' },
    { id: 'glossary', label: 'Glossaire', icon: 'book-outline' },
    { id: 'settings', label: 'Paramètres', icon: 'settings-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Boîte à outils</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Ressources et paramètres</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? theme.primary : theme.textMuted}
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.id ? theme.primary : theme.textMuted }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <>
          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  { backgroundColor: !selectedCategory ? theme.primary : theme.surface, borderColor: theme.border }
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.categoryText, { color: !selectedCategory ? '#fff' : theme.text }]}>Tous</Text>
              </TouchableOpacity>
              {toolCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: selectedCategory === cat.name ? theme.primary : theme.surface, borderColor: theme.border }
                  ]}
                  onPress={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={14}
                    color={selectedCategory === cat.name ? '#fff' : theme.text}
                  />
                  <Text style={[styles.categoryText, { color: selectedCategory === cat.name ? '#fff' : theme.text }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
            {filteredTools.map(tool => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.toolCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                onPress={() => setSelectedTool(tool)}
                activeOpacity={0.7}
              >
                <View style={[styles.toolIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name={tool.icon as any} size={24} color={theme.primary} />
                </View>
                <View style={styles.toolInfo}>
                  <View style={styles.toolHeader}>
                    <Text style={[styles.toolName, { color: theme.text }]}>{tool.name}</Text>
                    {tool.isFree && (
                      <View style={[styles.freeBadge, { backgroundColor: theme.success + '20' }]}>
                        <Text style={[styles.freeText, { color: theme.success }]}>Gratuit</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.toolDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                    {tool.description}
                  </Text>
                  <View style={styles.toolMeta}>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(tool.level) + '20' }]}>
                      <Text style={[styles.levelText, { color: getLevelColor(tool.level) }]}>
                        {tool.level === 'debutant' ? 'Débutant' : tool.level === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}
                      </Text>
                    </View>
                    <Text style={[styles.toolOs, { color: theme.textMuted }]}>
                      {tool.os.length === 5 ? 'Toutes plateformes' : tool.os.map(o => o.toUpperCase()).join(', ')}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        </>
      )}

      {/* Glossary Tab */}
      {activeTab === 'glossary' && (
        <>
          <View style={styles.searchContainer}>
            <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="search" size={20} color={theme.textMuted} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Rechercher un terme..."
                placeholderTextColor={theme.textMuted}
                value={glossarySearch}
                onChangeText={setGlossarySearch}
              />
              {glossarySearch ? (
                <TouchableOpacity onPress={() => setGlossarySearch('')}>
                  <Ionicons name="close-circle" size={20} color={theme.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
            {filteredGlossary.map((item, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.glossaryCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
                onPress={() => setSelectedGlossaryItem(item)}
              >
                <View style={styles.glossaryHeader}>
                  <Text style={[styles.glossaryTerm, { color: theme.text }]}>{item.term}</Text>
                  <View style={[styles.glossaryCategory, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.glossaryCategoryText, { color: theme.primary }]}>{item.category}</Text>
                  </View>
                </View>
                <Text style={[styles.glossaryDef, { color: theme.textSecondary }]} numberOfLines={2}>
                  {item.definition}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={{ height: 100 }} />
          </ScrollView>
        </>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} showsVerticalScrollIndicator={false}>
          {/* Appearance */}
          <Text style={[styles.settingsSection, { color: theme.text }]}>Apparence</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon" size={22} color={theme.primary} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Mode sombre</Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Mode */}
          <Text style={[styles.settingsSection, { color: theme.text }]}>Mode d'utilisation</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="briefcase" size={22} color={theme.warning} />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Mode Pro</Text>
                  <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Contenu technique avancé</Text>
                </View>
              </View>
              <Switch
                value={isProMode}
                onValueChange={toggleProMode}
                trackColor={{ false: theme.border, true: theme.warning }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Notifications */}
          <Text style={[styles.settingsSection, { color: theme.text }]}>Notifications</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications" size={22} color={theme.accent} />
                <View>
                  <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
                  <Text style={[styles.settingDesc, { color: theme.textMuted }]}>Alertes et résumés</Text>
                </View>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* About */}
          <Text style={[styles.settingsSection, { color: theme.text }]}>À propos</Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="document-text" size={22} color={theme.textMuted} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Mentions légales</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>
            <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="shield" size={22} color={theme.textMuted} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Confidentialité</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
            </TouchableOpacity>
            <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="information-circle" size={22} color={theme.textMuted} />
                <Text style={[styles.settingLabel, { color: theme.text }]}>Version 1.0.0</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Tool Detail Modal */}
      <Modal visible={!!selectedTool} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedTool(null)}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedTool?.name}</Text>
              <View style={{ width: 24 }} />
            </View>
            {selectedTool && (
              <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: 16 }}>
                <View style={[styles.toolDetailIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name={selectedTool.icon as any} size={48} color={theme.primary} />
                </View>
                <Text style={[styles.toolDetailName, { color: theme.text }]}>{selectedTool.name}</Text>
                
                <View style={styles.toolDetailBadges}>
                  {selectedTool.isFree && (
                    <View style={[styles.detailBadge, { backgroundColor: theme.success + '20' }]}>
                      <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                      <Text style={[styles.detailBadgeText, { color: theme.success }]}>Gratuit</Text>
                    </View>
                  )}
                  <View style={[styles.detailBadge, { backgroundColor: getLevelColor(selectedTool.level) + '20' }]}>
                    <Ionicons name="school" size={14} color={getLevelColor(selectedTool.level)} />
                    <Text style={[styles.detailBadgeText, { color: getLevelColor(selectedTool.level) }]}>
                      {selectedTool.level === 'debutant' ? 'Débutant' : selectedTool.level === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.toolDetailDesc, { color: theme.textSecondary }]}>
                  {selectedTool.description}
                </Text>

                <View style={[styles.platformSection, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.platformTitle, { color: theme.text }]}>Plateformes supportées</Text>
                  <View style={styles.platforms}>
                    {selectedTool.os.includes('ios') && (
                      <View style={[styles.platformBadge, { backgroundColor: theme.primary + '20' }]}>
                        <Ionicons name="logo-apple" size={16} color={theme.primary} />
                        <Text style={[styles.platformText, { color: theme.primary }]}>iOS</Text>
                      </View>
                    )}
                    {selectedTool.os.includes('android') && (
                      <View style={[styles.platformBadge, { backgroundColor: theme.success + '20' }]}>
                        <Ionicons name="logo-android" size={16} color={theme.success} />
                        <Text style={[styles.platformText, { color: theme.success }]}>Android</Text>
                      </View>
                    )}
                    {selectedTool.os.includes('windows') && (
                      <View style={[styles.platformBadge, { backgroundColor: theme.primary + '20' }]}>
                        <Ionicons name="logo-windows" size={16} color={theme.primary} />
                        <Text style={[styles.platformText, { color: theme.primary }]}>Windows</Text>
                      </View>
                    )}
                    {selectedTool.os.includes('mac') && (
                      <View style={[styles.platformBadge, { backgroundColor: theme.textMuted + '40' }]}>
                        <Ionicons name="laptop" size={16} color={theme.textMuted} />
                        <Text style={[styles.platformText, { color: theme.textMuted }]}>Mac</Text>
                      </View>
                    )}
                    {selectedTool.os.includes('linux') && (
                      <View style={[styles.platformBadge, { backgroundColor: theme.warning + '20' }]}>
                        <Ionicons name="terminal" size={16} color={theme.warning} />
                        <Text style={[styles.platformText, { color: theme.warning }]}>Linux</Text>
                      </View>
                    )}
                  </View>
                </View>

                {selectedTool.link && (
                  <TouchableOpacity
                    style={[styles.openLinkButton, { backgroundColor: theme.primary }]}
                    onPress={() => handleOpenLink(selectedTool.link!)}
                  >
                    <Ionicons name="open-outline" size={20} color="#fff" />
                    <Text style={styles.openLinkText}>Visiter le site</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>

      {/* Glossary Detail Modal */}
      <Modal visible={!!selectedGlossaryItem} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedGlossaryItem(null)}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedGlossaryItem?.term}</Text>
              <View style={{ width: 24 }} />
            </View>
            {selectedGlossaryItem && (
              <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: 16 }}>
                <View style={[styles.glossaryDetailCategory, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.glossaryDetailCategoryText, { color: theme.primary }]}>
                    {selectedGlossaryItem.category}
                  </Text>
                </View>
                <Text style={[styles.glossaryDetailTerm, { color: theme.text }]}>
                  {selectedGlossaryItem.term}
                </Text>
                <Text style={[styles.glossaryDetailDef, { color: theme.textSecondary }]}>
                  {selectedGlossaryItem.definition}
                </Text>
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
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoriesContainer: {
    paddingVertical: 12,
  },
  categories: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolInfo: {
    flex: 1,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
  },
  freeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  toolDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  toolMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  toolOs: {
    fontSize: 11,
  },
  glossaryCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  glossaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  glossaryTerm: {
    fontSize: 16,
    fontWeight: '600',
  },
  glossaryCategory: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  glossaryCategoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  glossaryDef: {
    fontSize: 14,
    lineHeight: 20,
  },
  settingsSection: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  settingDivider: {
    height: 1,
    marginLeft: 50,
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
  toolDetailIcon: {
    width: 100,
    height: 100,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  toolDetailName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  toolDetailBadges: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  detailBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  toolDetailDesc: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  platformSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  platformTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  platforms: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  platformText: {
    fontSize: 13,
    fontWeight: '600',
  },
  openLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  openLinkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  glossaryDetailCategory: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  glossaryDetailCategoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  glossaryDetailTerm: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  glossaryDetailDef: {
    fontSize: 18,
    lineHeight: 28,
  },
});
