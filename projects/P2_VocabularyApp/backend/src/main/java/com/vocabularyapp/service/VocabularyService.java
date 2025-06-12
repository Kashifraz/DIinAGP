package com.vocabularyapp.service;

import com.vocabularyapp.entity.HskVocabulary;
import com.vocabularyapp.repository.HskVocabularyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VocabularyService {
    
    @Autowired
    private HskVocabularyRepository vocabularyRepository;
    
    /**
     * Get vocabulary by HSK level with pagination
     * @param hskLevel HSK level (1-5)
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of vocabulary items
     */
    public Page<HskVocabulary> getVocabularyByLevel(Integer hskLevel, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return vocabularyRepository.findByHskLevel(hskLevel, pageable);
    }
    
    /**
     * Get vocabulary by HSK level with pagination and sorting
     * @param hskLevel HSK level (1-5)
     * @param page Page number (0-based)
     * @param size Page size
     * @param sortBy Field to sort by
     * @param sortDirection Sort direction (asc/desc)
     * @return Page of vocabulary items
     */
    public Page<HskVocabulary> getVocabularyByLevelWithSorting(
            Integer hskLevel, int page, int size, String sortBy, String sortDirection) {
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? 
            Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        return vocabularyRepository.findByHskLevel(hskLevel, pageable);
    }
    
    /**
     * Get specific vocabulary item by ID
     * @param id Vocabulary item ID
     * @return Vocabulary item or null
     */
    public Optional<HskVocabulary> getVocabularyById(Long id) {
        return vocabularyRepository.findById(id);
    }
    
    /**
     * Search vocabulary by Chinese characters
     * @param chinese Simplified Chinese characters
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of matching vocabulary items
     */
    public Page<HskVocabulary> searchByChinese(String chinese, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return vocabularyRepository.findBySimplifiedChineseContainingIgnoreCase(chinese, pageable);
    }
    
    /**
     * Search vocabulary by English meaning
     * @param english English meaning
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of matching vocabulary items
     */
    public Page<HskVocabulary> searchByEnglish(String english, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return vocabularyRepository.findByEnglishMeaningContainingIgnoreCase(english, pageable);
    }
    
    /**
     * Search vocabulary by pinyin
     * @param pinyin Pinyin pronunciation
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of matching vocabulary items
     */
    public Page<HskVocabulary> searchByPinyin(String pinyin, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return vocabularyRepository.findByPinyinContainingIgnoreCase(pinyin, pageable);
    }
    
    /**
     * Get vocabulary by HSK level and search term
     * @param hskLevel HSK level (1-5)
     * @param searchTerm Search term (Chinese, English, or Pinyin)
     * @param page Page number (0-based)
     * @param size Page size
     * @return Page of matching vocabulary items
     */
    public Page<HskVocabulary> searchVocabularyByLevelAndTerm(
            Integer hskLevel, String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").ascending());
        return vocabularyRepository.findByHskLevelAndSearchTerm(hskLevel, searchTerm, pageable);
    }
    
    /**
     * Get vocabulary statistics by HSK level
     * @param hskLevel HSK level (1-5)
     * @return Count of vocabulary items
     */
    public long getVocabularyCountByLevel(Integer hskLevel) {
        return vocabularyRepository.countByHskLevel(hskLevel);
    }
    
    /**
     * Get all vocabulary statistics
     * @return Map of HSK level to count
     */
    public java.util.Map<Integer, Long> getAllVocabularyStatistics() {
        java.util.Map<Integer, Long> statistics = new java.util.HashMap<>();
        for (int i = 1; i <= 5; i++) {
            statistics.put(i, vocabularyRepository.countByHskLevel(i));
        }
        return statistics;
    }
    
    /**
     * Get random vocabulary items for a specific HSK level
     * @param hskLevel HSK level (1-5)
     * @param count Number of random items to return
     * @return List of random vocabulary items
     */
    public List<HskVocabulary> getRandomVocabularyByLevel(Integer hskLevel, int count) {
        long totalCount = vocabularyRepository.countByHskLevel(hskLevel);
        if (totalCount == 0) {
            return java.util.Collections.emptyList();
        }
        
        // Get all items for the level and randomly select
        List<HskVocabulary> allItems = vocabularyRepository.findByHskLevel(hskLevel);
        java.util.Collections.shuffle(allItems);
        
        return allItems.stream()
                .limit(count)
                .collect(java.util.stream.Collectors.toList());
    }
}
