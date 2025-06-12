import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing } from '../styles/designSystem';

const LoadingScreen = () => {
  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.appTitle}>中文词汇</Text>
        <Text style={styles.appSubtitle}>Chinese Vocabulary</Text>
        <ActivityIndicator size="large" color={colors.white} style={styles.spinner} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: typography['4xl'],
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  appSubtitle: {
    fontSize: typography.lg,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing['2xl'],
  },
  spinner: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: typography.base,
    color: colors.white,
    fontWeight: typography.medium,
  },
});

export default LoadingScreen;
