import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { News, Severity, ThreatLevel } from '../types';
import { Theme } from '../theme/colors';

interface NewsCardProps {
  news: News;
  theme: Theme;
  isFavorite: boolean;
  isReadLater: boolean;
  onPress: () => void;
  onFavorite: () => void;
  onReadLater: () => void;
}

const getSeverityColor = (severity: Severity, theme: Theme): string => {
  switch (severity) {
    case 'critique': return theme.severityCritical;
    case 'eleve': return theme.severityHigh;
    case 'moyen': return theme.severityMedium;
    case 'faible': return theme.severityLow;
    default: return theme.secondary;
  }
};

const getLevelColor = (level: ThreatLevel, theme: Theme): string => {
  switch (level) {
    case 'debutant': return theme.levelBeginner;
    case 'intermediaire': return theme.levelIntermediate;
    case 'avance': return theme.levelAdvanced;
    default: return theme.secondary;
  }
};

const getSeverityLabel = (severity: Severity): string => {
  switch (severity) {
    case 'critique': return 'Critique';
    case 'eleve': return 'Élevé';
    case 'moyen': return 'Moyen';
    case 'faible': return 'Faible';
    default: return severity;
  }
};

const getLevelLabel = (level: ThreatLevel): string => {
  switch (level) {
    case 'debutant': return 'Débutant';
    case 'intermediaire': return 'Intermédiaire';
    case 'avance': return 'Avancé';
    default: return level;
  }
};

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  theme,
  isFavorite,
  isReadLater,
  onPress,
  onFavorite,
  onReadLater,
}) => {
  const severityColor = getSeverityColor(news.severity, theme);
  const levelColor = getLevelColor(news.level, theme);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.sourceContainer}>
          <View style={[styles.sourceIcon, { backgroundColor: theme.primary + '20' }]}>
            <Ionicons name="shield-checkmark" size={14} color={theme.primary} />
          </View>
          <Text style={[styles.source, { color: theme.textSecondary }]}>{news.source}</Text>
          <Text style={[styles.date, { color: theme.textMuted }]}>{news.date}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={onReadLater} style={styles.actionButton}>
            <Ionicons
              name={isReadLater ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isReadLater ? theme.primary : theme.textMuted}
            />
          </Pressable>
          <Pressable onPress={onFavorite} style={styles.actionButton}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? theme.danger : theme.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {/* Tags */}
      <View style={styles.tags}>
        <View style={[styles.tag, { backgroundColor: severityColor + '20' }]}>
          <Ionicons name="alert-circle" size={12} color={severityColor} />
          <Text style={[styles.tagText, { color: severityColor }]}>{getSeverityLabel(news.severity)}</Text>
        </View>
        <View style={[styles.tag, { backgroundColor: levelColor + '20' }]}>
          <Ionicons name="school" size={12} color={levelColor} />
          <Text style={[styles.tagText, { color: levelColor }]}>{getLevelLabel(news.level)}</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
        {news.title}
      </Text>

      {/* TL;DR */}
      <View style={styles.tldr}>
        {news.tldr.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.tldrItem}>
            <Ionicons name="chevron-forward" size={14} color={theme.primary} />
            <Text style={[styles.tldrText, { color: theme.textSecondary }]} numberOfLines={1}>
              {item}
            </Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.impactContainer}>
          <Ionicons name="people" size={14} color={theme.textMuted} />
          <Text style={[styles.impact, { color: theme.textMuted }]} numberOfLines={1}>
            {news.impact}
          </Text>
        </View>
        <View style={styles.readMore}>
          <Text style={[styles.readMoreText, { color: theme.primary }]}>Voir plus</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  source: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 8,
  },
  date: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 12,
  },
  tldr: {
    marginBottom: 12,
  },
  tldrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tldrText: {
    fontSize: 14,
    marginLeft: 4,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.2)',
    paddingTop: 12,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  impact: {
    fontSize: 12,
    marginLeft: 6,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
