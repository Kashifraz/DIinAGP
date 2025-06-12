import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../styles/designSystem';

const QuizProgress = ({ 
  currentQuestion, 
  totalQuestions, 
  correctAnswers, 
  quizType, 
  hskLevel 
}) => {
  const progress = totalQuestions > 0 ? (currentQuestion - 1) / totalQuestions : 0;
  const progressPercentage = Math.round(progress * 100);
  
  // Calculate statistics
  const answeredQuestions = currentQuestion - 1; // Number of questions answered so far
  const incorrectAnswers = answeredQuestions - correctAnswers;
  const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

  const getProgressCardColors = (quizType) => {
    switch (quizType) {
      case 'EASY':
        return ['#10B981', '#059669']; // Green
      case 'MEDIUM':
        return ['#3B82F6', '#1D4ED8']; // Blue
      case 'HARD':
        return ['#EF4444', '#DC2626']; // Red
      default:
        return ['#6366F1', '#8B5CF6']; // Purple
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={getProgressCardColors(quizType)}
        style={styles.progressCard}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.quizTitle}>Quiz Progress</Text>
          <Text style={styles.quizInfo}>HSK {hskLevel} - {quizType} Mode</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercentage}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {currentQuestion} of {totalQuestions}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correctAnswers}</Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{incorrectAnswers}</Text>
            <Text style={styles.statLabel}>Incorrect</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{completionPercentage}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  progressCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...colors.shadows?.lg || {},
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  quizTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quizInfo: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: typography.medium,
  },
  progressSection: {
    marginBottom: spacing.lg,
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.sm,
    color: 'white',
    fontWeight: typography.medium,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
    fontWeight: typography.medium,
  },
});

export default QuizProgress;
