import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../contexts/ToastContext';
import ApiService from '../services/ApiService';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/designSystem';

const QuizReviewScreen = ({ navigation, route }) => {
  const { showSuccess, showError } = useToast();
  const { quizAttemptId } = route.params;
  
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuizReview();
  }, [quizAttemptId]);

  const loadQuizReview = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getQuizReview(quizAttemptId);
      if (response.success) {
        setReviewData(response.data);
      } else {
        showError(response.message || 'Failed to load quiz review');
      }
    } catch (error) {
      console.error('Error loading quiz review:', error);
      showError('Failed to load quiz review');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getQuizTypeColor = (quizType) => {
    switch (quizType) {
      case 'EASY':
        return ['#10B981', '#059669'];
      case 'MEDIUM':
        return ['#3B82F6', '#1D4ED8'];
      case 'HARD':
        return ['#EF4444', '#DC2626'];
      default:
        return ['#6366F1', '#8B5CF6'];
    }
  };

  const getQuizTypeIcon = (quizType) => {
    switch (quizType) {
      case 'EASY':
        return '🌟';
      case 'MEDIUM':
        return '⭐';
      case 'HARD':
        return '🔥';
      default:
        return '🧠';
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRetakeQuiz = () => {
    navigation.navigate('QuizModeSelection', { hskLevel: reviewData?.quizAttempt?.hskLevel });
  };

  const renderQuizSummary = () => {
    if (!reviewData?.quizAttempt) return null;
    
    const { quizAttempt } = reviewData;
    const percentage = Math.round((quizAttempt.score / quizAttempt.totalQuestions) * 100);
    
    return (
      <View style={styles.summaryCard}>
        <LinearGradient
          colors={getQuizTypeColor(quizAttempt.quizType)}
          style={styles.summaryGradient}
        >
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryIcon}>{getQuizTypeIcon(quizAttempt.quizType)}</Text>
            <View style={styles.summaryTitleContainer}>
              <Text style={styles.summaryTitle}>{quizAttempt.quizType} Mode Quiz</Text>
              <Text style={styles.summarySubtitle}>HSK Level {quizAttempt.hskLevel}</Text>
            </View>
          </View>
          
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{quizAttempt.score}/{quizAttempt.totalQuestions}</Text>
              <Text style={styles.summaryStatLabel}>Score</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{percentage}%</Text>
              <Text style={styles.summaryStatLabel}>Accuracy</Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatValue}>{formatDate(quizAttempt.dateAttempted)}</Text>
              <Text style={styles.summaryStatLabel}>Date</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderReviewItem = (item, index) => (
    <View key={index} style={styles.reviewItem}>
      <View style={styles.reviewItemHeader}>
        <Text style={styles.questionNumber}>Question {index + 1}</Text>
        <View style={[
          styles.correctnessBadge,
          item.isCorrect ? styles.correctBadge : styles.incorrectBadge
        ]}>
          <Ionicons
            name={item.isCorrect ? "checkmark" : "close"}
            size={16}
            color="white"
          />
          <Text style={styles.correctnessText}>
            {item.isCorrect ? "Correct" : "Incorrect"}
          </Text>
        </View>
      </View>

      <View style={styles.questionContent}>
        <Text style={styles.chineseCharacter}>{item.chineseCharacter}</Text>
        <Text style={styles.pinyin}>{item.pinyin}</Text>
        <Text style={styles.englishMeaning}>{item.englishMeaning}</Text>
      </View>

      <View style={styles.answerSection}>
        <View style={styles.answerRow}>
          <Text style={styles.answerLabel}>Your Answer:</Text>
          <Text style={[
            styles.answerValue,
            item.isCorrect ? styles.correctAnswer : styles.incorrectAnswer
          ]}>
            {item.userAnswer || "No answer"}
          </Text>
        </View>
        
        {!item.isCorrect && (
          <View style={styles.answerRow}>
            <Text style={styles.answerLabel}>Correct Answer:</Text>
            <Text style={styles.correctAnswerValue}>{item.correctAnswer}</Text>
          </View>
        )}
      </View>

      <View style={styles.explanationSection}>
        <Text style={styles.explanationText}>{item.explanation}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#F9FAFB', '#E5E7EB']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading quiz review...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (!reviewData) {
    return (
      <LinearGradient colors={['#F9FAFB', '#E5E7EB']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Review Not Found</Text>
          <Text style={styles.errorText}>
            The quiz review you're looking for could not be found.
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F9FAFB', '#E5E7EB']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Review</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Quiz Summary */}
        {renderQuizSummary()}

        {/* Review Items */}
        <View style={styles.reviewContainer}>
          <Text style={styles.reviewTitle}>Question Review</Text>
          {reviewData.reviewItems?.map(renderReviewItem)}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRetakeQuiz}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.actionButtonText}>Retake Quiz</Text>
            </LinearGradient>
          </TouchableOpacity>
          
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  summaryGradient: {
    padding: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  summaryIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  summaryTitleContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  summarySubtitle: {
    fontSize: typography.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStatItem: {
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  summaryStatLabel: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  reviewContainer: {
    paddingHorizontal: spacing.lg,
  },
  reviewTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  reviewItem: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  reviewItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  questionNumber: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  correctnessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  correctBadge: {
    backgroundColor: '#10B981',
  },
  incorrectBadge: {
    backgroundColor: '#EF4444',
  },
  correctnessText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: 'white',
  },
  questionContent: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
  },
  chineseCharacter: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  pinyin: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  englishMeaning: {
    fontSize: typography.base,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  answerSection: {
    marginBottom: spacing.md,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  answerLabel: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  answerValue: {
    fontSize: typography.base,
    fontWeight: typography.medium,
  },
  correctAnswer: {
    color: '#10B981',
  },
  incorrectAnswer: {
    color: '#EF4444',
  },
  correctAnswerValue: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: '#10B981',
  },
  explanationSection: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  explanationText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  backButtonText: {
    fontSize: typography.base,
    color: colors.primary,
    fontWeight: typography.bold,
  },
});

export default QuizReviewScreen;
