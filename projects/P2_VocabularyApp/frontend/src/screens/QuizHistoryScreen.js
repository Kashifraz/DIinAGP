import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useToast } from '../contexts/ToastContext';
import ApiService from '../services/ApiService';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/designSystem';

const QuizHistoryScreen = ({ navigation }) => {
  const { showSuccess, showError } = useToast();
  
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'level', 'type'
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedType, setSelectedType] = useState('EASY');

  useEffect(() => {
    loadQuizHistory();
  }, [filter, selectedLevel, selectedType]);

  const loadQuizHistory = async () => {
    setLoading(true);
    try {
      let response;
      switch (filter) {
        case 'level':
          response = await ApiService.getQuizHistoryByLevel(selectedLevel);
          break;
        case 'type':
          response = await ApiService.getQuizHistoryByType(selectedType);
          break;
        default:
          response = await ApiService.getQuizHistory();
      }

      if (response.success) {
        setQuizHistory(response.data);
      } else {
        showError(response.message || 'Failed to load quiz history');
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
      showError('Failed to load quiz history');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuizHistory();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'No date';
    }
    
    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
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

  const handleQuizReview = (quizAttemptId) => {
    navigation.navigate('QuizReview', { quizAttemptId });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderQuizHistoryItem = (item) => (
    <TouchableOpacity
      key={item.quizAttemptId}
      style={styles.historyItem}
      onPress={() => handleQuizReview(item.quizAttemptId)}
    >
      <LinearGradient
        colors={getQuizTypeColor(item.quizType)}
        style={styles.historyItemGradient}
      >
        <View style={styles.historyItemHeader}>
          <View style={styles.historyItemTitle}>
            <Text style={styles.quizTypeIcon}>{getQuizTypeIcon(item.quizType)}</Text>
            <Text style={styles.quizTypeText}>{item.quizType} Mode</Text>
          </View>
          <Text style={styles.hskLevelText}>HSK {item.hskLevel}</Text>
        </View>

        <View style={styles.historyItemStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.score}/{item.totalQuestions}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.percentage}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDate(item.dateAttempted)}</Text>
            <Text style={styles.statLabel}>Date</Text>
          </View>
        </View>

        <View style={styles.historyItemFooter}>
          <Text style={styles.reviewText}>Tap to review →</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filter === 'level' && styles.filterButtonActive]}
        onPress={() => setFilter('level')}
      >
        <Text style={[styles.filterButtonText, filter === 'level' && styles.filterButtonTextActive]}>
          HSK Level
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.filterButton, filter === 'type' && styles.filterButtonActive]}
        onPress={() => setFilter('type')}
      >
        <Text style={[styles.filterButtonText, filter === 'type' && styles.filterButtonTextActive]}>
          Quiz Type
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLevelSelector = () => (
    filter === 'level' && (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Select HSK Level:</Text>
        <View style={styles.levelButtons}>
          {[1, 2, 3, 4, 5].map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.levelButton, selectedLevel === level && styles.levelButtonActive]}
              onPress={() => setSelectedLevel(level)}
            >
              <Text style={[styles.levelButtonText, selectedLevel === level && styles.levelButtonTextActive]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  );

  const renderTypeSelector = () => (
    filter === 'type' && (
      <View style={styles.selectorContainer}>
        <Text style={styles.selectorLabel}>Select Quiz Type:</Text>
        <View style={styles.typeButtons}>
          {['EASY', 'MEDIUM', 'HARD'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.typeButton, selectedType === type && styles.typeButtonActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.typeButtonText, selectedType === type && styles.typeButtonTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    )
  );

  if (loading) {
    return (
      <LinearGradient colors={['#F9FAFB', '#E5E7EB']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading quiz history...</Text>
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
        <Text style={styles.headerTitle}>Quiz History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Filter Buttons */}
        {renderFilterButtons()}

        {/* Level Selector */}
        {renderLevelSelector()}

        {/* Type Selector */}
        {renderTypeSelector()}

        {/* Quiz History */}
        <View style={styles.historyContainer}>
          {quizHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Quiz History</Text>
              <Text style={styles.emptyText}>
                {filter === 'all' 
                  ? "You haven't taken any quizzes yet. Start your first quiz!"
                  : `No ${filter === 'level' ? 'HSK ' + selectedLevel : selectedType} quizzes found.`
                }
              </Text>
              <TouchableOpacity
                style={styles.startQuizButton}
                onPress={() => navigation.navigate('Home')}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.startQuizButtonGradient}
                >
                  <Ionicons name="play" size={20} color="white" />
                  <Text style={styles.startQuizButtonText}>Start Quiz</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.historyTitle}>
                {filter === 'all' 
                  ? 'All Quiz Attempts'
                  : filter === 'level' 
                    ? `HSK ${selectedLevel} Quizzes`
                    : `${selectedType} Mode Quizzes`
                }
              </Text>
              {quizHistory.map(renderQuizHistoryItem)}
            </>
          )}
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'white',
    alignItems: 'center',
    ...shadows.sm,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  selectorContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  selectorLabel: {
    fontSize: typography.base,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  levelButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  levelButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'white',
    alignItems: 'center',
    ...shadows.sm,
  },
  levelButtonActive: {
    backgroundColor: colors.primary,
  },
  levelButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  levelButtonTextActive: {
    color: 'white',
  },
  typeButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'white',
    alignItems: 'center',
    ...shadows.sm,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  typeButtonTextActive: {
    color: 'white',
  },
  historyContainer: {
    paddingHorizontal: spacing.lg,
  },
  historyTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  historyItem: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  historyItemGradient: {
    padding: spacing.lg,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  historyItemTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quizTypeIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  quizTypeText: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: 'white',
  },
  hskLevelText: {
    fontSize: typography.base,
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  historyItemStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  historyItemFooter: {
    alignItems: 'center',
  },
  reviewText: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  startQuizButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  startQuizButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  startQuizButtonText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: 'white',
  },
});

export default QuizHistoryScreen;
