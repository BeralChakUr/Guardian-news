import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { Theme } from '../../theme/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  theme: Theme;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  theme,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);
  
  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });
  
  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.border,
          opacity,
        },
        style,
      ]}
    />
  );
};

export const NewsCardSkeleton: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.cardBorder }]}>
      <View style={styles.header}>
        <SkeletonLoader width={100} height={16} theme={theme} />
        <SkeletonLoader width={80} height={16} theme={theme} />
      </View>
      <View style={styles.tags}>
        <SkeletonLoader width={70} height={24} borderRadius={12} theme={theme} />
        <SkeletonLoader width={90} height={24} borderRadius={12} theme={theme} />
      </View>
      <SkeletonLoader width="90%" height={22} theme={theme} style={{ marginBottom: 8 }} />
      <SkeletonLoader width="70%" height={22} theme={theme} style={{ marginBottom: 16 }} />
      <SkeletonLoader width="100%" height={16} theme={theme} style={{ marginBottom: 4 }} />
      <SkeletonLoader width="85%" height={16} theme={theme} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {},
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
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
});
