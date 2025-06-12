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

const VocabularyDetail = ({ vocabularyId, onClose }) => {
  const [vocabulary, setVocabulary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const { token } = useAuth();
  const { showError } = useToast();

  useEffect(() => {
    loadVocabularyDetail();
  }, [vocabularyId]);

  const loadVocabularyDetail = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getVocabularyById(vocabularyId);
      
      if (response.success) {
        setVocabulary(response.data);
      } else {
        showError(response.message || 'Failed to load vocabulary details');
      }
    } catch (error) {
      console.error('Error loading vocabulary detail:', error);
      showError('Failed to load vocabulary details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePinyin = () => setShowPinyin(!showPinyin);
  const toggleEnglish = () => setShowEnglish(!showEnglish);



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading vocabulary details...</Text>
      </View>
    );
  }

  if (!vocabulary) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Vocabulary not found</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { width } = Dimensions.get('window');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#6366F1', '#8B5CF6', '#EC4899']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.chineseText}>{vocabulary.simplifiedChinese}</Text>
            {showPinyin && (
              <Text style={styles.pinyinText}>{vocabulary.pinyin}</Text>
            )}
            <Text style={styles.levelText}>HSK Level {vocabulary.hskLevel}</Text>
          </View>
        </LinearGradient>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Toggle Buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={togglePinyin}
              activeOpacity={0.8}
            >
              {showPinyin ? (
                <LinearGradient
                  colors={['#6366F1', '#8B5CF6']}
                  style={styles.toggleButtonGradient}
                >
                  <Text style={styles.toggleButtonIcon}>👁️</Text>
                  <Text style={styles.toggleButtonTextActive}>Hide Pinyin</Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleButtonInactive}>
                  <Text style={styles.toggleButtonIcon}>👁️‍🗨️</Text>
                  <Text style={styles.toggleButtonText}>Show Pinyin</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={toggleEnglish}
              activeOpacity={0.8}
            >
              {showEnglish ? (
                <LinearGradient
                  colors={['#8B5CF6', '#EC4899']}
                  style={styles.toggleButtonGradient}
                >
                  <Text style={styles.toggleButtonIcon}>👁️</Text>
                  <Text style={styles.toggleButtonTextActive}>Hide English</Text>
                </LinearGradient>
              ) : (
                <View style={styles.toggleButtonInactive}>
                  <Text style={styles.toggleButtonIcon}>👁️‍🗨️</Text>
                  <Text style={styles.toggleButtonText}>Show English</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* English Meaning */}
          {showEnglish && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>English Meaning</Text>
              <View style={styles.meaningCard}>
                <Text style={styles.englishText}>{vocabulary.englishMeaning}</Text>
              </View>
              
              {/* Detailed Explanation */}
              <View style={styles.explanationCard}>
                <Text style={styles.explanationTitle}>Detailed Explanation</Text>
                <Text style={styles.explanationText}>
                  {vocabulary.detailedExplanation || 
                   `This is a ${vocabulary.hskLevel === 1 ? 'fundamental' : 
                     vocabulary.hskLevel === 2 ? 'important' :
                     vocabulary.hskLevel === 3 ? 'key' :
                     vocabulary.hskLevel === 4 ? 'advanced' : 'expert-level'} 
                   HSK Level ${vocabulary.hskLevel} vocabulary word. The character "${vocabulary.simplifiedChinese}" 
                   (${vocabulary.pinyin}) means "${vocabulary.englishMeaning}" and is essential for 
                   ${vocabulary.hskLevel === 1 ? 'basic Chinese communication' :
                    vocabulary.hskLevel === 2 ? 'daily conversations' :
                    vocabulary.hskLevel === 3 ? 'intermediate communication' :
                    vocabulary.hskLevel === 4 ? 'professional and academic contexts' : 'advanced Chinese proficiency'}.`}
                </Text>
              </View>
            </View>
          )}

          {/* Pinyin */}
          {showPinyin && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pronunciation</Text>
              <View style={styles.pinyinCard}>
                <Text style={styles.pinyinDetailText}>{vocabulary.pinyin}</Text>
              </View>
            </View>
          )}

          {/* Radical */}
          {vocabulary.radical && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Radical</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{vocabulary.radical}</Text>
              </View>
            </View>
          )}

          {/* Classifiers */}
          {vocabulary.classifiers && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Classifiers</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>{vocabulary.classifiers}</Text>
              </View>
            </View>
          )}


          {/* HSK Level Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HSK Level Information</Text>
            <View style={styles.levelInfoCard}>
              <Text style={styles.levelInfoText}>
                This vocabulary belongs to HSK Level {vocabulary.hskLevel}, which includes 
                {vocabulary.hskLevel === 1 ? ' the most basic and essential Chinese words.' :
                 vocabulary.hskLevel === 2 ? ' commonly used words for daily communication.' :
                 vocabulary.hskLevel === 3 ? ' intermediate vocabulary for more complex conversations.' :
                 vocabulary.hskLevel === 4 ? ' advanced vocabulary for professional and academic contexts.' :
                 ' highly advanced vocabulary for native-level proficiency.'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Close Button */}
      <View style={styles.closeButtonContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.closeButtonGradient}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  header: {
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  chineseText: {
    fontSize: typography['5xl'],
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pinyinText: {
    fontSize: typography.xl,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  levelText: {
    fontSize: typography.base,
    color: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  toggleButton: {
    flex: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  toggleButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.xs,
  },
  toggleButtonInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray100,
    gap: spacing.xs,
  },
  toggleButtonIcon: {
    fontSize: typography.sm,
  },
  toggleButtonText: {
    fontSize: typography.sm,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  toggleButtonTextActive: {
    fontSize: typography.sm,
    fontWeight: typography.semibold,
    color: colors.white,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  meaningCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  englishText: {
    fontSize: typography.xl,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    lineHeight: typography.normal * typography.xl,
  },
  pinyinCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  pinyinDetailText: {
    fontSize: typography.lg,
    fontWeight: typography.medium,
    color: colors.primary,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  infoText: {
    fontSize: typography.base,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  levelInfoCard: {
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  levelInfoText: {
    fontSize: typography.base,
    color: colors.textPrimary,
    lineHeight: typography.normal * typography.base,
  },
  explanationCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
    ...shadows.sm,
  },
  explanationTitle: {
    fontSize: typography.base,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  explanationText: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    lineHeight: typography.normal * typography.sm,
  },
  closeButtonContainer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  closeButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  closeButtonGradient: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
});

export default VocabularyDetail;
