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

const QuizStatisticsScreen = ({ navigation }) => {
  const { showSuccess, showError } = useToast();
  
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getQuizStatistics();
      if (response.success) {
        setStatistics(response.data);
      } else {
        showError(response.message || 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      showError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatistics();
    setRefreshing(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderOverallStats = () => {
    if (!statistics?.overall) return null;
    
    const { totalAttempts, totalQuestions, totalCorrect, percentage } = statistics.overall;
    
    return (
      <View style={styles.statsCard}>
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.statsCardGradient}
        >
          <View style={styles.statsCardHeader}>
            <Ionicons name="trophy" size={32} color="white" />
            <Text style={styles.statsCardTitle}>Overall Performance</Text>
          </View>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalAttempts}</Text>
              <Text style={styles.statLabel}>Total Attempts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalQuestions}</Text>
              <Text style={styles.statLabel}>Questions Answered</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCorrect}</Text>
              <Text style={styles.statLabel}>Correct Answers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{percentage}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderLevelStats = () => {
    if (!statistics?.byLevel || Object.keys(statistics.byLevel).length === 0) return null;
    
    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Performance by HSK Level</Text>
        {Object.entries(statistics.byLevel).map(([level, stats]) => (
          <View key={level} style={styles.levelStatsCard}>
            <View style={styles.levelStatsHeader}>
              <Text style={styles.levelStatsTitle}>HSK Level {level}</Text>
              <Text style={styles.levelStatsPercentage}>{stats.percentage}%</Text>
            </View>
            <View style={styles.levelStatsDetails}>
              <View style={styles.levelStatItem}>
                <Text style={styles.levelStatValue}>{stats.totalAttempts}</Text>
                <Text style={styles.levelStatLabel}>Attempts</Text>
              </View>
              <View style={styles.levelStatItem}>
                <Text style={styles.levelStatValue}>{stats.totalQuestions}</Text>
                <Text style={styles.levelStatLabel}>Questions</Text>
              </View>
              <View style={styles.levelStatItem}>
                <Text style={styles.levelStatValue}>{stats.totalCorrect}</Text>
                <Text style={styles.levelStatLabel}>Correct</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTypeStats = () => {
    if (!statistics?.byType || Object.keys(statistics.byType).length === 0) return null;
    
    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Performance by Quiz Type</Text>
        {Object.entries(statistics.byType).map(([type, stats]) => (
          <View key={type} style={styles.typeStatsCard}>
            <LinearGradient
              colors={getQuizTypeColors(type)}
              style={styles.typeStatsGradient}
            >
              <View style={styles.typeStatsHeader}>
                <Text style={styles.typeStatsIcon}>{getQuizTypeIcon(type)}</Text>
                <Text style={styles.typeStatsTitle}>{type} Mode</Text>
                <Text style={styles.typeStatsPercentage}>{stats.percentage}%</Text>
              </View>
              <View style={styles.typeStatsDetails}>
                <View style={styles.typeStatItem}>
                  <Text style={styles.typeStatValue}>{stats.totalAttempts}</Text>
                  <Text style={styles.typeStatLabel}>Attempts</Text>
                </View>
                <View style={styles.typeStatItem}>
                  <Text style={styles.typeStatValue}>{stats.totalQuestions}</Text>
                  <Text style={styles.typeStatLabel}>Questions</Text>
                </View>
                <View style={styles.typeStatItem}>
                  <Text style={styles.typeStatValue}>{stats.totalCorrect}</Text>
                  <Text style={styles.typeStatLabel}>Correct</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}
      </View>
    );
  };

  const renderRecentActivity = () => {
    if (!statistics?.recentActivity) return null;
    
    const { attemptsLastWeek, questionsLastWeek, correctLastWeek } = statistics.recentActivity;
    
    return (
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Recent Activity (Last 7 Days)</Text>
        <View style={styles.recentActivityCard}>
          <View style={styles.recentActivityHeader}>
            <Ionicons name="time" size={24} color={colors.primary} />
            <Text style={styles.recentActivityTitle}>This Week</Text>
          </View>
          <View style={styles.recentActivityStats}>
            <View style={styles.recentStatItem}>
              <Text style={styles.recentStatValue}>{attemptsLastWeek}</Text>
              <Text style={styles.recentStatLabel}>Quiz Attempts</Text>
            </View>
            <View style={styles.recentStatItem}>
              <Text style={styles.recentStatValue}>{questionsLastWeek}</Text>
              <Text style={styles.recentStatLabel}>Questions</Text>
            </View>
            <View style={styles.recentStatItem}>
              <Text style={styles.recentStatValue}>{correctLastWeek}</Text>
              <Text style={styles.recentStatLabel}>Correct</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const getQuizTypeColors = (type) => {
    switch (type) {
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

  const getQuizTypeIcon = (type) => {
    switch (type) {
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

  if (loading) {
    return (
      <LinearGradient colors={['#F9FAFB', '#E5E7EB']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading statistics...</Text>
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
        <Text style={styles.headerTitle}>Quiz Statistics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overall Statistics */}
        {renderOverallStats()}

        {/* Level Statistics */}
        {renderLevelStats()}

        {/* Type Statistics */}
        {renderTypeStats()}

        {/* Recent Activity */}
        {renderRecentActivity()}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('QuizHistory')}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="list" size={20} color="white" />
              <Text style={styles.actionButtonText}>View History</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Home')}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="play" size={20} color="white" />
              <Text style={styles.actionButtonText}>Start Quiz</Text>
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
  statsCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  statsCardGradient: {
    padding: spacing.lg,
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statsCardTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    marginLeft: spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statValue: {
    fontSize: typography['2xl'],
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
    textAlign: 'center',
  },
  statsSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  levelStatsCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  levelStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelStatsTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  levelStatsPercentage: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  levelStatsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  levelStatItem: {
    alignItems: 'center',
  },
  levelStatValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  levelStatLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  typeStatsCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  typeStatsGradient: {
    padding: spacing.lg,
  },
  typeStatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  typeStatsIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  typeStatsTitle: {
    flex: 1,
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: 'white',
  },
  typeStatsPercentage: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  typeStatsDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  typeStatItem: {
    alignItems: 'center',
  },
  typeStatValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  typeStatLabel: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  recentActivityCard: {
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  recentActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  recentActivityTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  recentActivityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  recentStatItem: {
    alignItems: 'center',
  },
  recentStatValue: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  recentStatLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
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
});

export default QuizStatisticsScreen;
