package com.vocabularyapp.controller;

import com.vocabularyapp.service.DataSeedingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/seeding")
public class DataSeedingController {
    
    @Autowired
    private DataSeedingService dataSeedingService;
    
    /**
     * Load HSK Level 1 vocabulary data
     */
    @PostMapping("/hsk1")
    public ResponseEntity<Map<String, Object>> seedHskLevel1() {
        System.out.println("🔵 HSK Level 1 seeding request received");
        return seedHskLevel(1);
    }
    
    /**
     * Load HSK Level 2 vocabulary data
     */
    @PostMapping("/hsk2")
    public ResponseEntity<Map<String, Object>> seedHskLevel2() {
        return seedHskLevel(2);
    }
    
    /**
     * Load HSK Level 3 vocabulary data
     */
    @PostMapping("/hsk3")
    public ResponseEntity<Map<String, Object>> seedHskLevel3() {
        return seedHskLevel(3);
    }
    
    /**
     * Load HSK Level 4 vocabulary data
     */
    @PostMapping("/hsk4")
    public ResponseEntity<Map<String, Object>> seedHskLevel4() {
        return seedHskLevel(4);
    }
    
    /**
     * Load HSK Level 5 vocabulary data
     */
    @PostMapping("/hsk5")
    public ResponseEntity<Map<String, Object>> seedHskLevel5() {
        return seedHskLevel(5);
    }
    
    /**
     * Load all HSK levels (1-5) vocabulary data
     */
    @PostMapping("/all")
    public ResponseEntity<Map<String, Object>> seedAllLevels() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Integer> results = new HashMap<>();
        int totalInserted = 0;
        
        try {
            for (int level = 1; level <= 5; level++) {
                int inserted = dataSeedingService.seedHskVocabulary(level);
                results.put("level" + level, inserted);
                totalInserted += inserted;
            }
            
            response.put("success", true);
            response.put("message", "All HSK levels seeded successfully");
            response.put("totalInserted", totalInserted);
            response.put("results", results);
            response.put("statistics", dataSeedingService.getAllStatistics());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error seeding all levels: " + e.getMessage());
            response.put("results", results);
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Test endpoint to verify controller is accessible
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, Object>> testEndpoint() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Data seeding controller is accessible");
        response.put("timestamp", java.time.LocalDateTime.now());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get statistics for all HSK levels
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            response.put("success", true);
            response.put("statistics", dataSeedingService.getAllStatistics());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error getting statistics: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Common method to seed a specific HSK level
     */
    private ResponseEntity<Map<String, Object>> seedHskLevel(int level) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Check if data already exists
            long existingCount = dataSeedingService.getHskLevelCount(level);
            int result = dataSeedingService.seedHskVocabulary(level);
            
            response.put("success", true);
            response.put("level", level);
            response.put("statistics", dataSeedingService.getHskLevelStatistics(level));
            
            if (existingCount > 0) {
                response.put("message", "HSK Level " + level + " data already exists (" + existingCount + " records)");
                response.put("inserted", 0);
                response.put("existing", (int) existingCount);
            } else {
                response.put("message", "HSK Level " + level + " seeded successfully (" + result + " records inserted)");
                response.put("inserted", result);
                response.put("existing", 0);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error seeding HSK Level " + level + ": " + e.getMessage());
            response.put("level", level);
            return ResponseEntity.status(500).body(response);
        }
    }
}
