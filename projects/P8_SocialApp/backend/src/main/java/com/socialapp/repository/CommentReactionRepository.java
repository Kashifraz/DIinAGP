package com.socialapp.repository;

import com.socialapp.model.Comment;
import com.socialapp.model.CommentReaction;
import com.socialapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {
    
    // Find reaction by comment and user
    Optional<CommentReaction> findByCommentAndUser(Comment comment, User user);
    
    // Find reaction by comment ID and user ID
    Optional<CommentReaction> findByCommentIdAndUserId(Long commentId, Long userId);
    
    // Check if user has reacted to a comment
    boolean existsByCommentIdAndUserId(Long commentId, Long userId);
    
    // Count reactions by type for a comment
    long countByCommentIdAndReactionType(Long commentId, CommentReaction.ReactionType reactionType);
    
    // Count all reactions for a comment
    long countByCommentId(Long commentId);
    
    // Get reaction counts grouped by type for a comment
    @Query("SELECT cr.reactionType, COUNT(cr) FROM CommentReaction cr WHERE cr.comment.id = :commentId GROUP BY cr.reactionType")
    java.util.List<Object[]> getReactionCountsByType(@Param("commentId") Long commentId);
    
    // Delete reaction by comment and user
    void deleteByCommentAndUser(Comment comment, User user);
    
    // Delete reaction by comment ID and user ID
    void deleteByCommentIdAndUserId(Long commentId, Long userId);
    
    // Delete all reactions for a comment (used when comment is deleted - handled by CASCADE)
    void deleteByComment(Comment comment);
}

