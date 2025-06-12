import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/designSystem';

const QuizQuestion = ({ 
  question, 
  onAnswerSelect, 
  selectedAnswer, 
  loading = false,
  timeRemaining = null 
}) => {
  const [isAnswering, setIsAnswering] = useState(false);

  const handleAnswerSelect = async (answer) => {
    if (isAnswering || loading) return;
    
    setIsAnswering(true);
    try {
      await onAnswerSelect(answer);
    } finally {
      setIsAnswering(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionCardColors = (quizType) => {
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

  const renderQuestionContent = (question) => {
    switch (question.quizType) {
      case 'EASY':
        return (
          <>
            {/* Chinese Character */}
            <Text style={styles.chineseCharacter}>{question.chineseCharacter}</Text>
            {/* Pinyin */}
            <Text style={styles.pinyin}>{question.pinyin}</Text>
            {/* Question Prompt */}
            <Text style={styles.prompt}>What does this mean in English?</Text>
          </>
        );
      case 'MEDIUM':
        return (
          <>
            {/* English Word */}
            <Text style={styles.englishWord}>{question.chineseCharacter}</Text>
            {/* Question Prompt */}
            <Text style={styles.prompt}>What is this in Chinese?</Text>
          </>
        );
      case 'HARD':
        return (
          <>
            {/* English Word */}
            <Text style={styles.englishWord}>{question.chineseCharacter}</Text>
            {/* Question Prompt */}
            <Text style={styles.prompt}>What is this in Chinese? (No pinyin)</Text>
          </>
        );
      default:
        return (
          <>
            <Text style={styles.chineseCharacter}>{question.chineseCharacter}</Text>
            <Text style={styles.pinyin}>{question.pinyin}</Text>
            <Text style={styles.prompt}>What does this mean in English?</Text>
          </>
        );
    }
  };

  if (!question) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading question...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Timer */}
      {timeRemaining !== null && (
        <View style={styles.timerContainer}>
          <Ionicons name="time" size={20} color={colors.primary} />
          <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
        </View>
      )}

      {/* Question Header */}
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>
          Question {question.questionNumber} of {question.totalQuestions}
        </Text>
        <Text style={styles.quizType}>{question.quizType} Mode</Text>
      </View>

      {/* Question Card */}
      <View style={styles.questionCard}>
        <LinearGradient
          colors={getQuestionCardColors(question.quizType)}
          style={styles.questionGradient}
        >
          <View style={styles.questionContent}>
            {renderQuestionContent(question)}
          </View>
        </LinearGradient>
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === option && styles.selectedOption,
              isAnswering && styles.disabledOption
            ]}
            onPress={() => handleAnswerSelect(option)}
            disabled={isAnswering || loading}
          >
            <LinearGradient
              colors={
                selectedAnswer === option 
                  ? ['#10B981', '#059669'] 
                  : ['#F3F4F6', '#E5E7EB']
              }
              style={styles.optionGradient}
            >
              <Text style={[
                styles.optionText,
                selectedAnswer === option && styles.selectedOptionText
              ]}>
                {option}
              </Text>
              {selectedAnswer === option && (
                <Ionicons name="checkmark-circle" size={20} color="white" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.submittingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.submittingText}>Submitting answer...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
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
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  timerText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  questionNumber: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  quizType: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  questionCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  questionGradient: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  questionContent: {
    alignItems: 'center',
  },
  chineseCharacter: {
    fontSize: 64,
    fontWeight: typography.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pinyin: {
    fontSize: typography.xl,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  englishWord: {
    fontSize: 64,
    fontWeight: typography.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  prompt: {
    fontSize: typography.lg,
    color: 'white',
    textAlign: 'center',
    fontWeight: typography.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  optionsContainer: {
    gap: spacing.md,
  },
  optionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  selectedOption: {
    ...shadows.lg,
  },
  disabledOption: {
    opacity: 0.6,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  optionText: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    flex: 1,
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: typography.bold,
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  submittingText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
  },
});

export default QuizQuestion;
