import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/colors';
import { TensionResponse } from '../../services/newsService';

interface TensionBannerProps {
  tension: TensionResponse | null;
  loading: boolean;
  theme: Theme;
  onPress?: () => void;
}

export const TensionBanner = memo(function TensionBanner({
  tension,
  loading,
  theme,
  onPress,
}: TensionBannerProps) {
  const getTensionColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'critique':
        return theme.severityCritical;
      case 'élevé':
        return theme.severityHigh;
      case 'modéré':
        return theme.severityMedium;
      default:
        return theme.severityLow;
    }
  };
  
  if (loading && !tension) {
    return (
      <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ActivityIndicator size="small" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Analyse de la menace...
        </Text>
      </View>
    );
  }
  
  if (!tension) return null;
  
  const color = getTensionColor(tension.level);
  
  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: color + '15', borderColor: color + '40' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.levelContainer}>
          <Ionicons name="pulse" size={20} color={color} />
          <Text style={[styles.levelText, { color }]}>
            Niveau de menace : {tension.level}
          </Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: color }]}>
          <Text style={styles.scoreText}>{tension.score}</Text>
        </View>
      </View>
      
      <Text style={[styles.reason, { color: theme.textSecondary }]}>
        {tension.reason}
      </Text>
      
      <View style={styles.stats}>
        {tension.critical_count > 0 && (
          <View style={[styles.stat, { backgroundColor: theme.severityCritical + '20' }]}>
            <Ionicons name="alert-circle" size={14} color={theme.severityCritical} />
            <Text style={[styles.statText, { color: theme.severityCritical }]}>
              {tension.critical_count} critique{tension.critical_count > 1 ? 's' : ''}
            </Text>
          </View>
        )}
        {tension.high_count > 0 && (
          <View style={[styles.stat, { backgroundColor: theme.severityHigh + '20' }]}>
            <Ionicons name="warning" size={14} color={theme.severityHigh} />
            <Text style={[styles.statText, { color: theme.severityHigh }]}>
              {tension.high_count} élevée{tension.high_count > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  reason: {
    fontSize: 14,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
});
