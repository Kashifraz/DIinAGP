package com.vocabularyapp.service;

import com.vocabularyapp.dto.QuizQuestionDto;
import com.vocabularyapp.dto.QuizResultDto;
import com.vocabularyapp.dto.QuizSubmissionDto;
import com.vocabularyapp.entity.*;
import com.vocabularyapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class QuizSessionService {
    
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;
    
    @Autowired
    private QuizResultRepository quizResultRepository;
    
    @Autowired
    private HskVocabularyRepository hskVocabularyRepository;
    
    @Autowired
    private QuizGenerationService quizGenerationService;
    
    // In-memory storage for active quiz sessions
    private final Map<Long, List<QuizQuestionDto>> activeQuizSessions = new ConcurrentHashMap<>();
    
    /**
     * Start a new quiz session
     */
    @Transactional
    public QuizAttempt startQuizSession(User user, Integer hskLevel, QuizAttempt.QuizType quizType) {
        // Generate quiz questions based on quiz type
        List<QuizQuestionDto> questions;
        System.out.println("🎯 QuizSessionService - Starting quiz with type: " + quizType);
        System.out.println("🎯 QuizSessionService - Quiz type enum: " + quizType.getClass().getName());
        System.out.println("🎯 QuizSessionService - Is HARD? " + (quizType == QuizAttempt.QuizType.HARD));
        switch (quizType) {
            case EASY:
                System.out.println("🎯 QuizSessionService - Calling EASY mode generation");
                questions = quizGenerationService.generateEasyModeQuiz(user, hskLevel);
                break;
            case MEDIUM:
                System.out.println("🎯 QuizSessionService - Calling MEDIUM mode generation");
                questions = quizGenerationService.generateMediumModeQuiz(user, hskLevel);
                break;
            case HARD:
                System.out.println("🎯 QuizSessionService - Calling HARD mode generation");
                questions = quizGenerationService.generateHardModeQuiz(user, hskLevel);
                break;
            default:
                System.out.println("🎯 QuizSessionService - Default case called with type: " + quizType);
                questions = quizGenerationService.generateEasyModeQuiz(user, hskLevel);
        }
        
        // Create quiz attempt
        QuizAttempt quizAttempt = new QuizAttempt(user, hskLevel, quizType, 0, questions.size());
        quizAttempt = quizAttemptRepository.save(quizAttempt);
        
        // Store questions in memory for the session
        activeQuizSessions.put(quizAttempt.getId(), questions);
        
        return quizAttempt;
    }
    
    /**
     * Get a specific question from an active quiz session
     */
    public QuizQuestionDto getQuizQuestion(Long quizAttemptId, Integer questionNumber) {
        List<QuizQuestionDto> questions = activeQuizSessions.get(quizAttemptId);
        
        if (questions == null || questions.isEmpty()) {
            throw new RuntimeException("Quiz session not found or no questions available");
        }
        
        if (questionNumber < 1 || questionNumber > questions.size()) {
            throw new RuntimeException("Invalid question number: " + questionNumber);
        }
        
        QuizQuestionDto question = questions.get(questionNumber - 1);
        question.setQuestionNumber(questionNumber);
        question.setTotalQuestions(questions.size());
        
        return question;
    }
    
    /**
     * Submit an answer for a quiz question
     */
    @Transactional
    public boolean submitQuizAnswer(QuizSubmissionDto submission) {
        List<QuizQuestionDto> questions = activeQuizSessions.get(submission.getQuizAttemptId());
        
        if (questions == null) {
            throw new RuntimeException("Quiz session not found");
        }
        
        if (submission.getQuestionNumber() < 1 || submission.getQuestionNumber() > questions.size()) {
            throw new RuntimeException("Invalid question number");
        }
        
        QuizQuestionDto question = questions.get(submission.getQuestionNumber() - 1);
        
        // Validate the answer using the quiz type
        boolean isCorrect = quizGenerationService.validateAnswer(question.getQuestionId(), submission.getUserAnswer(), submission.getQuizType());
        
        // Save the quiz result
        Optional<QuizAttempt> quizAttemptOpt = quizAttemptRepository.findById(submission.getQuizAttemptId());
        Optional<HskVocabulary> wordOpt = hskVocabularyRepository.findById(question.getQuestionId());
        
        if (quizAttemptOpt.isPresent() && wordOpt.isPresent()) {
            QuizResult quizResult = new QuizResult(
                quizAttemptOpt.get(),
                wordOpt.get(),
                submission.getUserAnswer(),
                isCorrect
            );
            quizResultRepository.save(quizResult);
        }
        
        return isCorrect;
    }
    
    /**
     * Complete a quiz session and calculate final score
     */
    @Transactional
    public QuizResultDto completeQuizSession(Long quizAttemptId) {
        Optional<QuizAttempt> quizAttemptOpt = quizAttemptRepository.findById(quizAttemptId);
        
        if (!quizAttemptOpt.isPresent()) {
            throw new RuntimeException("Quiz attempt not found");
        }
        
        QuizAttempt quizAttempt = quizAttemptOpt.get();
        
        // Get all quiz results for this attempt
        List<QuizResult> results = quizResultRepository.findByQuizAttempt(quizAttempt);
        
        // Calculate score
        int correctAnswers = (int) results.stream().filter(QuizResult::getIsCorrect).count();
        int totalQuestions = results.size();
        
        // Update quiz attempt with final score
        quizAttempt.setScore(correctAnswers);
        quizAttempt.setTotalQuestions(totalQuestions);
        quizAttemptRepository.save(quizAttempt);
        
        // Calculate percentage
        double percentage = totalQuestions > 0 ? (double) correctAnswers / totalQuestions * 100 : 0;
        
        // Generate result message
        String message = generateResultMessage(percentage);
        
        // Remove from active sessions
        activeQuizSessions.remove(quizAttemptId);
        
        return new QuizResultDto(
            quizAttemptId,
            correctAnswers,
            totalQuestions,
            percentage,
            quizAttempt.getQuizType(),
            quizAttempt.getHskLevel(),
            message,
            quizAttempt.getDateAttempted()
        );
    }
    
    /**
     * Get quiz session progress
     */
    public Map<String, Object> getQuizSessionProgress(Long quizAttemptId) {
        Optional<QuizAttempt> quizAttemptOpt = quizAttemptRepository.findById(quizAttemptId);
        
        if (!quizAttemptOpt.isPresent()) {
            throw new RuntimeException("Quiz attempt not found");
        }
        
        QuizAttempt quizAttempt = quizAttemptOpt.get();
        List<QuizResult> results = quizResultRepository.findByQuizAttempt(quizAttempt);
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("quizAttemptId", quizAttemptId);
        progress.put("currentQuestion", results.size() + 1);
        progress.put("totalQuestions", quizAttempt.getTotalQuestions());
        progress.put("answeredQuestions", results.size());
        progress.put("correctAnswers", (int) results.stream().filter(QuizResult::getIsCorrect).count());
        progress.put("quizType", quizAttempt.getQuizType());
        progress.put("hskLevel", quizAttempt.getHskLevel());
        
        return progress;
    }
    
    /**
     * Generate result message based on performance
     */
    private String generateResultMessage(double percentage) {
        if (percentage >= 90) {
            return "Excellent! You're a Chinese vocabulary master! 🌟";
        } else if (percentage >= 80) {
            return "Great job! You're doing very well! 👍";
        } else if (percentage >= 70) {
            return "Good work! Keep practicing to improve! 💪";
        } else if (percentage >= 60) {
            return "Not bad! Review the vocabulary and try again! 📚";
        } else {
            return "Keep studying! Practice makes perfect! 🎯";
        }
    }
    
    /**
     * Get user's quiz history
     */
    public List<QuizAttempt> getUserQuizHistory(User user) {
        return quizAttemptRepository.findByUserOrderByDateAttemptedDesc(user);
    }
    
    /**
     * Get user's quiz statistics
     */
    public Map<String, Object> getUserQuizStatistics(User user, Integer hskLevel) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserAndHskLevelOrderByDateAttemptedDesc(user, hskLevel);
        
        if (attempts.isEmpty()) {
            return new HashMap<>();
        }
        
        double averageScore = quizAttemptRepository.findAverageScoreByUserAndHskLevel(user, hskLevel);
        long totalAttempts = quizAttemptRepository.countByUserAndHskLevel(user, hskLevel);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAttempts", totalAttempts);
        stats.put("averageScore", averageScore);
        stats.put("bestScore", attempts.stream().mapToInt(QuizAttempt::getScore).max().orElse(0));
        stats.put("recentAttempts", attempts.subList(0, Math.min(5, attempts.size())));
        
        return stats;
    }
}
