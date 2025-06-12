import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import ApiService from '../services/ApiService';
import QuizQuestion from '../components/QuizQuestion';
import QuizProgress from '../components/QuizProgress';
import QuizResult from '../components/QuizResult';
import { colors, spacing, typography, borderRadius, shadows } from '../styles/designSystem';

const QuizScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // Quiz state
  const [quizSession, setQuizSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Answer tracking
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [timerActive, setTimerActive] = useState(false);
  
  // Get quiz parameters from route
  const { hskLevel, quizType = 'EASY' } = route.params || { hskLevel: 1 };
  
  console.log('🎯 QuizScreen - Route params:', route.params);
  console.log('🎯 QuizScreen - hskLevel:', hskLevel, 'quizType:', quizType);

  // Load a specific question
  const loadQuestion = async (questionNumber, sessionData = null) => {
    const session = sessionData || quizSession;
    if (!session) return;
    
    setLoading(true);
    try {
      console.log('🎯 Loading question', questionNumber, 'for session:', session.quizAttemptId);
      const response = await ApiService.getQuizQuestion(session.quizAttemptId, questionNumber);
      console.log('🎯 Question response:', response);
      if (response.success) {
        setCurrentQuestion(response.data);
        setCurrentQuestionNumber(questionNumber);
        setSelectedAnswer(null);
      } else {
        showError(response.message || 'Failed to load question');
      }
    } catch (error) {
      console.error('Error loading question:', error);
      showError('Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  // Auto-start quiz when component mounts
  useEffect(() => {
    const initializeQuiz = async () => {
      if (!quizSession && !loading) {
        console.log('🎯 Auto-starting quiz...');
        console.log('🎯 User authenticated:', !!user);
        console.log('🎯 User email:', user?.email);
        
        if (!user) {
          console.error('🎯 User not authenticated, redirecting to login');
          showError('Please log in to take a quiz');
          navigation.navigate('Login');
          return;
        }
        
        setLoading(true);
        try {
          const response = await ApiService.startQuiz(hskLevel, quizType);
          console.log('🎯 Quiz start response:', response);
          if (response.success) {
            setQuizSession(response.data);
            setTimeRemaining(600); // 10 minutes timer
            setTimerActive(true);
            setCorrectAnswers(0); // Reset counters
            setIncorrectAnswers(0);
            await loadQuestion(1, response.data);
            showSuccess('Quiz started! Good luck!');
          } else {
            console.error('🎯 Quiz start failed:', response.message);
            showError(response.message || 'Failed to start quiz');
          }
        } catch (error) {
          console.error('🎯 Error starting quiz:', error);
          showError('Failed to start quiz: ' + error.message);
        } finally {
          setLoading(false);
        }
      }
    };
    initializeQuiz();
  }, [hskLevel, quizType, user]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Time's up - auto submit
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Start quiz session (for retry button)
  const startQuiz = async () => {
    console.log('🎯 Starting quiz with params:', { hskLevel, quizType });
    setLoading(true);
    try {
      const response = await ApiService.startQuiz(hskLevel, quizType);
      console.log('🎯 Quiz start response:', response);
      if (response.success) {
        setQuizSession(response.data);
        setTimeRemaining(600); // 10 minutes timer
        setTimerActive(true);
        setCorrectAnswers(0); // Reset counters
        setIncorrectAnswers(0);
        await loadQuestion(1, response.data);
        showSuccess('Quiz started! Good luck!');
      } else {
        console.error('🎯 Quiz start failed:', response.message);
        showError(response.message || 'Failed to start quiz');
      }
    } catch (error) {
      console.error('🎯 Error starting quiz:', error);
      showError('Failed to start quiz: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle answer selection
  const handleAnswerSelect = async (answer) => {
    if (submitting) return;
    
    setSelectedAnswer(answer);
    setSubmitting(true);
    
    try {
      const response = await ApiService.submitQuizAnswer(
        quizSession.quizAttemptId,
        answer,
        currentQuestionNumber,
        quizType
      );
      
      if (response.success) {
        if (response.data.isCorrect) {
          setCorrectAnswers(prev => prev + 1);
          showSuccess('Correct! 🎉');
        } else {
          setIncorrectAnswers(prev => prev + 1);
          showError('Incorrect answer');
        }
        
        // Move to next question or complete quiz
        if (currentQuestionNumber < quizSession.totalQuestions) {
          setTimeout(() => {
            loadQuestion(currentQuestionNumber + 1);
          }, 1500);
        } else {
          setTimeout(() => {
            completeQuiz();
          }, 1500);
        }
      } else {
        showError(response.message || 'Failed to submit answer');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      showError('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // Complete quiz
  const completeQuiz = async () => {
    setLoading(true);
    try {
      const response = await ApiService.completeQuiz(quizSession.quizAttemptId);
      if (response.success) {
        setQuizResult(response.data);
        setTimerActive(false);
        showSuccess('Quiz completed!');
      } else {
        showError(response.message || 'Failed to complete quiz');
      }
    } catch (error) {
      console.error('Error completing quiz:', error);
      showError('Failed to complete quiz');
    } finally {
      setLoading(false);
    }
  };

  // Handle time up
  const handleTimeUp = () => {
    setTimerActive(false);
    Alert.alert(
      'Time\'s Up!',
      'The quiz time has expired. Your answers will be submitted automatically.',
      [
        {
          text: 'Submit Now',
          onPress: completeQuiz
        }
      ]
    );
  };

  // Retake quiz
  const handleRetakeQuiz = () => {
    setQuizSession(null);
    setCurrentQuestion(null);
    setCurrentQuestionNumber(1);
    setSelectedAnswer(null);
    setQuizResult(null);
    setTimeRemaining(null);
    setTimerActive(false);
    setCorrectAnswers(0); // Reset counters
    setIncorrectAnswers(0);
    startQuiz();
  };


  // Go home
  const handleGoHome = () => {
    console.log('🎯 QuizScreen - Go Home button pressed');
    try {
      const parent = navigation.getParent();
      console.log('🎯 QuizScreen - Parent navigator for Home:', parent);
      
      if (parent) {
        // Navigate to MainTabs and then to Home tab
        parent.navigate('MainTabs', { screen: 'Home' });
        console.log('🎯 QuizScreen - Home navigation command sent');
      } else {
        console.log('❌ QuizScreen - No parent navigator found for Home');
        // Fallback: go back to previous screen
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ QuizScreen - Home navigation error:', error);
      // Fallback navigation
      navigation.goBack();
    }
  };

  // Handle back button with improved reliability
  const handleBackPress = () => {
    console.log('🎯 QuizScreen - Back button pressed');
    console.log('🎯 QuizScreen - Navigation object:', navigation);
    console.log('🎯 QuizScreen - Can go back:', navigation.canGoBack());
    
    try {
      // Try multiple navigation approaches
      if (navigation.canGoBack()) {
        console.log('🎯 QuizScreen - Using navigation.goBack()');
        navigation.goBack();
      } else {
        console.log('🎯 QuizScreen - Cannot go back, using parent navigation');
        const parent = navigation.getParent();
        if (parent) {
          parent.navigate('MainTabs', { screen: 'Quiz' });
        } else {
          console.log('❌ QuizScreen - No parent navigator found');
        }
      }
    } catch (error) {
      console.error('❌ QuizScreen - Navigation error:', error);
      // Final fallback
      try {
        navigation.getParent()?.navigate('MainTabs');
      } catch (fallbackError) {
        console.error('❌ QuizScreen - Fallback navigation error:', fallbackError);
      }
    }
  };

  // Exit quiz
  const handleExitQuiz = () => {
    Alert.alert(
      'Exit Quiz',
      'Are you sure you want to exit? Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Exit', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  // Render loading state
  if (loading && !currentQuestion && !quizResult) {
    return (
      <LinearGradient
        colors={['#F9FAFB', '#E5E7EB']}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Starting quiz...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Render error state or initial state
  if (!quizSession && !loading && !quizResult) {
    return (
      <LinearGradient
        colors={['#F9FAFB', '#E5E7EB']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Quiz Mode</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Quiz Not Started</Text>
          <Text style={styles.errorText}>
            There was an issue starting the quiz. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={startQuiz}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.retryButtonGradient}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.retryButtonText}>Start Quiz</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  // Render quiz result
  if (quizResult) {
    return (
      <LinearGradient
        colors={['#F9FAFB', '#E5E7EB']}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <QuizResult
            result={quizResult}
            onRetakeQuiz={handleRetakeQuiz}
            onGoHome={handleGoHome}
          />
        </ScrollView>
      </LinearGradient>
    );
  }

  // Render quiz interface
  return (
    <LinearGradient
      colors={['#F9FAFB', '#E5E7EB']}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz Mode</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress */}
        {quizSession && (
          <QuizProgress
            currentQuestion={currentQuestionNumber}
            totalQuestions={quizSession.totalQuestions}
            correctAnswers={correctAnswers}
            quizType={quizType}
            hskLevel={hskLevel}
          />
        )}

        {/* Question */}
        {currentQuestion && (
          <QuizQuestion
            question={currentQuestion}
            onAnswerSelect={handleAnswerSelect}
            selectedAnswer={selectedAnswer}
            loading={submitting}
            timeRemaining={timeRemaining}
          />
        )}
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
  retryButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  retryButtonText: {
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: 'white',
  },
});

export default QuizScreen;
