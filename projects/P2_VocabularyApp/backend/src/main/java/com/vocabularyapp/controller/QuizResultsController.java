package com.vocabularyapp.controller;

import com.vocabularyapp.dto.QuizResultDto;
import com.vocabularyapp.entity.QuizAttempt;
import com.vocabularyapp.entity.User;
import com.vocabularyapp.service.QuizResultsService;
import com.vocabularyapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz-results")
@CrossOrigin(origins = "http://localhost:19006")
public class QuizResultsController {

    @Autowired
    private QuizResultsService quizResultsService;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Get user's quiz history
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getQuizHistory(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);

            User user = new User();
            user.setId(userId);

            List<QuizResultDto> history = quizResultsService.getUserQuizHistory(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz history retrieved successfully");
            response.put("data", history);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get quiz history: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get user's quiz history for a specific HSK level
     */
    @GetMapping("/history/level/{hskLevel}")
    public ResponseEntity<Map<String, Object>> getQuizHistoryByLevel(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer hskLevel) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);

            User user = new User();
            user.setId(userId);

            List<QuizResultDto> history = quizResultsService.getUserQuizHistoryByLevel(user, hskLevel);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz history for HSK level " + hskLevel + " retrieved successfully");
            response.put("data", history);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get quiz history: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get user's quiz history for a specific quiz type
     */
    @GetMapping("/history/type/{quizType}")
    public ResponseEntity<Map<String, Object>> getQuizHistoryByType(
            @RequestHeader("Authorization") String token,
            @PathVariable String quizType) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);

            User user = new User();
            user.setId(userId);

            QuizAttempt.QuizType type = QuizAttempt.QuizType.valueOf(quizType.toUpperCase());
            List<QuizResultDto> history = quizResultsService.getUserQuizHistoryByType(user, type);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz history for " + quizType + " mode retrieved successfully");
            response.put("data", history);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get quiz history: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get detailed quiz results for a specific quiz attempt
     */
    @GetMapping("/detailed/{quizAttemptId}")
    public ResponseEntity<Map<String, Object>> getDetailedQuizResults(
            @RequestHeader("Authorization") String token,
            @PathVariable Long quizAttemptId) {
        try {
            String jwt = token.substring(7);
            jwtUtil.extractUserId(jwt); // Validate token

            Map<String, Object> detailedResults = quizResultsService.getDetailedQuizResults(quizAttemptId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Detailed quiz results retrieved successfully");
            response.put("data", detailedResults);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get detailed quiz results: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get user's quiz statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getQuizStatistics(@RequestHeader("Authorization") String token) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);

            User user = new User();
            user.setId(userId);

            Map<String, Object> statistics = quizResultsService.getUserQuizStatistics(user);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz statistics retrieved successfully");
            response.put("data", statistics);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get quiz statistics: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get quiz review for a specific attempt
     */
    @GetMapping("/review/{quizAttemptId}")
    public ResponseEntity<Map<String, Object>> getQuizReview(
            @RequestHeader("Authorization") String token,
            @PathVariable Long quizAttemptId) {
        try {
            String jwt = token.substring(7);
            jwtUtil.extractUserId(jwt); // Validate token

            Map<String, Object> review = quizResultsService.getQuizReview(quizAttemptId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz review retrieved successfully");
            response.put("data", review);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get quiz review: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Get quiz statistics for a specific HSK level
     */
    @GetMapping("/statistics/level/{hskLevel}")
    public ResponseEntity<Map<String, Object>> getQuizStatisticsByLevel(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer hskLevel) {
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);

            User user = new User();
            user.setId(userId);

            // Get statistics for specific level
            List<QuizResultDto> levelHistory = quizResultsService.getUserQuizHistoryByLevel(user, hskLevel);
            
            // Calculate level-specific statistics
            int totalAttempts = levelHistory.size();
            int totalQuestions = levelHistory.stream().mapToInt(QuizResultDto::getTotalQuestions).sum();
            int totalCorrect = levelHistory.stream().mapToInt(QuizResultDto::getScore).sum();
            double percentage = totalQuestions > 0 ? (double) totalCorrect / totalQuestions * 100 : 0;

            Map<String, Object> levelStats = new HashMap<>();
            levelStats.put("hskLevel", hskLevel);
            levelStats.put("totalAttempts", totalAttempts);
            levelStats.put("totalQuestions", totalQuestions);
            levelStats.put("totalCorrect", totalCorrect);
            levelStats.put("percentage", (int) percentage);
            levelStats.put("averageScore", totalAttempts > 0 ? (double) totalCorrect / totalAttempts : 0);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz statistics for HSK level " + hskLevel + " retrieved successfully");
            response.put("data", levelStats);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get quiz statistics: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
