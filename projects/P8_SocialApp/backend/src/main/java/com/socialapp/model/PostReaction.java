package com.socialapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_reactions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"post_id", "user_id"})
}, indexes = {
        @Index(name = "idx_pr_post_id", columnList = "post_id"),
        @Index(name = "idx_pr_user_id", columnList = "user_id"),
        @Index(name = "idx_pr_reaction_type", columnList = "reaction_type"),
        @Index(name = "idx_pr_post_reaction", columnList = "post_id,reaction_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostReaction {

    public enum ReactionType {
        HEART,      // ❤️ Love
        THUMBS_UP,  // 👍 Like
        LAUGH,      // 😂 Funny
        SAD,        // 😢 Emotional
        ANGRY,      // 😠 Extremely dislike
        THUMBS_DOWN // 👎 Dislike
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "reaction_type", nullable = false, length = 20)
    private ReactionType reactionType;

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

