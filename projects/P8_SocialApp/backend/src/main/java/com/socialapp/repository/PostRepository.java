package com.socialapp.repository;

import com.socialapp.model.Post;
import com.socialapp.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    // Find post by ID
    Optional<Post> findById(Long id);
    
    // Find all posts by author
    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);
    
    // Find all posts by author ID
    Page<Post> findByAuthorIdOrderByCreatedAtDesc(Long authorId, Pageable pageable);
    
    // Find posts by multiple authors (for friends feed)
    @Query("SELECT p FROM Post p WHERE p.author.id IN :authorIds ORDER BY p.createdAt DESC")
    Page<Post> findByAuthorIdInOrderByCreatedAtDesc(@Param("authorIds") List<Long> authorIds, Pageable pageable);
    
    // Check if post exists and belongs to user
    boolean existsByIdAndAuthorId(Long postId, Long authorId);
    
    // Find all posts (for admin purposes, if needed)
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}

