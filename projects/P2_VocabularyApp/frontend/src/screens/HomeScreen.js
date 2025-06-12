import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/designSystem';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = async () => {
    console.log('🔵 Logout button clicked');
    
    try {
      console.log('🔵 Calling logout function directly');
      await logout();
      console.log('🔵 Logout function completed');
      showSuccess('Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const navigateToVocabulary = () => {
    navigation.navigate('Vocabulary');
  };

  const { width } = Dimensions.get('window');

  return (
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.appTitle}>中文词汇</Text>
            <Text style={styles.appSubtitle}>Chinese Vocabulary App</Text>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.email?.split('@')[0]}!
            </Text>
          </View>
        </LinearGradient>
        
        {/* Features Section */}
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Text style={styles.sectionTitle}>Learning Features</Text>
          
          <View style={styles.featuresGrid}>
                 <TouchableOpacity style={styles.featureCard} onPress={navigateToVocabulary}>
                   <LinearGradient
                     colors={['#6366F1', '#8B5CF6']}
                     style={styles.featureIconGradient}
                   >
                     <Text style={styles.featureEmoji}>📚</Text>
                   </LinearGradient>
                   <Text style={styles.featureTitle}>Vocabulary</Text>
                   <Text style={styles.featureDescription}>
                     Browse and search HSK vocabulary
                   </Text>
                   <View style={styles.availableBadge}>
                     <Text style={styles.availableText}>Available</Text>
                   </View>
                 </TouchableOpacity>

                 <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('Learning')}>
                   <LinearGradient
                     colors={['#EC4899', '#F472B6']}
                     style={styles.featureIconGradient}
                   >
                     <Text style={styles.featureEmoji}>🎯</Text>
                   </LinearGradient>
                   <Text style={styles.featureTitle}>Learning Mode</Text>
                   <Text style={styles.featureDescription}>
                     Interactive flashcards for vocabulary learning
                   </Text>
                   <View style={styles.availableBadge}>
                     <Text style={styles.availableText}>Available</Text>
                   </View>
                 </TouchableOpacity>
            
            <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('Quiz')}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.featureIconGradient}
              >
                <Text style={styles.featureEmoji}>🧠</Text>
              </LinearGradient>
              <Text style={styles.featureTitle}>Quiz Mode</Text>
              <Text style={styles.featureDescription}>
                Test your knowledge with challenging quizzes
              </Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('History')}>
              <LinearGradient
                colors={['#3B82F6', '#1D4ED8']}
                style={styles.featureIconGradient}
              >
                <Text style={styles.featureEmoji}>📊</Text>
              </LinearGradient>
              <Text style={styles.featureTitle}>Quiz History</Text>
              <Text style={styles.featureDescription}>
                View your quiz attempts and performance
              </Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.featureCard} onPress={() => navigation.navigate('QuizStatistics')}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.featureIconGradient}
              >
                <Text style={styles.featureEmoji}>📈</Text>
              </LinearGradient>
              <Text style={styles.featureTitle}>Quiz Statistics</Text>
              <Text style={styles.featureDescription}>
                Track your progress and performance analytics
              </Text>
              <View style={styles.availableBadge}>
                <Text style={styles.availableText}>Available</Text>
              </View>
            </TouchableOpacity>
            
          </View>
          
          {/* User Info Card */}
          <View style={styles.userInfoCard}>
            <Text style={styles.userInfoTitle}>Account Information</Text>
            <View style={styles.userInfoContent}>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>Email</Text>
                <Text style={styles.userInfoValue}>{user?.email}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <Text style={styles.userInfoLabel}>User ID</Text>
                <Text style={styles.userInfoValue}>#{user?.id}</Text>
              </View>
            </View>
          </View>
          
          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.error, '#DC2626']}
              style={styles.logoutButtonGradient}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: typography['4xl'],
    fontWeight: typography.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  appSubtitle: {
    fontSize: typography.lg,
    color: colors.white,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: typography.xl,
    fontWeight: typography.semibold,
    color: colors.white,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography['3xl'],
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  featuresGrid: {
    marginBottom: spacing['2xl'],
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    marginBottom: spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.gray100,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
       featureIcon: {
         width: 60,
         height: 60,
         borderRadius: 30,
         backgroundColor: colors.primaryLight,
         justifyContent: 'center',
         alignItems: 'center',
         marginBottom: spacing.md,
       },
       featureIconGradient: {
         width: 80,
         height: 80,
         borderRadius: 40,
         justifyContent: 'center',
         alignItems: 'center',
         marginBottom: spacing.lg,
         ...shadows.md,
         elevation: 4,
         shadowColor: '#000',
         shadowOffset: {
           width: 0,
           height: 2,
         },
         shadowOpacity: 0.15,
         shadowRadius: 8,
       },
  featureEmoji: {
    fontSize: 32,
  },
  featureTitle: {
    fontSize: typography.xl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: typography.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.normal * typography.base,
    marginBottom: spacing.lg,
  },
       availableBadge: {
         backgroundColor: colors.success,
         paddingHorizontal: spacing.md,
         paddingVertical: spacing.sm,
         borderRadius: borderRadius.full,
         ...shadows.sm,
         elevation: 2,
       },
       availableText: {
         fontSize: typography.sm,
         color: colors.white,
         fontWeight: typography.bold,
         textTransform: 'uppercase',
         letterSpacing: 0.5,
       },
  userInfoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  userInfoTitle: {
    fontSize: typography.lg,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  userInfoContent: {
    gap: spacing.md,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfoLabel: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontWeight: typography.medium,
  },
  userInfoValue: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    fontWeight: typography.semibold,
  },
  logoutButton: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  logoutButtonGradient: {
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: typography.base,
    fontWeight: typography.semibold,
  },
});

export default HomeScreen;
