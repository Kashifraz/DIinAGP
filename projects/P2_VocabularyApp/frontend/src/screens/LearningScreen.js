import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ApiService from '../services/ApiService';
import Flashcard from '../components/Flashcard';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/designSystem';

const LearningScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentWord, setCurrentWord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [wordLoading, setWordLoading] = useState(false);

  // HSK Level options
  const hskLevels = [
    { level: 1, label: 'HSK 1', color: ['#FF6B6B', '#FF5252'], icon: '🌟' },
    { level: 2, label: 'HSK 2', color: ['#4ECDC4', '#26A69A'], icon: '⭐' },
    { level: 3, label: 'HSK 3', color: ['#45B7D1', '#2196F3'], icon: '💫' },
    { level: 4, label: 'HSK 4', color: ['#96CEB4', '#4CAF50'], icon: '✨' },
    { level: 5, label: 'HSK 5', color: ['#FFEAA7', '#FFC107'], icon: '🔥' },
  ];

  // Start or resume learning session
  const startLearningSession = async (hskLevel) => {
    setSessionLoading(true);
    try {
      const response = await ApiService.startLearningSession(hskLevel);
      if (response.success) {
        setCurrentSession(response.data);
        setSelectedLevel(hskLevel);
        showSuccess(`Started ${hskLevels[hskLevel - 1].label} learning session!`);
        // Get the first word
        await getCurrentWord(response.data.sessionId);
      } else {
        showError(response.message || 'Failed to start learning session');
      }
    } catch (error) {
      console.error('Error starting learning session:', error);
      showError('Failed to start learning session');
    } finally {
      setSessionLoading(false);
    }
  };

  // Get current word for the session
  const getCurrentWord = async (sessionId) => {
    setWordLoading(true);
    try {
      const response = await ApiService.getCurrentWord(sessionId);
      if (response.success && response.data) {
        setCurrentWord(response.data);
      } else {
        setCurrentWord(null);
        if (response.message && response.message.includes('completed')) {
          showSuccess('Session completed! Great job!');
          setCurrentSession(null);
        }
      }
    } catch (error) {
      console.error('Error getting current word:', error);
      showError('Failed to load current word');
    } finally {
      setWordLoading(false);
    }
  };

  // Mark word as learned and move to next
  const markWordAsLearned = async () => {
    if (!currentSession || !currentWord) return;
    
    setLoading(true);
    try {
      const response = await ApiService.markWordAsLearned(
        currentSession.sessionId, 
        currentWord.id
      );
      
      if (response.success) {
        showSuccess('Word marked as learned!');
        // Update session info
        setCurrentSession(response.data);
        // Get next word
        await getCurrentWord(currentSession.sessionId);
      } else {
        showError(response.message || 'Failed to mark word as learned');
      }
    } catch (error) {
      console.error('Error marking word as learned:', error);
      showError('Failed to mark word as learned');
    } finally {
      setLoading(false);
    }
  };

  // Skip current word
  const skipWord = async () => {
    if (!currentSession || !currentWord) return;
    
    setLoading(true);
    try {
      // For now, we'll just get the next word
      // In a real implementation, you might want to track skipped words
      await getCurrentWord(currentSession.sessionId);
      showSuccess('Word skipped');
    } catch (error) {
      console.error('Error skipping word:', error);
      showError('Failed to skip word');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#F9FAFB', '#E5E7EB']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Learning Mode</Text>
          <View style={styles.placeholder} />
        </View>

        {/* HSK Level Selection */}
        {!currentSession && (
          <View style={styles.levelSelection}>
            <Text style={styles.sectionTitle}>Choose HSK Level</Text>
            <View style={styles.levelGrid}>
              {hskLevels.map((level) => (
                <TouchableOpacity
                  key={level.level}
                  style={styles.levelCard}
                  onPress={() => startLearningSession(level.level)}
                  disabled={sessionLoading}
                >
                  <LinearGradient
                    colors={level.color}
                    style={styles.levelGradient}
                  >
                    <Text style={styles.levelIcon}>{level.icon}</Text>
                    <Text style={styles.levelLabel}>{level.label}</Text>
                    <Text style={styles.levelSubtext}>Begin Learning</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Current Session Info */}
        {currentSession && (
          <View style={styles.sessionInfo}>
            <LinearGradient
              colors={hskLevels[selectedLevel - 1].color}
              style={styles.sessionCard}
            >
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>
                  {hskLevels[selectedLevel - 1].label} Learning Session
                </Text>
                <TouchableOpacity
                  style={styles.endSessionButton}
                  onPress={() => {
                    setCurrentSession(null);
                    setCurrentWord(null);
                    setSelectedLevel(null);
                    setSessionLoading(false);
                    setWordLoading(false);
                    showSuccess('Session ended successfully');
                  }}
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>
                  Word {currentSession.currentWordIndex + 1} of {currentSession.wordsPerSession || currentSession.totalWords || 10}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${((currentSession.currentWordIndex + 1) / (currentSession.wordsPerSession || currentSession.totalWords || 10)) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Loading States */}
        {sessionLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Starting learning session...</Text>
          </View>
        )}

        {wordLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading word...</Text>
          </View>
        )}

        {/* Flashcard */}
        {currentWord && !wordLoading && (
          <View style={styles.flashcardContainer}>
            <Flashcard
              word={currentWord}
              onLearned={markWordAsLearned}
              onSkip={skipWord}
              loading={loading}
            />
          </View>
        )}

        {/* No Current Word */}
        {currentSession && !currentWord && !wordLoading && (
          <View style={styles.noWordContainer}>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={styles.noWordTitle}>Session Complete!</Text>
            <Text style={styles.noWordText}>
              You've completed all words in this session. Great job!
            </Text>
            <TouchableOpacity
              style={styles.newSessionButton}
              onPress={() => {
                setCurrentSession(null);
                setCurrentWord(null);
              }}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.newSessionGradient}
              >
                <Text style={styles.newSessionText}>Start New Session</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.xl,
  },
  scrollView: {
    flex: 1,
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
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  levelSelection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCard: {
    width: '48%',
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  levelGradient: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    ...shadows.lg,
  },
  levelIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  levelLabel: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelSubtext: {
    fontSize: typography.sm,
    color: 'white',
    opacity: 0.9,
    fontWeight: typography.medium,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  sessionInfo: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sessionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sessionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: 'white',
  },
  endSessionButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressInfo: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: typography.sm,
    color: 'white',
    marginBottom: spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  loadingText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  flashcardContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
    flex: 1,
  },
  noWordContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['3xl'],
  },
  noWordTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  noWordText: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    lineHeight: typography.normal,
  },
  newSessionButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  newSessionGradient: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  newSessionText: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: 'white',
    textAlign: 'center',
  },
});

export default LearningScreen;
