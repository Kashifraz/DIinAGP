package com.vocabularyapp.controller;

import com.vocabularyapp.entity.HskVocabulary;
import com.vocabularyapp.service.VocabularyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/vocabulary")
public class VocabularyController {
    
    @Autowired
    private VocabularyService vocabularyService;
    
    /**
     * Get vocabulary by HSK level with pagination
     * GET /api/vocabulary/level/{hskLevel}?page=0&size=10
     */
    @GetMapping("/level/{hskLevel}")
    public ResponseEntity<Map<String, Object>> getVocabularyByLevel(
            @PathVariable Integer hskLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Page<HskVocabulary> vocabularyPage;
            
            if (sortBy != null && !sortBy.isEmpty()) {
                vocabularyPage = vocabularyService.getVocabularyByLevelWithSorting(
                    hskLevel, page, size, sortBy, sortDirection);
            } else {
                vocabularyPage = vocabularyService.getVocabularyByLevel(hskLevel, page, size);
            }
            
            response.put("success", true);
            response.put("data", vocabularyPage.getContent());
            response.put("pagination", Map.of(
                "currentPage", vocabularyPage.getNumber(),
                "totalPages", vocabularyPage.getTotalPages(),
                "totalElements", vocabularyPage.getTotalElements(),
                "size", vocabularyPage.getSize(),
                "hasNext", vocabularyPage.hasNext(),
                "hasPrevious", vocabularyPage.hasPrevious()
            ));
            response.put("hskLevel", hskLevel);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving vocabulary: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Get specific vocabulary item by ID
     * GET /api/vocabulary/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getVocabularyById(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<HskVocabulary> vocabulary = vocabularyService.getVocabularyById(id);
            
            if (vocabulary.isPresent()) {
                response.put("success", true);
                response.put("data", vocabulary.get());
            } else {
                response.put("success", false);
                response.put("message", "Vocabulary item not found");
                return ResponseEntity.status(404).body(response);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving vocabulary item: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Search vocabulary by Chinese characters
     * GET /api/vocabulary/search/chinese?q=你好&page=0&size=10
     */
    @GetMapping("/search/chinese")
    public ResponseEntity<Map<String, Object>> searchByChinese(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Page<HskVocabulary> vocabularyPage = vocabularyService.searchByChinese(q, page, size);
            
            response.put("success", true);
            response.put("data", vocabularyPage.getContent());
            response.put("pagination", Map.of(
                "currentPage", vocabularyPage.getNumber(),
                "totalPages", vocabularyPage.getTotalPages(),
                "totalElements", vocabularyPage.getTotalElements(),
                "size", vocabularyPage.getSize(),
                "hasNext", vocabularyPage.hasNext(),
                "hasPrevious", vocabularyPage.hasPrevious()
            ));
            response.put("searchTerm", q);
            response.put("searchType", "chinese");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error searching vocabulary: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Search vocabulary by English meaning
     * GET /api/vocabulary/search/english?q=hello&page=0&size=10
     */
    @GetMapping("/search/english")
    public ResponseEntity<Map<String, Object>> searchByEnglish(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Page<HskVocabulary> vocabularyPage = vocabularyService.searchByEnglish(q, page, size);
            
            response.put("success", true);
            response.put("data", vocabularyPage.getContent());
            response.put("pagination", Map.of(
                "currentPage", vocabularyPage.getNumber(),
                "totalPages", vocabularyPage.getTotalPages(),
                "totalElements", vocabularyPage.getTotalElements(),
                "size", vocabularyPage.getSize(),
                "hasNext", vocabularyPage.hasNext(),
                "hasPrevious", vocabularyPage.hasPrevious()
            ));
            response.put("searchTerm", q);
            response.put("searchType", "english");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error searching vocabulary: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Search vocabulary by pinyin
     * GET /api/vocabulary/search/pinyin?q=nihao&page=0&size=10
     */
    @GetMapping("/search/pinyin")
    public ResponseEntity<Map<String, Object>> searchByPinyin(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Page<HskVocabulary> vocabularyPage = vocabularyService.searchByPinyin(q, page, size);
            
            response.put("success", true);
            response.put("data", vocabularyPage.getContent());
            response.put("pagination", Map.of(
                "currentPage", vocabularyPage.getNumber(),
                "totalPages", vocabularyPage.getTotalPages(),
                "totalElements", vocabularyPage.getTotalElements(),
                "size", vocabularyPage.getSize(),
                "hasNext", vocabularyPage.hasNext(),
                "hasPrevious", vocabularyPage.hasPrevious()
            ));
            response.put("searchTerm", q);
            response.put("searchType", "pinyin");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error searching vocabulary: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Search vocabulary by HSK level and search term
     * GET /api/vocabulary/search/level/{hskLevel}?q=你好&page=0&size=10
     */
    @GetMapping("/search/level/{hskLevel}")
    public ResponseEntity<Map<String, Object>> searchByLevelAndTerm(
            @PathVariable Integer hskLevel,
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Page<HskVocabulary> vocabularyPage = vocabularyService.searchVocabularyByLevelAndTerm(
                hskLevel, q, page, size);
            
            response.put("success", true);
            response.put("data", vocabularyPage.getContent());
            response.put("pagination", Map.of(
                "currentPage", vocabularyPage.getNumber(),
                "totalPages", vocabularyPage.getTotalPages(),
                "totalElements", vocabularyPage.getTotalElements(),
                "size", vocabularyPage.getSize(),
                "hasNext", vocabularyPage.hasNext(),
                "hasPrevious", vocabularyPage.hasPrevious()
            ));
            response.put("searchTerm", q);
            response.put("hskLevel", hskLevel);
            response.put("searchType", "level_and_term");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error searching vocabulary: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Get vocabulary statistics
     * GET /api/vocabulary/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getVocabularyStatistics() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Map<Integer, Long> statistics = vocabularyService.getAllVocabularyStatistics();
            
            response.put("success", true);
            response.put("statistics", statistics);
            response.put("totalVocabulary", statistics.values().stream().mapToLong(Long::longValue).sum());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving statistics: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Get random vocabulary for a specific HSK level
     * GET /api/vocabulary/random/level/{hskLevel}?count=10
     */
    @GetMapping("/random/level/{hskLevel}")
    public ResponseEntity<Map<String, Object>> getRandomVocabulary(
            @PathVariable Integer hskLevel,
            @RequestParam(defaultValue = "10") int count) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<HskVocabulary> randomVocabulary = vocabularyService.getRandomVocabularyByLevel(hskLevel, count);
            
            response.put("success", true);
            response.put("data", randomVocabulary);
            response.put("hskLevel", hskLevel);
            response.put("count", randomVocabulary.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error retrieving random vocabulary: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
