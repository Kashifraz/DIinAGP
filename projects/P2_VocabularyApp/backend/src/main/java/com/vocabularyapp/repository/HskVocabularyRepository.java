package com.vocabularyapp.repository;

import com.vocabularyapp.entity.HskVocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HskVocabularyRepository extends JpaRepository<HskVocabulary, Long> {
    
    List<HskVocabulary> findByHskLevel(Integer hskLevel);
    
    Page<HskVocabulary> findByHskLevel(Integer hskLevel, Pageable pageable);
    
    @Query("SELECT h FROM HskVocabulary h WHERE h.hskLevel = :level ORDER BY h.id")
    List<HskVocabulary> findByHskLevelOrderById(@Param("level") Integer hskLevel);
    
    @Query("SELECT h FROM HskVocabulary h WHERE h.hskLevel = :level ORDER BY h.id LIMIT :limit OFFSET :offset")
    List<HskVocabulary> findByHskLevelWithPagination(@Param("level") Integer hskLevel, 
                                                    @Param("limit") Integer limit, 
                                                    @Param("offset") Integer offset);
    
    @Query("SELECT h FROM HskVocabulary h WHERE " +
           "LOWER(h.simplifiedChinese) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(h.pinyin) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(h.englishMeaning) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<HskVocabulary> searchByTerm(@Param("searchTerm") String searchTerm);
    
    // Search by Chinese characters with pagination
    Page<HskVocabulary> findBySimplifiedChineseContainingIgnoreCase(String chinese, Pageable pageable);
    
    // Search by English meaning with pagination
    Page<HskVocabulary> findByEnglishMeaningContainingIgnoreCase(String english, Pageable pageable);
    
    // Search by pinyin with pagination
    Page<HskVocabulary> findByPinyinContainingIgnoreCase(String pinyin, Pageable pageable);
    
    // Search by HSK level and search term with pagination
    @Query("SELECT v FROM HskVocabulary v WHERE v.hskLevel = :hskLevel AND " +
           "(LOWER(v.simplifiedChinese) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(v.englishMeaning) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(v.pinyin) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<HskVocabulary> findByHskLevelAndSearchTerm(
            @Param("hskLevel") Integer hskLevel, 
            @Param("searchTerm") String searchTerm, 
            Pageable pageable);
    
    long countByHskLevel(Integer hskLevel);
}
