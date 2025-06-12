import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/designSystem';

const QuizResult = ({ 
  result, 
  onRetakeQuiz, 
  onGoHome 
}) => {
  if (!result) {
    return null;
  }

  const getPerformanceIcon = (percentage) => {
    if (percentage >= 90) return 'star';
    if (percentage >= 80) return 'thumbs-up';
    if (percentage >= 70) return 'checkmark-circle';
    if (percentage >= 60) return 'alert-circle';
    return 'refresh';
  };

  const getPerformanceColor = (percentage) => {
    if (percentage >= 90) return ['#10B981', '#059669'];
    if (percentage >= 80) return ['#3B82F6', '#1D4ED8'];
    if (percentage >= 70) return ['#F59E0B', '#D97706'];
    if (percentage >= 60) return ['#EF4444', '#DC2626'];
    return ['#6B7280', '#4B5563'];
  };

  const performanceIcon = getPerformanceIcon(result.percentage);
  const performanceColors = getPerformanceColor(result.percentage);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={performanceColors}
        style={styles.resultCard}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name={performanceIcon} size={64} color="white" />
          <Text style={styles.title}>Quiz Complete!</Text>
          <Text style={styles.subtitle}>HSK {result.hskLevel} - {result.quizType} Mode</Text>
        </View>

        {/* Score Display */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreMain}>
            <Text style={styles.scoreValue}>{result.score}</Text>
            <Text style={styles.scoreDivider}>/</Text>
            <Text style={styles.scoreTotal}>{result.totalQuestions}</Text>
          </View>
          <Text style={styles.percentage}>{Math.round(result.percentage)}%</Text>
        </View>

        {/* Performance Message */}
        <Text style={styles.message}>{result.message}</Text>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onRetakeQuiz}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.actionButtonText}>Retake Quiz</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onGoHome}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="home" size={20} color="white" />
              <Text style={styles.actionButtonText}>Go Home</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  resultCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: 'white',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: typography.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: typography.medium,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  scoreMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: typography.bold,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scoreDivider: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: spacing.sm,
  },
  scoreTotal: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  percentage: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  message: {
    fontSize: typography.lg,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.xl,
    fontWeight: typography.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  actionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: 'white',
  },
});

export default QuizResult;
