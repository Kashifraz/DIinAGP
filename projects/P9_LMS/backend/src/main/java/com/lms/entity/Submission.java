package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.Convert;
import jakarta.persistence.Converter;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "submissions", indexes = {
    @Index(name = "idx_submission_assessment", columnList = "assessment_id"),
    @Index(name = "idx_submission_student", columnList = "student_id"),
    @Index(name = "idx_submission_status", columnList = "status")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_assessment_student", columnNames = {"assessment_id", "student_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "submitted_file_path", length = 500)
    private String submittedFilePath;

    @Column(name = "submitted_answers", columnDefinition = "TEXT")
    @Convert(converter = AnswersMapConverter.class)
    private Map<String, String> submittedAnswers;

    @Column(name = "submission_date", nullable = false)
    private LocalDateTime submissionDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.SUBMITTED;

    @OneToOne(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private Grade grade;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public enum Status {
        SUBMITTED,
        GRADED
    }

    @Converter
    public static class AnswersMapConverter implements jakarta.persistence.AttributeConverter<Map<String, String>, String> {
        private final ObjectMapper objectMapper = new ObjectMapper();

        @Override
        public String convertToDatabaseColumn(Map<String, String> attribute) {
            if (attribute == null || attribute.isEmpty()) {
                return null;
            }
            try {
                return objectMapper.writeValueAsString(attribute);
            } catch (Exception e) {
                throw new RuntimeException("Error converting map to JSON string", e);
            }
        }

        @Override
        public Map<String, String> convertToEntityAttribute(String dbData) {
            if (dbData == null || dbData.trim().isEmpty()) {
                return null;
            }
            try {
                return objectMapper.readValue(dbData, new TypeReference<Map<String, String>>() {});
            } catch (Exception e) {
                throw new RuntimeException("Error converting JSON string to map", e);
            }
        }
    }
}

