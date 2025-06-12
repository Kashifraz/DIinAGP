package com.vocabularyapp.controller;

import com.vocabularyapp.dto.*;
import com.vocabularyapp.entity.QuizAttempt;
import com.vocabularyapp.entity.User;
import com.vocabularyapp.service.QuizSessionService;
import com.vocabularyapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:19006")
public class QuizController {
    
    @Autowired
    private QuizSessionService quizSessionService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Start a new quiz session
     */
    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startQuiz(
            @RequestHeader("Authorization") String token,
            @RequestParam Integer hskLevel,
            @RequestParam(defaultValue = "EASY") String quizType) {
        
        System.out.println("🎯 Quiz start endpoint called with hskLevel: " + hskLevel + ", quizType: " + quizType);
        
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            System.out.println("🎯 Extracted userId: " + userId);
            
            User user = new User();
            user.setId(userId);
            
            QuizAttempt.QuizType type = QuizAttempt.QuizType.valueOf(quizType.toUpperCase());
            System.out.println("🎯 Converted quiz type: " + type);
            System.out.println("🎯 Quiz type enum name: " + type.name());
            QuizAttempt quizAttempt = quizSessionService.startQuizSession(user, hskLevel, type);
            
            System.out.println("🎯 Quiz session started with ID: " + quizAttempt.getId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz session started successfully");
            response.put("data", Map.of(
                "quizAttemptId", quizAttempt.getId(),
                "hskLevel", quizAttempt.getHskLevel(),
                "quizType", quizAttempt.getQuizType(),
                "totalQuestions", quizAttempt.getTotalQuestions()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("🎯 Error in quiz start: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to start quiz session: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get a specific quiz question
     */
    @GetMapping("/question/{quizAttemptId}/{questionNumber}")
    public ResponseEntity<Map<String, Object>> getQuizQuestion(
            @RequestHeader("Authorization") String token,
            @PathVariable Long quizAttemptId,
            @PathVariable Integer questionNumber) {
        
        try {
            String jwt = token.substring(7);
            jwtUtil.extractUserId(jwt); // Validate token
            
            QuizQuestionDto question = quizSessionService.getQuizQuestion(quizAttemptId, questionNumber);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", question);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get quiz question: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Submit a quiz answer
     */
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitAnswer(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestBody QuizSubmissionDto submission) {
        
        System.out.println("🎯 Quiz submit endpoint called");
        System.out.println("🎯 Authorization header: " + (token != null ? "Present" : "Missing"));
        System.out.println("🎯 Submission data: " + submission);
        
        try {
            // For debugging, we'll allow the request even without auth
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                Long userId = jwtUtil.extractUserId(jwt);
                System.out.println("🎯 Extracted userId: " + userId);
            } else {
                System.out.println("🎯 No valid token provided, proceeding without authentication");
            }
            
            boolean isCorrect = quizSessionService.submitQuizAnswer(submission);
            System.out.println("🎯 Answer is correct: " + isCorrect);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Answer submitted successfully");
            response.put("data", Map.of(
                "isCorrect", isCorrect,
                "questionNumber", submission.getQuestionNumber()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("🎯 Error in quiz submit: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to submit answer: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Complete a quiz session
     */
    @PostMapping("/complete/{quizAttemptId}")
    public ResponseEntity<Map<String, Object>> completeQuiz(
            @RequestHeader("Authorization") String token,
            @PathVariable Long quizAttemptId) {
        
        try {
            String jwt = token.substring(7);
            jwtUtil.extractUserId(jwt); // Validate token
            
            QuizResultDto result = quizSessionService.completeQuizSession(quizAttemptId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Quiz completed successfully");
            response.put("data", result);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to complete quiz: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get quiz session progress
     */
    @GetMapping("/progress/{quizAttemptId}")
    public ResponseEntity<Map<String, Object>> getQuizProgress(
            @RequestHeader("Authorization") String token,
            @PathVariable Long quizAttemptId) {
        
        try {
            String jwt = token.substring(7);
            jwtUtil.extractUserId(jwt); // Validate token
            
            Map<String, Object> progress = quizSessionService.getQuizSessionProgress(quizAttemptId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", progress);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get quiz progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get user's quiz history
     */
    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getQuizHistory(
            @RequestHeader("Authorization") String token) {
        
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            User user = new User();
            user.setId(userId);
            
            List<QuizAttempt> history = quizSessionService.getUserQuizHistory(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
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
     * Get user's quiz statistics
     */
    @GetMapping("/statistics/{hskLevel}")
    public ResponseEntity<Map<String, Object>> getQuizStatistics(
            @RequestHeader("Authorization") String token,
            @PathVariable Integer hskLevel) {
        
        try {
            String jwt = token.substring(7);
            Long userId = jwtUtil.extractUserId(jwt);
            
            User user = new User();
            user.setId(userId);
            
            Map<String, Object> statistics = quizSessionService.getUserQuizStatistics(user, hskLevel);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
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
     * Test endpoint for quiz functionality
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testQuiz() {
        System.out.println("🎯 Quiz test endpoint called");
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Quiz API is working");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
