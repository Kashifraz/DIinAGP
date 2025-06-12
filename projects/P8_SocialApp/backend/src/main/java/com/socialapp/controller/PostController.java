package com.socialapp.controller;

import com.socialapp.dto.ApiResponse;
import com.socialapp.dto.CreatePostRequest;
import com.socialapp.dto.PostResponse;
import com.socialapp.dto.UpdatePostRequest;
import com.socialapp.model.User;
import com.socialapp.repository.UserRepository;
import com.socialapp.service.PostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    /**
     * Create a new post
     * POST /api/posts
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PostResponse>> createPost(@Valid @RequestBody CreatePostRequest request) {
        try {
            Long userId = getCurrentUserId();
            PostResponse post = postService.createPost(userId, request.getContent());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Post created successfully", post));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while creating post"));
        }
    }

    /**
     * Get posts feed (posts from friends)
     * GET /api/posts?page={page}&size={size}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getPostsFeed(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            Long userId = getCurrentUserId();
            Page<PostResponse> posts = postService.getPostsFeed(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Posts retrieved successfully", posts));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while retrieving posts"));
        }
    }

    /**
     * Get post by ID
     * GET /api/posts/{postId}
     */
    @GetMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable Long postId) {
        try {
            Long userId = getCurrentUserId();
            PostResponse post = postService.getPostById(postId, userId);
            return ResponseEntity.ok(ApiResponse.success("Post retrieved successfully", post));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while retrieving post"));
        }
    }

    /**
     * Update post
     * PUT /api/posts/{postId}
     */
    @PutMapping("/{postId}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long postId,
            @Valid @RequestBody UpdatePostRequest request) {
        try {
            Long userId = getCurrentUserId();
            PostResponse post = postService.updatePost(postId, userId, request.getContent());
            return ResponseEntity.ok(ApiResponse.success("Post updated successfully", post));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while updating post"));
        }
    }

    /**
     * Delete post
     * DELETE /api/posts/{postId}
     */
    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long postId) {
        try {
            Long userId = getCurrentUserId();
            postService.deletePost(postId, userId);
            return ResponseEntity.ok(ApiResponse.success("Post deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while deleting post"));
        }
    }

    /**
     * Upload images for a post
     * POST /api/posts/{postId}/images
     */
    @PostMapping(value = "/{postId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PostResponse>> uploadPostImages(
            @PathVariable Long postId,
            @RequestParam("images") List<MultipartFile> imageFiles) {
        try {
            Long userId = getCurrentUserId();
            
            // Log for debugging
            System.out.println("Uploading images for post " + postId + " by user " + userId);
            System.out.println("Number of files: " + (imageFiles != null ? imageFiles.size() : 0));
            
            PostResponse post = postService.uploadPostImages(postId, userId, imageFiles);
            return ResponseEntity.ok(ApiResponse.success("Images uploaded successfully", post));
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while uploading images: " + e.getMessage()));
        }
    }

    /**
     * Delete a post image
     * DELETE /api/posts/images/{imageId}
     */
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deletePostImage(@PathVariable Long imageId) {
        try {
            Long userId = getCurrentUserId();
            postService.deletePostImage(imageId, userId);
            return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while deleting image"));
        }
    }
}

