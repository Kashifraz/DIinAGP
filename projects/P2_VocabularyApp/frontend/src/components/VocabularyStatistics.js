import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';
import ApiService from '../services/ApiService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const VocabularyStatistics = ({ onLevelSelect }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { showError } = useToast();

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getVocabularyStatistics();
      
      if (response.success) {
        setStatistics(response.data);
      } else {
        showError(response.message || 'Failed to load statistics');
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      showError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      1: ['#10B981', '#059669'],
      2: ['#3B82F6', '#2563EB'],
      3: ['#8B5CF6', '#7C3AED'],
      4: ['#F59E0B', '#D97706'],
      5: ['#EF4444', '#DC2626'],
    };
    return colors[level] || ['#6B7280', '#4B5563'];
  };

  const getLevelDescription = (level) => {
    const descriptions = {
      1: 'Basic vocabulary for beginners',
      2: 'Common daily communication',
      3: 'Intermediate conversation skills',
      4: 'Advanced professional contexts',
      5: 'Native-level proficiency',
    };
    return descriptions[level] || 'Vocabulary level';
  };

  const getLevelIcon = (level) => {
    const icons = {
      1: '🌱',
      2: '🌿',
      3: '🌳',
      4: '🏔️',
      5: '⭐',
    };
    return icons[level] || '📚';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (!statistics) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load statistics</Text>
      </View>
    );
  }

  const { width } = Dimensions.get('window');
  const totalWords = statistics.total || 0;
  const hskLevels = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#EC4899']}
          style={styles.header}
        >
          <Text style={styles.title}>Vocabulary Statistics</Text>
          <Text style={styles.subtitle}>Explore HSK vocabulary by level</Text>
        </LinearGradient>

        {/* Total Overview */}
        <View style={styles.overviewContainer}>
          <View style={styles.totalCard}>
            <Text style={styles.totalNumber}>{totalWords.toLocaleString()}</Text>
            <Text style={styles.totalLabel}>Total Words</Text>
            <Text style={styles.totalDescription}>
              Complete HSK vocabulary database
            </Text>
          </View>
        </View>

        {/* HSK Levels */}
        <View style={styles.levelsContainer}>
          <Text style={styles.sectionTitle}>HSK Levels</Text>
          {hskLevels.map((level) => {
            const count = statistics[`hsk${level}`] || 0;
            const percentage = totalWords > 0 ? (count / totalWords) * 100 : 0;
            const levelColors = getLevelColor(level);
            
            return (
              <TouchableOpacity
                key={level}
                style={styles.levelCard}
                onPress={() => onLevelSelect && onLevelSelect(level)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={levelColors}
                  style={styles.levelCardGradient}
                >
                  <View style={styles.levelHeader}>
                    <Text style={styles.levelIcon}>{getLevelIcon(level)}</Text>
                    <View style={styles.levelInfo}>
                      <Text style={styles.levelTitle}>HSK Level {level}</Text>
                      <Text style={styles.levelDescription}>
                        {getLevelDescription(level)}
                      </Text>
                    </View>
                    <Text style={styles.levelCount}>{count.toLocaleString()}</Text>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${percentage}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {percentage.toFixed(1)}% of total
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => onLevelSelect && onLevelSelect(1)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionTitle}>Start Learning</Text>
              <Text style={styles.actionDescription}>Begin with HSK Level 1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => onLevelSelect && onLevelSelect(3)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionIcon}>🚀</Text>
              <Text style={styles.actionTitle}>Jump to Intermediate</Text>
              <Text style={styles.actionDescription}>Start with HSK Level 3</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.base,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.lg,
    color: colors.error,
    textAlign: 'center',
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.base,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  overviewContainer: {
    padding: spacing.lg,
  },
  totalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  totalNumber: {
    fontSize: typography['4xl'],
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  totalDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  levelsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  levelCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.md,
  },
  levelCardGradient: {
    padding: spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelIcon: {
    fontSize: typography['2xl'],
    marginRight: spacing.md,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  levelDescription: {
    fontSize: typography.sm,
    color: colors.white,
    opacity: 0.9,
  },
  levelCount: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.white,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.xs,
    color: colors.white,
    opacity: 0.9,
    textAlign: 'right',
  },
  actionsContainer: {
    padding: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: typography['2xl'],
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default VocabularyStatistics;
