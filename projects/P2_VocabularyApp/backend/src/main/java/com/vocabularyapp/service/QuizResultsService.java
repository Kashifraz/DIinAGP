package com.vocabularyapp.service;

import com.vocabularyapp.dto.QuizResultDto;
import com.vocabularyapp.entity.QuizAttempt;
import com.vocabularyapp.entity.QuizResult;
import com.vocabularyapp.entity.User;
import com.vocabularyapp.repository.QuizAttemptRepository;
import com.vocabularyapp.repository.QuizResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizResultsService {

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    /**
     * Get user's quiz history
     */
    @Transactional(readOnly = true)
    public List<QuizResultDto> getUserQuizHistory(User user) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserOrderByDateAttemptedDesc(user);
        
        return attempts.stream()
            .map(attempt -> {
                List<QuizResult> results = quizResultRepository.findByQuizAttempt(attempt);
                long correctCount = results.stream().filter(QuizResult::getIsCorrect).count();
                double percentage = (double) correctCount / attempt.getTotalQuestions() * 100;
                
                return new QuizResultDto(
                    attempt.getId(),
                    attempt.getScore(),
                    attempt.getTotalQuestions(),
                    percentage,
                    attempt.getQuizType(),
                    attempt.getHskLevel(),
                    "Quiz completed",
                    attempt.getDateAttempted()
                );
            })
            .collect(Collectors.toList());
    }

    /**
     * Get user's quiz history for a specific HSK level
     */
    @Transactional(readOnly = true)
    public List<QuizResultDto> getUserQuizHistoryByLevel(User user, Integer hskLevel) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserAndHskLevelOrderByDateAttemptedDesc(user, hskLevel);
        
        return attempts.stream()
            .map(attempt -> {
                List<QuizResult> results = quizResultRepository.findByQuizAttempt(attempt);
                long correctCount = results.stream().filter(QuizResult::getIsCorrect).count();
                double percentage = (double) correctCount / attempt.getTotalQuestions() * 100;
                
                return new QuizResultDto(
                    attempt.getId(),
                    attempt.getScore(),
                    attempt.getTotalQuestions(),
                    percentage,
                    attempt.getQuizType(),
                    attempt.getHskLevel(),
                    "Quiz completed",
                    attempt.getDateAttempted()
                );
            })
            .collect(Collectors.toList());
    }

    /**
     * Get user's quiz history for a specific quiz type
     */
    @Transactional(readOnly = true)
    public List<QuizResultDto> getUserQuizHistoryByType(User user, QuizAttempt.QuizType quizType) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserAndQuizTypeOrderByDateAttemptedDesc(user, quizType);
        
        return attempts.stream()
            .map(attempt -> {
                List<QuizResult> results = quizResultRepository.findByQuizAttempt(attempt);
                long correctCount = results.stream().filter(QuizResult::getIsCorrect).count();
                double percentage = (double) correctCount / attempt.getTotalQuestions() * 100;
                
                return new QuizResultDto(
                    attempt.getId(),
                    attempt.getScore(),
                    attempt.getTotalQuestions(),
                    percentage,
                    attempt.getQuizType(),
                    attempt.getHskLevel(),
                    "Quiz completed",
                    attempt.getDateAttempted()
                );
            })
            .collect(Collectors.toList());
    }

    /**
     * Get detailed quiz results for a specific quiz attempt
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getDetailedQuizResults(Long quizAttemptId) {
        Optional<QuizAttempt> attemptOpt = quizAttemptRepository.findById(quizAttemptId);
        
        if (!attemptOpt.isPresent()) {
            throw new RuntimeException("Quiz attempt not found with ID: " + quizAttemptId);
        }
        
        QuizAttempt attempt = attemptOpt.get();
        List<QuizResult> results = quizResultRepository.findByQuizAttempt(attempt);
        
        // Calculate statistics
        long correctCount = results.stream().filter(QuizResult::getIsCorrect).count();
        long incorrectCount = results.size() - correctCount;
        double percentage = (double) correctCount / attempt.getTotalQuestions() * 100;
        
        // Group results by correctness
        List<QuizResult> correctResults = results.stream()
            .filter(QuizResult::getIsCorrect)
            .collect(Collectors.toList());
            
        List<QuizResult> incorrectResults = results.stream()
            .filter(result -> !result.getIsCorrect())
            .collect(Collectors.toList());
        
        Map<String, Object> detailedResults = new HashMap<>();
        detailedResults.put("quizAttempt", new QuizResultDto(
            attempt.getId(),
            attempt.getScore(),
            attempt.getTotalQuestions(),
            percentage,
            attempt.getQuizType(),
            attempt.getHskLevel(),
            "Detailed quiz results",
            attempt.getDateAttempted()
        ));
        detailedResults.put("correctAnswers", correctResults);
        detailedResults.put("incorrectAnswers", incorrectResults);
        detailedResults.put("totalQuestions", attempt.getTotalQuestions());
        detailedResults.put("correctCount", correctCount);
        detailedResults.put("incorrectCount", incorrectCount);
        detailedResults.put("percentage", (int) percentage);
        
        return detailedResults;
    }

    /**
     * Get user's quiz statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getUserQuizStatistics(User user) {
        List<QuizAttempt> allAttempts = quizAttemptRepository.findByUserOrderByDateAttemptedDesc(user);
        
        if (allAttempts.isEmpty()) {
            return createEmptyStatistics();
        }
        
        // Calculate overall statistics
        int totalAttempts = allAttempts.size();
        int totalQuestions = allAttempts.stream().mapToInt(QuizAttempt::getTotalQuestions).sum();
        int totalCorrect = allAttempts.stream().mapToInt(QuizAttempt::getScore).sum();
        double overallPercentage = totalQuestions > 0 ? (double) totalCorrect / totalQuestions * 100 : 0;
        
        // Calculate statistics by HSK level
        Map<Integer, Map<String, Object>> levelStats = new HashMap<>();
        for (int level = 1; level <= 5; level++) {
            List<QuizAttempt> levelAttempts = quizAttemptRepository.findByUserAndHskLevelOrderByDateAttemptedDesc(user, level);
            if (!levelAttempts.isEmpty()) {
                Map<String, Object> levelStat = new HashMap<>();
                levelStat.put("totalAttempts", levelAttempts.size());
                levelStat.put("totalQuestions", levelAttempts.stream().mapToInt(QuizAttempt::getTotalQuestions).sum());
                levelStat.put("totalCorrect", levelAttempts.stream().mapToInt(QuizAttempt::getScore).sum());
                
                int levelTotalQuestions = levelAttempts.stream().mapToInt(QuizAttempt::getTotalQuestions).sum();
                int levelTotalCorrect = levelAttempts.stream().mapToInt(QuizAttempt::getScore).sum();
                double levelPercentage = levelTotalQuestions > 0 ? (double) levelTotalCorrect / levelTotalQuestions * 100 : 0;
                levelStat.put("percentage", (int) levelPercentage);
                
                levelStats.put(level, levelStat);
            }
        }
        
        // Calculate statistics by quiz type
        Map<String, Map<String, Object>> typeStats = new HashMap<>();
        for (QuizAttempt.QuizType type : QuizAttempt.QuizType.values()) {
            List<QuizAttempt> typeAttempts = quizAttemptRepository.findByUserAndQuizTypeOrderByDateAttemptedDesc(user, type);
            if (!typeAttempts.isEmpty()) {
                Map<String, Object> typeStat = new HashMap<>();
                typeStat.put("totalAttempts", typeAttempts.size());
                typeStat.put("totalQuestions", typeAttempts.stream().mapToInt(QuizAttempt::getTotalQuestions).sum());
                typeStat.put("totalCorrect", typeAttempts.stream().mapToInt(QuizAttempt::getScore).sum());
                
                int typeTotalQuestions = typeAttempts.stream().mapToInt(QuizAttempt::getTotalQuestions).sum();
                int typeTotalCorrect = typeAttempts.stream().mapToInt(QuizAttempt::getScore).sum();
                double typePercentage = typeTotalQuestions > 0 ? (double) typeTotalCorrect / typeTotalQuestions * 100 : 0;
                typeStat.put("percentage", (int) typePercentage);
                
                typeStats.put(type.name(), typeStat);
            }
        }
        
        // Recent activity (last 7 days)
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<QuizAttempt> recentAttempts = quizAttemptRepository.findByUserAndDateAfter(user, weekAgo);
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("overall", Map.of(
            "totalAttempts", totalAttempts,
            "totalQuestions", totalQuestions,
            "totalCorrect", totalCorrect,
            "percentage", (int) overallPercentage
        ));
        statistics.put("byLevel", levelStats);
        statistics.put("byType", typeStats);
        statistics.put("recentActivity", Map.of(
            "attemptsLastWeek", recentAttempts.size(),
            "questionsLastWeek", recentAttempts.stream().mapToInt(QuizAttempt::getTotalQuestions).sum(),
            "correctLastWeek", recentAttempts.stream().mapToInt(QuizAttempt::getScore).sum()
        ));
        
        return statistics;
    }

    /**
     * Get quiz review data for a specific attempt
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getQuizReview(Long quizAttemptId) {
        Optional<QuizAttempt> attemptOpt = quizAttemptRepository.findById(quizAttemptId);
        
        if (!attemptOpt.isPresent()) {
            throw new RuntimeException("Quiz attempt not found with ID: " + quizAttemptId);
        }
        
        QuizAttempt attempt = attemptOpt.get();
        List<QuizResult> results = quizResultRepository.findByQuizAttempt(attempt);
        
        // Create review data with explanations
        List<Map<String, Object>> reviewItems = new ArrayList<>();
        
        for (QuizResult result : results) {
            Map<String, Object> reviewItem = new HashMap<>();
            reviewItem.put("questionId", result.getQuestionWord().getId());
            reviewItem.put("chineseCharacter", result.getQuestionWord().getSimplifiedChinese());
            reviewItem.put("pinyin", result.getQuestionWord().getPinyin());
            reviewItem.put("englishMeaning", result.getQuestionWord().getEnglishMeaning());
            reviewItem.put("userAnswer", result.getUserAnswer());
            reviewItem.put("isCorrect", result.getIsCorrect());
            reviewItem.put("correctAnswer", getCorrectAnswerForQuizType(attempt.getQuizType(), result.getQuestionWord()));
            reviewItem.put("explanation", generateExplanation(result, attempt.getQuizType()));
            
            reviewItems.add(reviewItem);
        }
        
        Map<String, Object> review = new HashMap<>();
        long correctCount = results.stream().filter(QuizResult::getIsCorrect).count();
        double percentage = (double) correctCount / attempt.getTotalQuestions() * 100;
        
        review.put("quizAttempt", new QuizResultDto(
            attempt.getId(),
            attempt.getScore(),
            attempt.getTotalQuestions(),
            percentage,
            attempt.getQuizType(),
            attempt.getHskLevel(),
            "Quiz review",
            attempt.getDateAttempted()
        ));
        review.put("reviewItems", reviewItems);
        
        return review;
    }

    /**
     * Get correct answer format based on quiz type
     */
    private String getCorrectAnswerForQuizType(QuizAttempt.QuizType quizType, com.vocabularyapp.entity.HskVocabulary word) {
        switch (quizType) {
            case EASY:
                return word.getEnglishMeaning();
            case MEDIUM:
                return word.getSimplifiedChinese() + " (" + word.getPinyin() + ")";
            case HARD:
                return word.getSimplifiedChinese();
            default:
                return word.getEnglishMeaning();
        }
    }

    /**
     * Generate explanation for a quiz result
     */
    private String generateExplanation(QuizResult result, QuizAttempt.QuizType quizType) {
        if (result.getIsCorrect()) {
            return "Correct! Well done!";
        } else {
            String correctAnswer = getCorrectAnswerForQuizType(quizType, result.getQuestionWord());
            return "Incorrect. The correct answer is: " + correctAnswer;
        }
    }

    /**
     * Create empty statistics for new users
     */
    private Map<String, Object> createEmptyStatistics() {
        Map<String, Object> emptyStats = new HashMap<>();
        emptyStats.put("overall", Map.of(
            "totalAttempts", 0,
            "totalQuestions", 0,
            "totalCorrect", 0,
            "percentage", 0
        ));
        emptyStats.put("byLevel", new HashMap<>());
        emptyStats.put("byType", new HashMap<>());
        emptyStats.put("recentActivity", Map.of(
            "attemptsLastWeek", 0,
            "questionsLastWeek", 0,
            "correctLastWeek", 0
        ));
        return emptyStats;
    }
}
