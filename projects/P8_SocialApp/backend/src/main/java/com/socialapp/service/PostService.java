package com.socialapp.service;

import com.socialapp.dto.PostImageResponse;
import com.socialapp.dto.PostResponse;
import com.socialapp.model.Post;
import com.socialapp.model.PostImage;
import com.socialapp.model.Profile;
import com.socialapp.model.User;
import com.socialapp.repository.FriendRequestRepository;
import com.socialapp.repository.PostReactionRepository;
import com.socialapp.repository.PostImageRepository;
import com.socialapp.repository.PostRepository;
import com.socialapp.repository.ProfileRepository;
import com.socialapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostImageRepository postImageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private com.socialapp.repository.PostReactionRepository reactionRepository;

    private static final String UPLOAD_DIR = "uploads/posts/";
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_IMAGES_PER_POST = 10;
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    /**
     * Create a new post
     */
    public PostResponse createPost(Long userId, String content) {
        User author = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setAuthor(author);
        post.setContent(content);

        post = postRepository.save(post);
        return mapToResponse(post, userId);
    }

    /**
     * Get post by ID (only if user is friend of author or is the author)
     */
    public PostResponse getPostById(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if current user is the author
        if (post.getAuthor().getId().equals(currentUserId)) {
            return mapToResponse(post, currentUserId);
        }

        // Check if current user is a friend of the author
        boolean areFriends = friendRequestRepository.areFriends(currentUserId, post.getAuthor().getId());
        if (!areFriends) {
            throw new RuntimeException("You can only view posts from your friends or your own posts");
        }

        return mapToResponse(post, currentUserId);
    }

    /**
     * Update post (only by author)
     */
    public PostResponse updatePost(Long postId, Long userId, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Verify ownership
        if (!post.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own posts");
        }

        post.setContent(content);
        post = postRepository.save(post);
        return mapToResponse(post, userId);
    }

    /**
     * Delete post (only by author)
     */
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Verify ownership
        if (!post.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("You can only delete your own posts");
        }

        // Delete associated images from filesystem
        List<PostImage> images = postImageRepository.findByPostOrderByOrderIndexAsc(post);
        for (PostImage image : images) {
            deleteImageFile(image.getImageUrl());
        }

        postRepository.delete(post);
    }

    /**
     * Get posts feed (posts from friends)
     */
    public Page<PostResponse> getPostsFeed(Long userId, int page, int size) {
        // Get list of friend IDs
        List<Long> friendIds = getFriendIds(userId);
        
        // Include current user's own posts
        friendIds.add(userId);

        int pageSize = Math.min(size > 0 ? size : DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, pageSize);

        Page<Post> posts = postRepository.findByAuthorIdInOrderByCreatedAtDesc(friendIds, pageable);
        return posts.map(post -> mapToResponse(post, userId));
    }

    /**
     * Upload images for a post
     */
    public PostResponse uploadPostImages(Long postId, Long userId, List<MultipartFile> imageFiles) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));

            // Verify ownership
            if (!post.getAuthor().getId().equals(userId)) {
                throw new RuntimeException("You can only add images to your own posts");
            }

            // Validate that we have files
            if (imageFiles == null || imageFiles.isEmpty()) {
                throw new RuntimeException("No image files provided");
            }

            // Validate image count
            int existingImageCount = postImageRepository.findByPostOrderByOrderIndexAsc(post).size();
            if (existingImageCount + imageFiles.size() > MAX_IMAGES_PER_POST) {
                throw new RuntimeException("Maximum " + MAX_IMAGES_PER_POST + " images allowed per post");
            }

            // Validate and save images
            List<PostImage> savedImages = new ArrayList<>();
            int nextOrderIndex = existingImageCount;

            for (MultipartFile file : imageFiles) {
                if (file == null || file.isEmpty()) {
                    System.err.println("Warning: Skipping null or empty file");
                    continue;
                }
                
                try {
                    validateImageFile(file);
                    String imageUrl = saveImageFile(file);
                    
                    PostImage postImage = new PostImage();
                    postImage.setPost(post);
                    postImage.setImageUrl(imageUrl);
                    postImage.setOrderIndex(nextOrderIndex++);
                    
                    savedImages.add(postImageRepository.save(postImage));
                } catch (Exception e) {
                    System.err.println("Error processing image file: " + e.getMessage());
                    e.printStackTrace();
                    // Continue with other files, but log the error
                    throw new RuntimeException("Failed to process image: " + e.getMessage(), e);
                }
            }

            if (savedImages.isEmpty()) {
                throw new RuntimeException("No images were successfully uploaded");
            }

        // Refresh post to get updated images
        post = postRepository.findById(postId).orElse(post);
        return mapToResponse(post, userId);
        } catch (RuntimeException e) {
            // Re-throw runtime exceptions as-is
            throw e;
        } catch (Exception e) {
            // Wrap other exceptions
            e.printStackTrace();
            throw new RuntimeException("Unexpected error uploading images: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a post image
     */
    public void deletePostImage(Long imageId, Long userId) {
        PostImage image = postImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        // Verify ownership
        if (!image.getPost().getAuthor().getId().equals(userId)) {
            throw new RuntimeException("You can only delete images from your own posts");
        }

        // Delete file from filesystem
        deleteImageFile(image.getImageUrl());

        // Delete from database
        postImageRepository.delete(image);
    }

    /**
     * Get friend IDs for a user
     */
    private List<Long> getFriendIds(Long userId) {
        // This would need to be implemented based on FriendRequestRepository
        // For now, using a simple approach - get all accepted friend requests
        return friendRequestRepository.findAcceptedFriendships(userId, Pageable.unpaged())
                .getContent()
                .stream()
                .map(fr -> {
                    if (fr.getSender().getId().equals(userId)) {
                        return fr.getReceiver().getId();
                    } else {
                        return fr.getSender().getId();
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * Map Post to PostResponse DTO
     */
    private PostResponse mapToResponse(Post post) {
        return mapToResponse(post, null);
    }

    /**
     * Map Post to PostResponse DTO with current user context (for like status)
     */
    private PostResponse mapToResponse(Post post, Long currentUserId) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setAuthorId(post.getAuthor().getId());
        response.setAuthorEmail(post.getAuthor().getEmail());
        response.setAuthorFullName(post.getAuthor().getFullName());
        response.setContent(post.getContent());
        response.setCreatedAt(post.getCreatedAt() != null ? post.getCreatedAt().format(DATE_FORMATTER) : null);
        response.setUpdatedAt(post.getUpdatedAt() != null ? post.getUpdatedAt().format(DATE_FORMATTER) : null);

        // Get author profile photo
        profileRepository.findByUser(post.getAuthor()).ifPresent(profile -> {
            response.setAuthorProfilePhotoUrl(profile.getProfilePhotoUrl());
        });

        // Map images (ordered by orderIndex)
        // Force load images if lazy loaded
        List<PostImage> postImages = postImageRepository.findByPostOrderByOrderIndexAsc(post);
        List<PostImageResponse> imageResponses = postImages.stream()
                .map(this::mapImageToResponse)
                .collect(Collectors.toList());
        response.setImages(imageResponses);

        // Get reaction counts for each type
        response.setHeartCount(reactionRepository.countByPostIdAndReactionType(post.getId(), 
            com.socialapp.model.PostReaction.ReactionType.HEART));
        response.setThumbsUpCount(reactionRepository.countByPostIdAndReactionType(post.getId(), 
            com.socialapp.model.PostReaction.ReactionType.THUMBS_UP));
        response.setLaughCount(reactionRepository.countByPostIdAndReactionType(post.getId(), 
            com.socialapp.model.PostReaction.ReactionType.LAUGH));
        response.setSadCount(reactionRepository.countByPostIdAndReactionType(post.getId(), 
            com.socialapp.model.PostReaction.ReactionType.SAD));
        response.setAngryCount(reactionRepository.countByPostIdAndReactionType(post.getId(), 
            com.socialapp.model.PostReaction.ReactionType.ANGRY));
        response.setThumbsDownCount(reactionRepository.countByPostIdAndReactionType(post.getId(), 
            com.socialapp.model.PostReaction.ReactionType.THUMBS_DOWN));

        // Get current user's reaction (if any)
        if (currentUserId != null) {
            Optional<com.socialapp.model.PostReaction> userReaction = 
                reactionRepository.findByPostIdAndUserId(post.getId(), currentUserId);
            response.setUserReaction(userReaction.map(r -> r.getReactionType().name()).orElse(null));
        } else {
            response.setUserReaction(null);
        }

        return response;
    }

    /**
     * Map PostImage to PostImageResponse DTO
     */
    private PostImageResponse mapImageToResponse(PostImage image) {
        PostImageResponse response = new PostImageResponse();
        response.setId(image.getId());
        response.setImageUrl(image.getImageUrl());
        response.setOrderIndex(image.getOrderIndex());
        response.setCreatedAt(image.getCreatedAt() != null ? image.getCreatedAt().format(DATE_FORMATTER) : null);
        return response;
    }

    /**
     * Validate image file
     */
    private void validateImageFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Image file cannot be empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("File must be an image");
        }

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new RuntimeException("Image size cannot exceed 5MB");
        }
    }

    /**
     * Save image file and return filename
     */
    private String saveImageFile(MultipartFile file) {
        try {
            // Create upload directory if it doesn't exist
            // Use absolute path relative to user directory or project root
            Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return only filename (not full path)
            return filename;
        } catch (IOException e) {
            e.printStackTrace(); // Log the full stack trace
            throw new RuntimeException("Failed to save image file: " + e.getMessage(), e);
        } catch (Exception e) {
            e.printStackTrace(); // Log any other exceptions
            throw new RuntimeException("Unexpected error saving image file: " + e.getMessage(), e);
        }
    }

    /**
     * Delete image file from filesystem
     */
    private void deleteImageFile(String imageUrl) {
        try {
            // Extract filename (handle both full path and filename)
            String filename = imageUrl;
            if (filename.contains("/")) {
                filename = filename.substring(filename.lastIndexOf("/") + 1);
            }
            if (filename.contains("\\")) {
                filename = filename.substring(filename.lastIndexOf("\\") + 1);
            }

            Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            // Log error but don't throw - file might already be deleted
            System.err.println("Failed to delete image file: " + e.getMessage());
        }
    }
}

