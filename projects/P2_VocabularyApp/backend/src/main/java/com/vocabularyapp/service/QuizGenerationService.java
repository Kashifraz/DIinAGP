package com.vocabularyapp.service;

import com.vocabularyapp.dto.QuizQuestionDto;
import com.vocabularyapp.entity.HskVocabulary;
import com.vocabularyapp.entity.QuizAttempt;
import com.vocabularyapp.entity.User;
import com.vocabularyapp.repository.HskVocabularyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizGenerationService {
    
    @Autowired
    private HskVocabularyRepository hskVocabularyRepository;
    
    private static final int QUIZ_QUESTIONS_COUNT = 10;
    private static final int OPTIONS_COUNT = 4;
    
    /**
     * Generate quiz questions for Easy Mode (Chinese + Pinyin → English)
     */
    public List<QuizQuestionDto> generateEasyModeQuiz(User user, Integer hskLevel) {
        // Get random vocabulary from the specified HSK level
        List<HskVocabulary> vocabulary = hskVocabularyRepository.findByHskLevel(hskLevel);
        
        if (vocabulary.size() < QUIZ_QUESTIONS_COUNT) {
            throw new RuntimeException("Not enough vocabulary available for HSK level " + hskLevel);
        }
        
        // Shuffle and take required number of questions
        Collections.shuffle(vocabulary);
        List<HskVocabulary> selectedWords = vocabulary.subList(0, QUIZ_QUESTIONS_COUNT);
        
        List<QuizQuestionDto> questions = new ArrayList<>();
        
        for (int i = 0; i < selectedWords.size(); i++) {
            HskVocabulary word = selectedWords.get(i);
            
            // Generate multiple choice options
            String[] options = generateMultipleChoiceOptions(word, vocabulary, hskLevel);
            
            QuizQuestionDto question = new QuizQuestionDto(
                word.getId(),
                word.getSimplifiedChinese(),
                word.getPinyin(),
                word.getEnglishMeaning(),
                options,
                i + 1,
                QUIZ_QUESTIONS_COUNT,
                QuizAttempt.QuizType.EASY
            );
            
            questions.add(question);
        }
        
        return questions;
    }
    
    /**
     * Generate quiz questions for Medium Mode (English → Chinese + Pinyin)
     */
    public List<QuizQuestionDto> generateMediumModeQuiz(User user, Integer hskLevel) {
        System.out.println("🎯 Generating MEDIUM mode quiz for HSK level: " + hskLevel);
        // Get random vocabulary from the specified HSK level
        List<HskVocabulary> vocabulary = hskVocabularyRepository.findByHskLevel(hskLevel);
        
        if (vocabulary.size() < QUIZ_QUESTIONS_COUNT) {
            throw new RuntimeException("Not enough vocabulary available for HSK level " + hskLevel);
        }
        
        // Shuffle and take required number of questions
        Collections.shuffle(vocabulary);
        List<HskVocabulary> selectedWords = vocabulary.subList(0, QUIZ_QUESTIONS_COUNT);
        
        List<QuizQuestionDto> questions = new ArrayList<>();
        
        for (int i = 0; i < selectedWords.size(); i++) {
            HskVocabulary word = selectedWords.get(i);
            
            // Generate multiple choice options for medium mode (Chinese + Pinyin combinations)
            String[] options = generateMediumModeOptions(word, vocabulary, hskLevel);
            
            QuizQuestionDto question = new QuizQuestionDto(
                word.getId(),
                word.getEnglishMeaning(), // English is the question
                word.getSimplifiedChinese() + " (" + word.getPinyin() + ")", // Chinese + Pinyin is the correct answer
                word.getSimplifiedChinese() + " (" + word.getPinyin() + ")", // Correct answer format
                options,
                i + 1,
                QUIZ_QUESTIONS_COUNT,
                QuizAttempt.QuizType.MEDIUM
            );
            
            System.out.println("🎯 Created MEDIUM question: " + question.getChineseCharacter() + " -> " + question.getPinyin());
            
            questions.add(question);
        }
        
        return questions;
    }
    
    /**
     * Generate multiple choice options for a given word
     */
    private String[] generateMultipleChoiceOptions(HskVocabulary correctWord, 
                                                  List<HskVocabulary> allVocabulary, 
                                                  Integer hskLevel) {
        Set<String> options = new HashSet<>();
        options.add(correctWord.getEnglishMeaning()); // Add correct answer
        
        // Get other words from the same HSK level to use as wrong options
        List<HskVocabulary> otherWords = allVocabulary.stream()
            .filter(w -> !w.getId().equals(correctWord.getId()))
            .collect(Collectors.toList());
        
        // Shuffle and take 3 wrong options
        Collections.shuffle(otherWords);
        for (int i = 0; i < Math.min(3, otherWords.size()) && options.size() < OPTIONS_COUNT; i++) {
            options.add(otherWords.get(i).getEnglishMeaning());
        }
        
        // If we don't have enough options, add some generic options
        if (options.size() < OPTIONS_COUNT) {
            String[] genericOptions = {"I don't know", "Maybe", "Not sure", "Skip"};
            for (String option : genericOptions) {
                if (options.size() >= OPTIONS_COUNT) break;
                options.add(option);
            }
        }
        
        // Convert to array and shuffle
        String[] optionsArray = options.toArray(new String[0]);
        List<String> optionsList = Arrays.asList(optionsArray);
        Collections.shuffle(optionsList);
        
        return optionsList.toArray(new String[0]);
    }
    
    /**
     * Generate quiz questions for Hard Mode (English → Chinese Only)
     */
    public List<QuizQuestionDto> generateHardModeQuiz(User user, Integer hskLevel) {
        System.out.println("🎯 Generating HARD mode quiz for HSK level: " + hskLevel);
        // Get random vocabulary from the specified HSK level
        List<HskVocabulary> vocabulary = hskVocabularyRepository.findByHskLevel(hskLevel);

        if (vocabulary.size() < QUIZ_QUESTIONS_COUNT) {
            throw new RuntimeException("Not enough vocabulary available for HSK level " + hskLevel);
        }

        // Shuffle and take required number of questions
        Collections.shuffle(vocabulary);
        List<HskVocabulary> selectedWords = vocabulary.subList(0, QUIZ_QUESTIONS_COUNT);

        List<QuizQuestionDto> questions = new ArrayList<>();

        for (int i = 0; i < selectedWords.size(); i++) {
            HskVocabulary word = selectedWords.get(i);

            // Generate multiple choice options for hard mode (Chinese characters only)
            String[] options = generateHardModeOptions(word, vocabulary, hskLevel);

            QuizQuestionDto question = new QuizQuestionDto(
                word.getId(),
                word.getEnglishMeaning(), // English is the question
                word.getSimplifiedChinese(), // Chinese only is the correct answer
                word.getSimplifiedChinese(), // Correct answer format
                options,
                i + 1,
                QUIZ_QUESTIONS_COUNT,
                QuizAttempt.QuizType.HARD
            );

            System.out.println("🎯 Created HARD question: " + question.getChineseCharacter() + " -> " + question.getPinyin());

            questions.add(question);
        }

        return questions;
    }

    /**
     * Generate multiple choice options for medium mode (Chinese + Pinyin combinations)
     */
    private String[] generateMediumModeOptions(HskVocabulary correctWord, 
                                             List<HskVocabulary> allVocabulary, 
                                             Integer hskLevel) {
        Set<String> options = new HashSet<>();
        options.add(correctWord.getSimplifiedChinese() + " (" + correctWord.getPinyin() + ")"); // Add correct answer
        
        // Get other words from the same HSK level to use as wrong options
        List<HskVocabulary> otherWords = allVocabulary.stream()
            .filter(w -> !w.getId().equals(correctWord.getId()))
            .collect(Collectors.toList());
        
        // Shuffle and take 3 wrong options
        Collections.shuffle(otherWords);
        for (int i = 0; i < Math.min(3, otherWords.size()) && options.size() < OPTIONS_COUNT; i++) {
            HskVocabulary wrongWord = otherWords.get(i);
            options.add(wrongWord.getSimplifiedChinese() + " (" + wrongWord.getPinyin() + ")");
        }
        
        // If we don't have enough options, add some generic options
        if (options.size() < OPTIONS_COUNT) {
            String[] genericOptions = {"我不知道", "不确定", "跳过", "不知道"};
            for (String option : genericOptions) {
                if (options.size() >= OPTIONS_COUNT) break;
                options.add(option);
            }
        }
        
        // Convert to array and shuffle
        String[] optionsArray = options.toArray(new String[0]);
        List<String> optionsList = Arrays.asList(optionsArray);
        Collections.shuffle(optionsList);
        
        return optionsList.toArray(new String[0]);
    }

    /**
     * Generate multiple choice options for hard mode (Chinese characters only)
     */
    private String[] generateHardModeOptions(HskVocabulary correctWord,
                                             List<HskVocabulary> allVocabulary,
                                             Integer hskLevel) {
        Set<String> options = new HashSet<>();
        options.add(correctWord.getSimplifiedChinese()); // Add correct answer

        // Get other words from the same HSK level to use as wrong options
        List<HskVocabulary> otherWords = allVocabulary.stream()
            .filter(w -> !w.getId().equals(correctWord.getId()))
            .collect(Collectors.toList());

        // Shuffle and take 3 wrong options
        Collections.shuffle(otherWords);
        for (int i = 0; i < Math.min(3, otherWords.size()) && options.size() < OPTIONS_COUNT; i++) {
            HskVocabulary wrongWord = otherWords.get(i);
            options.add(wrongWord.getSimplifiedChinese());
        }

        // If we don't have enough options, add some generic options
        if (options.size() < OPTIONS_COUNT) {
            String[] genericOptions = {"我不知道", "不确定", "跳过", "不知道"};
            for (String option : genericOptions) {
                if (options.size() >= OPTIONS_COUNT) break;
                options.add(option);
            }
        }

        // Convert to array and shuffle
        String[] optionsArray = options.toArray(new String[0]);
        List<String> optionsList = Arrays.asList(optionsArray);
        Collections.shuffle(optionsList);

        return optionsList.toArray(new String[0]);
    }
    
    /**
     * Get a specific question from a quiz
     */
    public QuizQuestionDto getQuizQuestion(Long questionId, Integer hskLevel) {
        Optional<HskVocabulary> wordOpt = hskVocabularyRepository.findById(questionId);
        
        if (!wordOpt.isPresent()) {
            throw new RuntimeException("Word not found with ID: " + questionId);
        }
        
        HskVocabulary word = wordOpt.get();
        
        // Get other vocabulary for options
        List<HskVocabulary> vocabulary = hskVocabularyRepository.findByHskLevel(hskLevel);
        String[] options = generateMultipleChoiceOptions(word, vocabulary, hskLevel);
        
        return new QuizQuestionDto(
            word.getId(),
            word.getSimplifiedChinese(),
            word.getPinyin(),
            word.getEnglishMeaning(),
            options,
            1, // This will be set by the calling service
            QUIZ_QUESTIONS_COUNT,
            QuizAttempt.QuizType.EASY
        );
    }
    
    /**
     * Validate if a quiz answer is correct
     */
    public boolean validateAnswer(Long questionId, String userAnswer, QuizAttempt.QuizType quizType) {
        Optional<HskVocabulary> wordOpt = hskVocabularyRepository.findById(questionId);
        
        if (!wordOpt.isPresent()) {
            return false;
        }
        
        HskVocabulary word = wordOpt.get();
        String trimmedAnswer = userAnswer.trim();
        
        switch (quizType) {
            case EASY:
                // Easy mode: Chinese + Pinyin → English
                return word.getEnglishMeaning().equalsIgnoreCase(trimmedAnswer);
            case MEDIUM:
                // Medium mode: English → Chinese + Pinyin
                String expectedAnswer = word.getSimplifiedChinese() + " (" + word.getPinyin() + ")";
                return expectedAnswer.equals(trimmedAnswer);
            case HARD:
                // Hard mode: English → Chinese only
                return word.getSimplifiedChinese().equals(trimmedAnswer);
            default:
                return false;
        }
    }
    
    /**
     * Validate if a quiz answer is correct (backward compatibility)
     */
    public boolean validateAnswer(Long questionId, String userAnswer) {
        return validateAnswer(questionId, userAnswer, QuizAttempt.QuizType.EASY);
    }
}
