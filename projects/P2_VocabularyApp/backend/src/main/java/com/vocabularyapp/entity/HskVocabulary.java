package com.vocabularyapp.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "hsk_vocabulary")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HskVocabulary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(name = "simplified_chinese", nullable = false)
    @JsonProperty("simplifiedChinese")
    private String simplifiedChinese;
    
    @NotBlank
    @Column(nullable = false)
    @JsonProperty("pinyin")
    private String pinyin;
    
    @NotBlank
    @Column(name = "english_meaning", nullable = false)
    @JsonProperty("englishMeaning")
    private String englishMeaning;
    
    @Column(name = "detailed_explanation", columnDefinition = "TEXT")
    @JsonProperty("detailedExplanation")
    private String detailedExplanation;
    
    @NotNull
    @Column(name = "hsk_level", nullable = false)
    @JsonProperty("hskLevel")
    private Integer hskLevel;
    
    @Column(name = "radicals")
    @JsonProperty("radicals")
    private String radicals;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public HskVocabulary() {}
    
    public HskVocabulary(String simplifiedChinese, String pinyin, String englishMeaning, 
                        String detailedExplanation, Integer hskLevel, String radicals) {
        this.simplifiedChinese = simplifiedChinese;
        this.pinyin = pinyin;
        this.englishMeaning = englishMeaning;
        this.detailedExplanation = detailedExplanation;
        this.hskLevel = hskLevel;
        this.radicals = radicals;
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
