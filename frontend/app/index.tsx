import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  TextInput,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/appStore';
import { getTheme } from '../src/theme/colors';
import { NewsCard } from '../src/components/NewsCard';
import { mockNews } from '../src/data/mockNews';
import { News, Severity, ThreatLevel, ThreatType } from '../src/types';

export default function ActusScreen() {
  const { isDarkMode, favorites, readLater, addFavorite, removeFavorite, addReadLater, removeReadLater } = useAppStore();
  const theme = getTheme(isDarkMode);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ThreatLevel | null>(null);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredNews = useMemo(() => {
    return mockNews.filter(news => {
      const matchesSearch = searchQuery === '' || 
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.tldr.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesSeverity = !selectedSeverity || news.severity === selectedSeverity;
      const matchesLevel = !selectedLevel || news.level === selectedLevel;
      return matchesSearch && matchesSeverity && matchesLevel;
    });
  }, [searchQuery, selectedSeverity, selectedLevel]);

  const threatIndex = useMemo(() => {
    const criticalCount = mockNews.filter(n => n.severity === 'critique').length;
    const highCount = mockNews.filter(n => n.severity === 'eleve').length;
    if (criticalCount > 0) return { level: 'Élevé', color: theme.severityCritical, reason: `${criticalCount} menace(s) critique(s)` };
    if (highCount > 2) return { level: 'Moyen', color: theme.severityHigh, reason: `${highCount} menaces élevées` };
    return { level: 'Faible', color: theme.severityLow, reason: 'Activité normale' };
  }, []);

  const clearFilters = () => {
    setSelectedSeverity(null);
    setSelectedLevel(null);
    setSearchQuery('');
  };

  const hasFilters = selectedSeverity || selectedLevel || searchQuery;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Cybersécurité</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Restez informé et protégé</Text>
        </View>
        <View style={[styles.threatBadge, { backgroundColor: threatIndex.color + '20' }]}>
          <Ionicons name="pulse" size={16} color={threatIndex.color} />
          <Text style={[styles.threatText, { color: threatIndex.color }]}>{threatIndex.level}</Text>
        </View>
      </View>

      {/* Search & Filters */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Rechercher..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: hasFilters ? theme.primary : theme.surface, borderColor: theme.border }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="options" size={20} color={hasFilters ? '#fff' : theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {hasFilters && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
            {selectedSeverity && (
              <TouchableOpacity
                style={[styles.filterChip, { backgroundColor: theme.primary + '20' }]}
                onPress={() => setSelectedSeverity(null)}
              >
                <Text style={[styles.filterChipText, { color: theme.primary }]}>Gravité: {selectedSeverity}</Text>
                <Ionicons name="close" size={14} color={theme.primary} />
              </TouchableOpacity>
            )}
            {selectedLevel && (
              <TouchableOpacity
                style={[styles.filterChip, { backgroundColor: theme.primary + '20' }]}
                onPress={() => setSelectedLevel(null)}
              >
                <Text style={[styles.filterChipText, { color: theme.primary }]}>Niveau: {selectedLevel}</Text>
                <Ionicons name="close" size={14} color={theme.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: theme.danger + '20' }]}
              onPress={clearFilters}
            >
              <Text style={[styles.filterChipText, { color: theme.danger }]}>Effacer tout</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* News Feed */}
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Résumé du jour */}
        <View style={[styles.dailySummary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="today" size={20} color={theme.primary} />
            <Text style={[styles.summaryTitle, { color: theme.text }]}>Résumé du jour</Text>
          </View>
          <Text style={[styles.summaryText, { color: theme.textSecondary }]}>
            {mockNews.length} actualités • {mockNews.filter(n => n.severity === 'critique' || n.severity === 'eleve').length} prioritaires
          </Text>
        </View>

        {filteredNews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>Aucun résultat</Text>
          </View>
        ) : (
          filteredNews.map(news => (
            <NewsCard
              key={news.id}
              news={news}
              theme={theme}
              isFavorite={favorites.includes(news.id)}
              isReadLater={readLater.includes(news.id)}
              onPress={() => setSelectedNews(news)}
              onFavorite={() => favorites.includes(news.id) ? removeFavorite(news.id) : addFavorite(news.id)}
              onReadLater={() => readLater.includes(news.id) ? removeReadLater(news.id) : addReadLater(news.id)}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Filtres</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.filterLabel, { color: theme.textSecondary }]}>Gravité</Text>
            <View style={styles.filterOptions}>
              {(['critique', 'eleve', 'moyen', 'faible'] as Severity[]).map(severity => (
                <TouchableOpacity
                  key={severity}
                  style={[
                    styles.filterOption,
                    { borderColor: selectedSeverity === severity ? theme.primary : theme.border },
                    selectedSeverity === severity && { backgroundColor: theme.primary + '20' }
                  ]}
                  onPress={() => setSelectedSeverity(selectedSeverity === severity ? null : severity)}
                >
                  <Text style={{ color: selectedSeverity === severity ? theme.primary : theme.text }}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterLabel, { color: theme.textSecondary, marginTop: 16 }]}>Niveau</Text>
            <View style={styles.filterOptions}>
              {(['debutant', 'intermediaire', 'avance'] as ThreatLevel[]).map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterOption,
                    { borderColor: selectedLevel === level ? theme.primary : theme.border },
                    selectedLevel === level && { backgroundColor: theme.primary + '20' }
                  ]}
                  onPress={() => setSelectedLevel(selectedLevel === level ? null : level)}
                >
                  <Text style={{ color: selectedLevel === level ? theme.primary : theme.text }}>
                    {level === 'debutant' ? 'Débutant' : level === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: theme.primary }]}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Appliquer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* News Detail Modal */}
      <Modal visible={!!selectedNews} animationType="slide" transparent>
        <View style={[styles.detailModalOverlay, { backgroundColor: theme.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.detailHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedNews(null)}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.detailTitle, { color: theme.text }]}>Détails</Text>
              <View style={{ width: 24 }} />
            </View>
            {selectedNews && (
              <ScrollView style={styles.detailContent} contentContainerStyle={{ padding: 16 }}>
                <Text style={[styles.newsDetailTitle, { color: theme.text }]}>{selectedNews.title}</Text>
                
                <View style={styles.detailMeta}>
                  <Text style={[styles.detailSource, { color: theme.textSecondary }]}>
                    {selectedNews.source} • {selectedNews.date}
                  </Text>
                </View>

                <View style={[styles.detailSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="flash" size={20} color={theme.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>TL;DR</Text>
                  </View>
                  {selectedNews.tldr.map((item, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Ionicons name="chevron-forward" size={16} color={theme.primary} />
                      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{item}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.detailSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="people" size={20} color={theme.warning} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Impact</Text>
                  </View>
                  <Text style={[styles.impactText, { color: theme.textSecondary }]}>{selectedNews.impact}</Text>
                </View>

                <View style={[styles.detailSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Que faire maintenant</Text>
                  </View>
                  {selectedNews.actions.map((action, i) => (
                    <View key={i} style={styles.actionItem}>
                      <View style={[styles.actionNumber, { backgroundColor: theme.success + '20' }]}>
                        <Text style={[styles.actionNumberText, { color: theme.success }]}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.actionText, { color: theme.textSecondary }]}>{action}</Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.detailSection, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="information-circle" size={20} color={theme.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>En savoir plus</Text>
                  </View>
                  <Text style={[styles.detailText, { color: theme.textSecondary }]}>{selectedNews.details}</Text>
                </View>

                <View style={{ height: 100 }} />
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
  threatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  threatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBox: {
    flex: 1,
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
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilters: {
    paddingBottom: 8,
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  feed: {
    flex: 1,
  },
  feedContent: {
    paddingTop: 8,
  },
  dailySummary: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryText: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  applyButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  detailModalOverlay: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  detailContent: {
    flex: 1,
  },
  newsDetailTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 12,
  },
  detailMeta: {
    marginBottom: 20,
  },
  detailSource: {
    fontSize: 14,
  },
  detailSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    marginLeft: 8,
  },
  impactText: {
    fontSize: 15,
    lineHeight: 22,
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
    fontSize: 13,
    fontWeight: '700',
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  detailText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
