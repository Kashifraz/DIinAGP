package com.vocabularyapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vocabularyapp.entity.HskVocabulary;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class JsonParserService {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * Parse HSK vocabulary from JSON file
     * @param filePath Path to the JSON file
     * @param hskLevel HSK level (1-5)
     * @return List of HskVocabulary entities
     */
    public List<HskVocabulary> parseHskVocabulary(String filePath, Integer hskLevel) throws IOException {
        List<HskVocabulary> vocabularyList = new ArrayList<>();
        
        JsonNode rootNode = objectMapper.readTree(new File(filePath));
        
        if (rootNode.isArray()) {
            for (JsonNode wordNode : rootNode) {
                HskVocabulary vocabulary = parseWordNode(wordNode, hskLevel);
                if (vocabulary != null) {
                    vocabularyList.add(vocabulary);
                }
            }
        }
        
        return vocabularyList;
    }
    
    /**
     * Parse individual word node from JSON
     */
    private HskVocabulary parseWordNode(JsonNode wordNode, Integer hskLevel) {
        try {
            // Extract basic information
            String simplified = getStringValue(wordNode, "simplified");
            String radical = getStringValue(wordNode, "radical");
            
            // Get forms array
            JsonNode formsNode = wordNode.get("forms");
            if (formsNode == null || !formsNode.isArray() || formsNode.size() == 0) {
                return null;
            }
            
            // Use the first form (primary form)
            JsonNode firstForm = formsNode.get(0);
            
            // Extract pinyin from transcriptions
            String pinyin = "";
            JsonNode transcriptionsNode = firstForm.get("transcriptions");
            if (transcriptionsNode != null) {
                pinyin = getStringValue(transcriptionsNode, "pinyin");
            }
            
            // Extract meanings
            String englishMeaning = "";
            String detailedExplanation = "";
            JsonNode meaningsNode = firstForm.get("meanings");
            if (meaningsNode != null && meaningsNode.isArray()) {
                List<String> meanings = new ArrayList<>();
                for (JsonNode meaningNode : meaningsNode) {
                    meanings.add(meaningNode.asText());
                }
                
                if (!meanings.isEmpty()) {
                    englishMeaning = meanings.get(0); // Primary meaning
                    detailedExplanation = String.join("; ", meanings); // All meanings
                }
            }
            
            // Extract classifiers
            String classifiers = "";
            JsonNode classifiersNode = firstForm.get("classifiers");
            if (classifiersNode != null && classifiersNode.isArray()) {
                List<String> classifierList = new ArrayList<>();
                for (JsonNode classifierNode : classifiersNode) {
                    classifierList.add(classifierNode.asText());
                }
                classifiers = String.join(", ", classifierList);
            }
            
            // Create HskVocabulary entity
            HskVocabulary vocabulary = new HskVocabulary();
            vocabulary.setSimplifiedChinese(simplified);
            vocabulary.setPinyin(pinyin);
            vocabulary.setEnglishMeaning(englishMeaning);
            vocabulary.setDetailedExplanation(detailedExplanation);
            vocabulary.setHskLevel(hskLevel);
            vocabulary.setRadicals(radical + (classifiers.isEmpty() ? "" : " (" + classifiers + ")"));
            
            return vocabulary;
            
        } catch (Exception e) {
            System.err.println("Error parsing word node: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Safely get string value from JsonNode
     */
    private String getStringValue(JsonNode node, String fieldName) {
        JsonNode fieldNode = node.get(fieldName);
        return fieldNode != null ? fieldNode.asText() : "";
    }
}
