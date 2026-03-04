import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/colors';

interface NewsHeaderProps {
  theme: Theme;
  total: number;
}

export const NewsHeader = memo(function NewsHeader({ theme, total }: NewsHeaderProps) {
  return (
    <View style={[styles.header, { borderBottomColor: theme.border }]}>
      <View>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cybersécurité</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {total} actualités disponibles
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
        <Ionicons name="shield-checkmark" size={18} color={theme.primary} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
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
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
