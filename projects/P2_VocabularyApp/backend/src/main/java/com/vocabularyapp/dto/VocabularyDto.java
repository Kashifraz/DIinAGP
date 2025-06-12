package com.vocabularyapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class VocabularyDto {
    
    private Long id;
    
    @JsonProperty("simplifiedChinese")
    private String simplifiedChinese;
    
    @JsonProperty("pinyin")
    private String pinyin;
    
    @JsonProperty("englishMeaning")
    private String englishMeaning;
    
    @JsonProperty("detailedExplanation")
    private String detailedExplanation;
    
    @JsonProperty("hskLevel")
    private Integer hskLevel;
    
    @JsonProperty("radicals")
    private String radicals;
    
    private LocalDateTime createdAt;
    
    // Constructors
    public VocabularyDto() {}
    
    public VocabularyDto(Long id, String simplifiedChinese, String pinyin, String englishMeaning,
                        String detailedExplanation, Integer hskLevel, String radicals, LocalDateTime createdAt) {
        this.id = id;
        this.simplifiedChinese = simplifiedChinese;
        this.pinyin = pinyin;
        this.englishMeaning = englishMeaning;
        this.detailedExplanation = detailedExplanation;
        this.hskLevel = hskLevel;
        this.radicals = radicals;
        this.createdAt = createdAt;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSimplifiedChinese() {
        return simplifiedChinese;
    }
    
    public void setSimplifiedChinese(String simplifiedChinese) {
        this.simplifiedChinese = simplifiedChinese;
    }
    
    public String getPinyin() {
        return pinyin;
    }
    
    public void setPinyin(String pinyin) {
        this.pinyin = pinyin;
    }
    
    public String getEnglishMeaning() {
        return englishMeaning;
    }
    
    public void setEnglishMeaning(String englishMeaning) {
        this.englishMeaning = englishMeaning;
    }
    
    public String getDetailedExplanation() {
        return detailedExplanation;
    }
    
    public void setDetailedExplanation(String detailedExplanation) {
        this.detailedExplanation = detailedExplanation;
    }
    
    public Integer getHskLevel() {
        return hskLevel;
    }
    
    public void setHskLevel(Integer hskLevel) {
        this.hskLevel = hskLevel;
    }
    
    public String getRadicals() {
        return radicals;
    }
    
    public void setRadicals(String radicals) {
        this.radicals = radicals;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
