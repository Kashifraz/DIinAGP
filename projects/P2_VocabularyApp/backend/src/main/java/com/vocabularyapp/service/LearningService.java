package com.vocabularyapp.service;

import com.vocabularyapp.entity.*;
import com.vocabularyapp.repository.*;
import com.vocabularyapp.dto.VocabularyDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class LearningService {
    
    @Autowired
    private LearningSessionRepository learningSessionRepository;
    
    @Autowired
    private LearningProgressRepository learningProgressRepository;
    
    @Autowired
    private HskVocabularyRepository hskVocabularyRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    /**
     * Start a new learning session for a user and HSK level
     */
    public LearningSession startLearningSession(Long userId, Integer hskLevel) {
        // Check if user exists
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        // Check if there's an active session for this user and level
        Optional<LearningSession> activeSession = learningSessionRepository
            .findActiveSessionByUserAndLevel(userId, hskLevel);
        
        if (activeSession.isPresent()) {
            return activeSession.get();
        }
        
        // Get available vocabulary for this HSK level
        List<HskVocabulary> availableVocabulary = hskVocabularyRepository.findByHskLevel(hskLevel);
        if (availableVocabulary.isEmpty()) {
            throw new RuntimeException("No vocabulary available for HSK Level " + hskLevel);
        }
        
        // Create new learning session
        LearningSession session = new LearningSession();
        session.setUser(userOpt.get());
        session.setHskLevel(hskLevel);
        session.setWordsPerSession(10);
        session.setCurrentWordIndex(0);
        session.setIsCompleted(false);
        
        LearningSession savedSession = learningSessionRepository.save(session);
        
        // Select 10 random words for this session
        List<HskVocabulary> selectedWords = selectRandomWords(availableVocabulary, 10);
        
        // Create learning progress entries for each selected word
        for (HskVocabulary vocabulary : selectedWords) {
            LearningProgress progress = new LearningProgress();
            progress.setUserId(userId);
            progress.setVocabularyId(vocabulary.getId());
            progress.setSessionId(savedSession.getId());
            progress.setIsLearned(false);
            progress.setTimesReviewed(0);
            
            learningProgressRepository.save(progress);
        }
        
        return savedSession;
    }
    
    /**
     * Get current word for a learning session
     */
    public Optional<VocabularyDto> getCurrentWord(Long sessionId) {
        Optional<LearningSession> sessionOpt = learningSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            return Optional.empty();
        }
        
        LearningSession session = sessionOpt.get();
        List<LearningProgress> progressList = learningProgressRepository
            .findByUserIdAndSessionId(session.getUser().getId(), sessionId);
        
        if (progressList.isEmpty() || session.getCurrentWordIndex() >= progressList.size()) {
            return Optional.empty();
        }
        
        LearningProgress currentProgress = progressList.get(session.getCurrentWordIndex());
        Optional<HskVocabulary> vocabularyOpt = hskVocabularyRepository.findById(currentProgress.getVocabularyId());
        
        if (vocabularyOpt.isEmpty()) {
            return Optional.empty();
        }
        
        HskVocabulary vocabulary = vocabularyOpt.get();
        VocabularyDto dto = new VocabularyDto(
            vocabulary.getId(),
            vocabulary.getSimplifiedChinese(),
            vocabulary.getPinyin(),
            vocabulary.getEnglishMeaning(),
            vocabulary.getDetailedExplanation(),
            vocabulary.getHskLevel(),
            vocabulary.getRadicals(),
            vocabulary.getCreatedAt()
        );
        
        return Optional.of(dto);
    }
    
    /**
     * Mark a word as learned and move to next word
     */
    public LearningSession markWordAsLearned(Long sessionId, Long vocabularyId) {
        Optional<LearningSession> sessionOpt = learningSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            throw new RuntimeException("Session not found");
        }
        
        LearningSession session = sessionOpt.get();
        
        // Find the learning progress for this word
        Optional<LearningProgress> progressOpt = learningProgressRepository
            .findByUserIdAndVocabularyIdAndSessionId(
                session.getUser().getId(), vocabularyId, sessionId);
        
        if (progressOpt.isEmpty()) {
            throw new RuntimeException("Word not found in this session");
        }
        
        LearningProgress progress = progressOpt.get();
        progress.setIsLearned(true);
        progress.setTimesReviewed(progress.getTimesReviewed() + 1);
        progress.setLastReviewedAt(LocalDateTime.now());
        
        learningProgressRepository.save(progress);
        
        // Move to next word
        session.setCurrentWordIndex(session.getCurrentWordIndex() + 1);
        
        // Check if session is completed
        List<LearningProgress> allProgress = learningProgressRepository
            .findByUserIdAndSessionId(session.getUser().getId(), sessionId);
        
        if (session.getCurrentWordIndex() >= allProgress.size()) {
            session.setIsCompleted(true);
        }
        
        return learningSessionRepository.save(session);
    }
    
    /**
     * Get session progress
     */
    public LearningSessionProgress getSessionProgress(Long sessionId) {
        Optional<LearningSession> sessionOpt = learningSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            throw new RuntimeException("Session not found");
        }
        
        LearningSession session = sessionOpt.get();
        List<LearningProgress> progressList = learningProgressRepository
            .findByUserIdAndSessionId(session.getUser().getId(), sessionId);
        
        long learnedCount = progressList.stream()
            .mapToLong(p -> p.getIsLearned() ? 1 : 0)
            .sum();
        
        return new LearningSessionProgress(
            session.getId(),
            session.getHskLevel(),
            session.getCurrentWordIndex(),
            session.getWordsPerSession(),
            learnedCount,
            (long) progressList.size(),
            session.getIsCompleted()
        );
    }
    
    /**
     * Get user's learning statistics
     */
    public LearningStatistics getUserLearningStatistics(Long userId) {
        List<LearningSession> allSessions = learningSessionRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        long totalSessions = allSessions.size();
        long completedSessions = allSessions.stream()
            .mapToLong(s -> s.getIsCompleted() ? 1 : 0)
            .sum();
        
        // Count learned words by HSK level
        long learnedWordsLevel1 = learningProgressRepository.countLearnedWordsByHskLevel(userId, 1);
        long learnedWordsLevel2 = learningProgressRepository.countLearnedWordsByHskLevel(userId, 2);
        long learnedWordsLevel3 = learningProgressRepository.countLearnedWordsByHskLevel(userId, 3);
        long learnedWordsLevel4 = learningProgressRepository.countLearnedWordsByHskLevel(userId, 4);
        long learnedWordsLevel5 = learningProgressRepository.countLearnedWordsByHskLevel(userId, 5);
        
        return new LearningStatistics(
            totalSessions,
            completedSessions,
            learnedWordsLevel1,
            learnedWordsLevel2,
            learnedWordsLevel3,
            learnedWordsLevel4,
            learnedWordsLevel5
        );
    }
    
    /**
     * Get next session for a user and HSK level
     */
    public LearningSession getNextSession(Long userId, Integer hskLevel) {
        // Check if there's an active session
        Optional<LearningSession> activeSession = learningSessionRepository
            .findActiveSessionByUserAndLevel(userId, hskLevel);
        
        if (activeSession.isPresent()) {
            return activeSession.get();
        }
        
        // Start a new session
        return startLearningSession(userId, hskLevel);
    }
    
    /**
     * Select random words from available vocabulary
     */
    private List<HskVocabulary> selectRandomWords(List<HskVocabulary> vocabulary, int count) {
        if (vocabulary.size() <= count) {
            return new ArrayList<>(vocabulary);
        }
        
        List<HskVocabulary> selected = new ArrayList<>();
        List<HskVocabulary> available = new ArrayList<>(vocabulary);
        Random random = new Random();
        
        for (int i = 0; i < count; i++) {
            int randomIndex = random.nextInt(available.size());
            selected.add(available.remove(randomIndex));
        }
        
        return selected;
    }
    
    // DTO classes for responses
    public static class LearningSessionProgress {
        private Long sessionId;
        private Integer hskLevel;
        private Integer currentWordIndex;
        private Integer wordsPerSession;
        private Long learnedCount;
        private Long totalWords;
        private Boolean isCompleted;
        
        public LearningSessionProgress(Long sessionId, Integer hskLevel, Integer currentWordIndex,
                                     Integer wordsPerSession, Long learnedCount, Long totalWords, Boolean isCompleted) {
            this.sessionId = sessionId;
            this.hskLevel = hskLevel;
            this.currentWordIndex = currentWordIndex;
            this.wordsPerSession = wordsPerSession;
            this.learnedCount = learnedCount;
            this.totalWords = totalWords;
            this.isCompleted = isCompleted;
        }
        
        // Getters
        public Long getSessionId() { return sessionId; }
        public Integer getHskLevel() { return hskLevel; }
        public Integer getCurrentWordIndex() { return currentWordIndex; }
        public Integer getWordsPerSession() { return wordsPerSession; }
        public Long getLearnedCount() { return learnedCount; }
        public Long getTotalWords() { return totalWords; }
        public Boolean getIsCompleted() { return isCompleted; }
    }
    
    public static class LearningStatistics {
        private Long totalSessions;
        private Long completedSessions;
        private Long learnedWordsLevel1;
        private Long learnedWordsLevel2;
        private Long learnedWordsLevel3;
        private Long learnedWordsLevel4;
        private Long learnedWordsLevel5;
        
        public LearningStatistics(Long totalSessions, Long completedSessions,
                                Long learnedWordsLevel1, Long learnedWordsLevel2, Long learnedWordsLevel3,
                                Long learnedWordsLevel4, Long learnedWordsLevel5) {
            this.totalSessions = totalSessions;
            this.completedSessions = completedSessions;
            this.learnedWordsLevel1 = learnedWordsLevel1;
            this.learnedWordsLevel2 = learnedWordsLevel2;
            this.learnedWordsLevel3 = learnedWordsLevel3;
            this.learnedWordsLevel4 = learnedWordsLevel4;
            this.learnedWordsLevel5 = learnedWordsLevel5;
        }
        
        // Getters
        public Long getTotalSessions() { return totalSessions; }
        public Long getCompletedSessions() { return completedSessions; }
        public Long getLearnedWordsLevel1() { return learnedWordsLevel1; }
        public Long getLearnedWordsLevel2() { return learnedWordsLevel2; }
        public Long getLearnedWordsLevel3() { return learnedWordsLevel3; }
        public Long getLearnedWordsLevel4() { return learnedWordsLevel4; }
        public Long getLearnedWordsLevel5() { return learnedWordsLevel5; }
    }
    
    /**
     * Debug method to get session information
     */
    public Map<String, Object> getSessionDebugInfo(Long sessionId) {
        Map<String, Object> debugInfo = new HashMap<>();
        
        // Check if session exists
        Optional<LearningSession> sessionOpt = learningSessionRepository.findById(sessionId);
        if (sessionOpt.isEmpty()) {
            debugInfo.put("sessionExists", false);
            debugInfo.put("error", "Session not found");
            return debugInfo;
        }
        
        LearningSession session = sessionOpt.get();
        debugInfo.put("sessionExists", true);
        debugInfo.put("sessionId", session.getId());
        debugInfo.put("userId", session.getUser().getId());
        debugInfo.put("hskLevel", session.getHskLevel());
        debugInfo.put("currentWordIndex", session.getCurrentWordIndex());
        debugInfo.put("wordsPerSession", session.getWordsPerSession());
        debugInfo.put("isCompleted", session.getIsCompleted());
        
        // Get all progress records for this session
        List<LearningProgress> progressList = learningProgressRepository
            .findByUserIdAndSessionId(session.getUser().getId(), sessionId);
        
        debugInfo.put("totalProgressRecords", progressList.size());
        debugInfo.put("progressRecords", progressList.stream().map(p -> Map.of(
            "id", p.getId(),
            "vocabularyId", p.getVocabularyId(),
            "isLearned", p.getIsLearned(),
            "timesReviewed", p.getTimesReviewed()
        )).toList());
        
        return debugInfo;
    }
}
