package com.socialapp.repository;

import com.socialapp.model.Comment;
import com.socialapp.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // Find all top-level comments for a post (no parent)
    Page<Comment> findByPostAndParentCommentIsNullOrderByCreatedAtDesc(Post post, Pageable pageable);
    
    // Find all top-level comments for a post by post ID
    Page<Comment> findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(Long postId, Pageable pageable);
    
    // Find all replies to a comment
    List<Comment> findByParentCommentOrderByCreatedAtAsc(Comment parentComment);
    
    // Find all replies to a comment by comment ID
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(Long parentCommentId);
    
    // Count comments for a post (top-level only)
    long countByPostIdAndParentCommentIsNull(Long postId);
    
    // Count replies to a comment
    long countByParentCommentId(Long parentCommentId);
    
    // Find comment by ID with post and author
    @Query("SELECT c FROM Comment c WHERE c.id = :id")
    Optional<Comment> findByIdWithDetails(@Param("id") Long id);
    
    // Find all comments for a post (including replies) - for nested structure
    @Query("SELECT c FROM Comment c WHERE c.post.id = :postId ORDER BY c.createdAt ASC")
    List<Comment> findAllByPostIdOrderByCreatedAtAsc(@Param("postId") Long postId);
}

