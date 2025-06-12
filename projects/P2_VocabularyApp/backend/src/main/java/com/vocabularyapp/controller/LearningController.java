package com.vocabularyapp.controller;

import com.vocabularyapp.entity.HskVocabulary;
import com.vocabularyapp.entity.LearningSession;
import com.vocabularyapp.dto.VocabularyDto;
import com.vocabularyapp.service.LearningService;
import com.vocabularyapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning")
public class LearningController {
    
    @Autowired
    private LearningService learningService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Test endpoint to verify learning controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testLearningEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Learning controller is working!");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Debug endpoint to check session and progress data
     */
    @GetMapping("/debug/session/{sessionId}")
    public ResponseEntity<Map<String, Object>> debugSession(@PathVariable Long sessionId) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Debug information for session " + sessionId);
            response.put("data", learningService.getSessionDebugInfo(sessionId));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Debug failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * Start a new learning session for a specific HSK level
     */
    @PostMapping("/start/{hskLevel}")
    public ResponseEntity<Map<String, Object>> startLearningSession(
            @PathVariable Integer hskLevel,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Extract user ID from JWT token
            String jwt = token.substring(7); // Remove "Bearer " prefix
            Long userId = jwtUtil.extractUserId(jwt);
            
            // Validate HSK level
            if (hskLevel < 1 || hskLevel > 5) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "HSK level must be between 1 and 5");
                return ResponseEntity.badRequest().body(response);
            }
            
            LearningSession session = learningService.startLearningSession(userId, hskLevel);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Learning session started successfully");
            response.put("data", Map.of(
                "sessionId", session.getId(),
                "hskLevel", session.getHskLevel(),
                "wordsPerSession", session.getWordsPerSession(),
                "currentWordIndex", session.getCurrentWordIndex(),
                "isCompleted", session.getIsCompleted()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to start learning session: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get current word in the learning session
     */
    @GetMapping("/session/{sessionId}/current-word")
    public ResponseEntity<Map<String, Object>> getCurrentWord(@PathVariable Long sessionId) {
        try {
            Optional<VocabularyDto> wordOpt = learningService.getCurrentWord(sessionId);
            
            Map<String, Object> response = new HashMap<>();
            if (wordOpt.isPresent()) {
                response.put("success", true);
                response.put("data", wordOpt.get());
            } else {
                response.put("success", false);
                response.put("message", "No current word found or session completed");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get current word: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Mark a word as learned and move to next word
     */
    @PostMapping("/session/{sessionId}/learn/{vocabularyId}")
    public ResponseEntity<Map<String, Object>> markWordAsLearned(
            @PathVariable Long sessionId,
            @PathVariable Long vocabularyId) {
        
        try {
            LearningSession session = learningService.markWordAsLearned(sessionId, vocabularyId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Word marked as learned successfully");
            response.put("data", Map.of(
                "sessionId", session.getId(),
                "currentWordIndex", session.getCurrentWordIndex(),
                "isCompleted", session.getIsCompleted()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to mark word as learned: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get session progress
     */
    @GetMapping("/session/{sessionId}/progress")
    public ResponseEntity<Map<String, Object>> getSessionProgress(@PathVariable Long sessionId) {
        try {
            LearningService.LearningSessionProgress progress = learningService.getSessionProgress(sessionId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", progress);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get session progress: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get user's learning statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getUserLearningStatistics(
            @RequestHeader("Authorization") String token) {
        
        try {
            // Extract user ID from JWT token
            String jwt = token.substring(7); // Remove "Bearer " prefix
            Long userId = jwtUtil.extractUserId(jwt);
            
            LearningService.LearningStatistics statistics = learningService.getUserLearningStatistics(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", statistics);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get learning statistics: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Get next session for a user and HSK level
     */
    @GetMapping("/next-session/{hskLevel}")
    public ResponseEntity<Map<String, Object>> getNextSession(
            @PathVariable Integer hskLevel,
            @RequestHeader("Authorization") String token) {
        
        try {
            // Extract user ID from JWT token
            String jwt = token.substring(7); // Remove "Bearer " prefix
            Long userId = jwtUtil.extractUserId(jwt);
            
            // Validate HSK level
            if (hskLevel < 1 || hskLevel > 5) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "HSK level must be between 1 and 5");
                return ResponseEntity.badRequest().body(response);
            }
            
            LearningSession session = learningService.getNextSession(userId, hskLevel);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Next session retrieved successfully");
            response.put("data", Map.of(
                "sessionId", session.getId(),
                "hskLevel", session.getHskLevel(),
                "wordsPerSession", session.getWordsPerSession(),
                "currentWordIndex", session.getCurrentWordIndex(),
                "isCompleted", session.getIsCompleted()
            ));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to get next session: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
