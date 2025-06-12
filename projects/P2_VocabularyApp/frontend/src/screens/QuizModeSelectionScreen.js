import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/designSystem';

const QuizModeSelectionScreen = ({ navigation, route }) => {
  const { hskLevel: initialHskLevel = 1 } = route.params || {};
  const [selectedHskLevel, setSelectedHskLevel] = useState(initialHskLevel);

  const quizModes = [
    {
      id: 'EASY',
      title: 'Easy Mode',
      subtitle: 'Chinese + Pinyin → English',
      description: 'Perfect for beginners! See Chinese characters and pinyin, then choose the English meaning.',
      icon: '🌟',
      color: ['#10B981', '#059669'],
      difficulty: 'Beginner',
      example: '你好 (nǐ hǎo) → hello',
      features: [
        'Chinese characters displayed',
        'Pinyin pronunciation shown',
        'Choose English meaning',
        'Great for vocabulary building'
      ]
    },
    {
      id: 'MEDIUM',
      title: 'Medium Mode',
      subtitle: 'English → Chinese + Pinyin',
      description: 'Challenge yourself! See English words and choose the correct Chinese characters with pinyin.',
      icon: '⭐',
      color: ['#3B82F6', '#1D4ED8'],
      difficulty: 'Intermediate',
      example: 'hello → 你好 (nǐ hǎo)',
      features: [
        'English words displayed',
        'Choose Chinese + Pinyin',
        'Tests recognition skills',
        'Builds character knowledge'
      ]
    },
    {
      id: 'HARD',
      title: 'Hard Mode',
      subtitle: 'English → Chinese Only',
      description: 'Expert level! See English words and choose the correct Chinese characters without pinyin.',
      icon: '🔥',
      color: ['#EF4444', '#DC2626'],
      difficulty: 'Advanced',
      example: 'hello → 你好',
      features: [
        'English words displayed',
        'Choose Chinese characters only',
        'No pinyin assistance',
        'Master level challenge'
      ]
    }
  ];

  const handleModeSelection = (mode) => {
    console.log('🎯 QuizModeSelection - Starting quiz with:', { hskLevel: selectedHskLevel, quizType: mode.id });
    // Navigate to the parent navigator (AppStack) to access the Quiz screen
    navigation.getParent()?.navigate('Quiz', { 
      hskLevel: selectedHskLevel, 
      quizType: mode.id 
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#F9FAFB', '#E5E7EB']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Quiz Mode</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* HSK Level Selector */}
        <View style={styles.levelSelector}>
          <Text style={styles.levelSelectorTitle}>Choose HSK Level</Text>
          <Text style={styles.levelSelectorSubtitle}>Select the vocabulary level for your quiz</Text>
          
          <View style={styles.levelButtons}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  selectedHskLevel === level && styles.levelButtonSelected
                ]}
                onPress={() => setSelectedHskLevel(level)}
              >
                <Text style={[
                  styles.levelButtonText,
                  selectedHskLevel === level && styles.levelButtonTextSelected
                ]}>
                  HSK {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quiz Mode Cards */}
        <View style={styles.modesContainer}>
          {quizModes.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              style={styles.modeCard}
              onPress={() => handleModeSelection(mode)}
            >
              <LinearGradient
                colors={mode.color}
                style={styles.modeGradient}
              >
                {/* Mode Header */}
                <View style={styles.modeHeader}>
                  <Text style={styles.modeIcon}>{mode.icon}</Text>
                  <View style={styles.modeTitleContainer}>
                    <Text style={styles.modeTitle}>{mode.title}</Text>
                    <Text style={styles.modeSubtitle}>{mode.subtitle}</Text>
                  </View>
                  <View style={styles.difficultyBadge}>
                    <Text style={styles.difficultyText}>{mode.difficulty}</Text>
                  </View>
                </View>

                {/* Mode Description */}
                <Text style={styles.modeDescription}>{mode.description}</Text>

                {/* Example */}
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleLabel}>Example:</Text>
                  <Text style={styles.exampleText}>{mode.example}</Text>
                </View>

                {/* Features */}
                <View style={styles.featuresContainer}>
                  {mode.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="rgba(255, 255, 255, 0.9)" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* Start Button */}
                <View style={styles.startButtonContainer}>
                  <View style={styles.startButton}>
                    <Ionicons name="play" size={20} color="white" />
                    <Text style={styles.startButtonText}>Start {mode.title}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Quiz Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Start with Easy mode to build confidence</Text>
            <Text style={styles.tipItem}>• Medium mode helps with character recognition</Text>
            <Text style={styles.tipItem}>• Hard mode tests your mastery level</Text>
            <Text style={styles.tipItem}>• You can switch modes anytime</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
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
  levelInfo: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  levelTitle: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  levelSubtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modesContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  modeCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  modeGradient: {
    padding: spacing.lg,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modeIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  modeTitleContainer: {
    flex: 1,
  },
  modeTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: 'white',
    marginBottom: spacing.xs,
  },
  modeSubtitle: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  difficultyText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: 'white',
  },
  modeDescription: {
    fontSize: typography.base,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  exampleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  exampleLabel: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.xs,
  },
  exampleText: {
    fontSize: typography.base,
    color: 'white',
    fontFamily: 'monospace',
  },
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureText: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: spacing.sm,
  },
  startButtonContainer: {
    alignItems: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  startButtonText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: 'white',
  },
  tipsContainer: {
    margin: spacing.lg,
    backgroundColor: 'white',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  tipsTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  tipsList: {
    gap: spacing.sm,
  },
  tipItem: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  // HSK Level Selector Styles
  levelSelector: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
    elevation: 4,
  },
  levelSelectorTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  levelSelectorSubtitle: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  levelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  levelButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  levelButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  levelButtonTextSelected: {
    color: colors.white,
  },
});

export default QuizModeSelectionScreen;
