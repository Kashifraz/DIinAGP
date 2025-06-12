import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/designSystem';

const Flashcard = ({ word, onLearned, onSkip, loading = false }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  // Flip animation
  const flipCard = () => {
    const toValue = isFlipped ? 0 : 1;
    
    Animated.sequence([
      Animated.timing(flipAnimation, {
        toValue: 0.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(flipAnimation, {
        toValue,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsFlipped(!isFlipped);
  };

  // Button press animation
  const animateButtonPress = (callback) => {
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(callback, 100);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <View style={styles.container}>
      {/* Flashcard */}
      <TouchableOpacity
        style={styles.flashcardWrapper}
        onPress={flipCard}
        activeOpacity={0.9}
      >
        <Animated.View style={[styles.flashcard, frontAnimatedStyle]}>
          <LinearGradient
            colors={['#6366F1', '#8B5CF6']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              {/* Chinese Character */}
              <Text style={styles.chineseText}>{word.simplifiedChinese}</Text>
              
              {/* Pinyin */}
              {showPinyin && (
                <Text style={styles.pinyinText}>{word.pinyin}</Text>
              )}
              
              {/* Radicals */}
              {word.radicals && (
                <Text style={styles.radicalsText}>Radicals: {word.radicals}</Text>
              )}
            </View>
            
            {/* Flip hint - positioned absolutely */}
            <View style={styles.flipHint}>
              <Ionicons name="refresh" size={16} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.flipHintText}>Tap to flip</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.flashcard, styles.backCard, backAnimatedStyle]}>
          <LinearGradient
            colors={['#EC4899', '#F472B6']}
            style={styles.cardGradient}
          >
            <View style={styles.cardContent}>
              {/* English Meaning */}
              {showEnglish && (
                <Text style={styles.englishText}>{word.englishMeaning}</Text>
              )}
              
              {/* Detailed Explanation */}
              {word.detailedExplanation && (
                <Text style={styles.detailedText}>{word.detailedExplanation}</Text>
              )}
            </View>
            
            {/* Flip hint - positioned absolutely */}
            <View style={styles.flipHint}>
              <Ionicons name="refresh" size={16} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.flipHintText}>Tap to flip back</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Toggle Controls */}
      <View style={styles.toggleControls}>
        <TouchableOpacity
          style={[styles.toggleButton, !showPinyin && styles.toggleButtonInactive]}
          onPress={() => setShowPinyin(!showPinyin)}
        >
          <Ionicons 
            name={showPinyin ? "eye" : "eye-off"} 
            size={16} 
            color={showPinyin ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.toggleText, !showPinyin && styles.toggleTextInactive]}>
            Pinyin
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !showEnglish && styles.toggleButtonInactive]}
          onPress={() => setShowEnglish(!showEnglish)}
        >
          <Ionicons 
            name={showEnglish ? "eye" : "eye-off"} 
            size={16} 
            color={showEnglish ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.toggleText, !showEnglish && styles.toggleTextInactive]}>
            English
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={onSkip}
          disabled={loading}
        >
          <View style={styles.skipButtonContent}>
            <Ionicons name="arrow-forward" size={18} color="white" />
            <Text style={styles.skipButtonText}>Skip</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.learnedButton}
          onPress={onLearned}
          disabled={loading}
        >
          <View style={styles.learnedButtonContent}>
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.learnedButtonText}>I Know This</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  flashcardWrapper: {
    width: '100%',
    height: 300,
    marginBottom: spacing.xl,
  },
  flashcard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden',
  },
  backCard: {
    transform: [{ rotateY: '180deg' }],
  },
  cardGradient: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...shadows.lg,
  },
  cardContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  chineseText: {
    fontSize: 48,
    fontWeight: typography.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 56,
  },
  pinyinText: {
    fontSize: typography.lg,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  radicalsText: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  englishText: {
    fontSize: typography['2xl'],
    fontWeight: typography.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 32,
  },
  detailedText: {
    fontSize: typography.base,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  flipHint: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.lg,
  },
  flipHintText: {
    fontSize: typography.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: spacing.xs,
  },
  toggleControls: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    gap: spacing.xs,
  },
  toggleButtonInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.textSecondary,
  },
  toggleText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.primary,
  },
  toggleTextInactive: {
    color: colors.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    borderRadius: borderRadius.lg,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  skipButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  skipButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: 'white',
  },
  learnedButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: borderRadius.lg,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  learnedButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  learnedButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.bold,
    color: 'white',
  },
});

export default Flashcard;
