import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../src/store/appStore';
import { getTheme } from '../src/theme/colors';

export default function TabLayout() {
  const { isDarkMode, loadState } = useAppStore();
  const theme = getTheme(isDarkMode);

  useEffect(() => {
    loadState();
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Actus',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="newspaper-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attacks"
        options={{
          title: 'Attaques',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bug-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="protect"
        options={{
          title: 'Se protéger',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-checkmark-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'Urgence',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="toolbox"
        options={{
          title: 'Outils',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
