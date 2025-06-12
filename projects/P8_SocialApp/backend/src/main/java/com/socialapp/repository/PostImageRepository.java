package com.socialapp.repository;

import com.socialapp.model.Post;
import com.socialapp.model.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    
    // Find all images for a post
    List<PostImage> findByPostOrderByOrderIndexAsc(Post post);
    
    // Find all images for a post by post ID
    List<PostImage> findByPostIdOrderByOrderIndexAsc(Long postId);
    
    // Delete all images for a post
    void deleteByPost(Post post);
    
    // Delete all images for a post by post ID
    void deleteByPostId(Long postId);
    
    // Find image by ID
    Optional<PostImage> findById(Long id);
}

