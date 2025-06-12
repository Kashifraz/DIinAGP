package com.socialapp.repository;

import com.socialapp.model.Post;
import com.socialapp.model.PostReaction;
import com.socialapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostReactionRepository extends JpaRepository<PostReaction, Long> {
    
    // Find reaction by post and user
    Optional<PostReaction> findByPostAndUser(Post post, User user);
    
    // Find reaction by post ID and user ID
    Optional<PostReaction> findByPostIdAndUserId(Long postId, Long userId);
    
    // Check if user has reacted to a post
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    
    // Count reactions by type for a post
    long countByPostIdAndReactionType(Long postId, PostReaction.ReactionType reactionType);
    
    // Count all reactions for a post
    long countByPostId(Long postId);
    
    // Get reaction counts grouped by type for a post
    @Query("SELECT pr.reactionType, COUNT(pr) FROM PostReaction pr WHERE pr.post.id = :postId GROUP BY pr.reactionType")
    java.util.List<Object[]> getReactionCountsByType(@Param("postId") Long postId);
    
    // Delete reaction by post and user
    void deleteByPostAndUser(Post post, User user);
    
    // Delete reaction by post ID and user ID
    void deleteByPostIdAndUserId(Long postId, Long userId);
    
    // Delete all reactions for a post (used when post is deleted - handled by CASCADE)
    void deleteByPost(Post post);
}

