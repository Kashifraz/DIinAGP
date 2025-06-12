package com.socialapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "profiles", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Profile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "profile_photo_url", length = 500)
    private String profilePhotoUrl;
    
    @Column(length = 200)
    private String occupation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "relationship_status")
    private RelationshipStatus relationshipStatus;
    
    @Column(columnDefinition = "TEXT")
    private String hobbies;
    
    public enum RelationshipStatus {
        SINGLE, IN_RELATIONSHIP, MARRIED
    }
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

