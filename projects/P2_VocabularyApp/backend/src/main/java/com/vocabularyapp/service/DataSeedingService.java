package com.vocabularyapp.service;

import com.vocabularyapp.entity.HskVocabulary;
import com.vocabularyapp.repository.HskVocabularyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.List;

@Service
public class DataSeedingService {
    
    @Autowired
    private JsonParserService jsonParserService;
    
    @Autowired
    private HskVocabularyRepository hskVocabularyRepository;
    
    /**
     * Seed HSK vocabulary data from JSON file
     * @param hskLevel HSK level (1-5)
     * @return Number of records inserted
     */
    @Transactional
    public int seedHskVocabulary(Integer hskLevel) {
        try {
            // Check if data already exists for this level
            long existingCount = hskVocabularyRepository.countByHskLevel(hskLevel);
            if (existingCount > 0) {
                System.out.println("HSK Level " + hskLevel + " data already exists (" + existingCount + " records). Skipping...");
                return (int) existingCount; // Return existing count instead of 0
            }
            
            // Construct file path
            String filePath = "data/" + hskLevel + ".json";
            File file = new File(filePath);
            
            if (!file.exists()) {
                throw new RuntimeException("File not found: " + filePath);
            }
            
            // Parse JSON file
            List<HskVocabulary> vocabularyList = jsonParserService.parseHskVocabulary(filePath, hskLevel);
            
            if (vocabularyList.isEmpty()) {
                throw new RuntimeException("No vocabulary data found in file: " + filePath);
            }
            
            // Save to database
            hskVocabularyRepository.saveAll(vocabularyList);
            
            System.out.println("✅ Successfully seeded " + vocabularyList.size() + " vocabulary items for HSK Level " + hskLevel);
            return vocabularyList.size();
            
        } catch (Exception e) {
            System.err.println("Error seeding HSK Level " + hskLevel + ": " + e.getMessage());
            throw new RuntimeException("Failed to seed HSK Level " + hskLevel + ": " + e.getMessage(), e);
        }
    }
    
    /**
     * Get count for a specific HSK level
     * @param hskLevel HSK level (1-5)
     * @return Count of vocabulary items
     */
    public long getHskLevelCount(Integer hskLevel) {
        return hskVocabularyRepository.countByHskLevel(hskLevel);
    }
    
    /**
     * Get statistics for a specific HSK level
     * @param hskLevel HSK level (1-5)
     * @return Statistics string
     */
    public String getHskLevelStatistics(Integer hskLevel) {
        long count = hskVocabularyRepository.countByHskLevel(hskLevel);
        return "HSK Level " + hskLevel + ": " + count + " vocabulary items";
    }
    
    /**
     * Get total statistics for all HSK levels
     * @return Statistics string
     */
    public String getAllStatistics() {
        StringBuilder stats = new StringBuilder("HSK Vocabulary Statistics:\n");
        for (int level = 1; level <= 5; level++) {
            long count = hskVocabularyRepository.countByHskLevel(level);
            stats.append("Level ").append(level).append(": ").append(count).append(" items\n");
        }
        return stats.toString();
    }
}
