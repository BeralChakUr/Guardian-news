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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/appStore';
import { getTheme } from '../src/theme/colors';
import { mockAttacks, attackCategories } from '../src/data/mockAttacks';
import { Attack } from '../src/types';

export default function AttacksScreen() {
  const { isDarkMode } = useAppStore();
  const theme = getTheme(isDarkMode);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAttack, setSelectedAttack] = useState<Attack | null>(null);

  const filteredAttacks = useMemo(() => {
    if (!selectedCategory) return mockAttacks;
    return mockAttacks.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'debutant': return theme.levelBeginner;
      case 'intermediaire': return theme.levelIntermediate;
      case 'avance': return theme.levelAdvanced;
      default: return theme.secondary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Types d'attaques</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Comprendre pour mieux se protéger
        </Text>
      </View>

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
            <Ionicons name="grid" size={16} color={!selectedCategory ? '#fff' : theme.text} />
            <Text style={[styles.categoryText, { color: !selectedCategory ? '#fff' : theme.text }]}>Tout</Text>
          </TouchableOpacity>
          {attackCategories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                { backgroundColor: selectedCategory === cat.id ? theme.primary : theme.surface, borderColor: theme.border }
              ]}
              onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
            >
              <Ionicons 
                name={cat.icon as any} 
                size={16} 
                color={selectedCategory === cat.id ? '#fff' : theme.text} 
              />
              <Text style={[styles.categoryText, { color: selectedCategory === cat.id ? '#fff' : theme.text }]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Attacks List */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredAttacks.map(attack => (
          <TouchableOpacity
            key={attack.id}
            style={[styles.attackCard, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
            onPress={() => setSelectedAttack(attack)}
            activeOpacity={0.7}
          >
            <View style={[styles.attackIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name={attack.icon as any} size={24} color={theme.primary} />
            </View>
            <View style={styles.attackInfo}>
              <Text style={[styles.attackName, { color: theme.text }]}>{attack.name}</Text>
              <Text style={[styles.attackDef, { color: theme.textSecondary }]} numberOfLines={2}>
                {attack.definition}
              </Text>
              <View style={styles.attackMeta}>
                <View style={[styles.levelBadge, { backgroundColor: getLevelColor(attack.level) + '20' }]}>
                  <Text style={[styles.levelText, { color: getLevelColor(attack.level) }]}>
                    {attack.level === 'debutant' ? 'Débutant' : attack.level === 'intermediaire' ? 'Intermédiaire' : 'Avancé'}
                  </Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Attack Detail Modal */}
      <Modal visible={!!selectedAttack} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: theme.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => setSelectedAttack(null)}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]} numberOfLines={1}>
                {selectedAttack?.name}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedAttack && (
              <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: 16 }}>
                {/* Definition */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="book" size={20} color={theme.primary} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Définition</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                    {selectedAttack.definition}
                  </Text>
                </View>

                {/* Example */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="bulb" size={20} color={theme.warning} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Exemple concret</Text>
                  </View>
                  <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                    {selectedAttack.example}
                  </Text>
                </View>

                {/* Signs */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="eye" size={20} color={theme.accent} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Signes d'alerte</Text>
                  </View>
                  {selectedAttack.signs.map((sign, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Ionicons name="alert-circle" size={16} color={theme.warning} />
                      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{sign}</Text>
                    </View>
                  ))}
                </View>

                {/* Impacts */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="trending-down" size={20} color={theme.danger} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Impacts</Text>
                  </View>
                  {selectedAttack.impacts.map((impact, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Ionicons name="remove" size={16} color={theme.danger} />
                      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{impact}</Text>
                    </View>
                  ))}
                </View>

                {/* Prevention */}
                <View style={[styles.section, { backgroundColor: theme.surface }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="shield-checkmark" size={20} color={theme.success} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Prévention</Text>
                  </View>
                  {selectedAttack.prevention.map((item, i) => (
                    <View key={i} style={styles.checkItem}>
                      <View style={[styles.checkBox, { borderColor: theme.success }]}>
                        <Ionicons name="checkmark" size={14} color={theme.success} />
                      </View>
                      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{item}</Text>
                    </View>
                  ))}
                </View>

                {/* Victim Steps */}
                <View style={[styles.section, { backgroundColor: theme.danger + '10', borderColor: theme.danger + '30' }]}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="warning" size={20} color={theme.danger} />
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Si vous êtes victime</Text>
                  </View>
                  {selectedAttack.victimSteps.map((step, i) => (
                    <View key={i} style={styles.stepItem}>
                      <View style={[styles.stepNumber, { backgroundColor: theme.danger }]}>
                        <Text style={styles.stepNumberText}>{i + 1}</Text>
                      </View>
                      <Text style={[styles.bulletText, { color: theme.textSecondary }]}>{step}</Text>
                    </View>
                  ))}
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  attackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  attackIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  attackInfo: {
    flex: 1,
  },
  attackName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  attackDef: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  attackMeta: {
    flexDirection: 'row',
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
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
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
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 10,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
