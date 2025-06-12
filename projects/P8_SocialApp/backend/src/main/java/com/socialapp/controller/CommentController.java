package com.socialapp.controller;

import com.socialapp.dto.*;
import com.socialapp.model.CommentReaction;
import com.socialapp.model.User;
import com.socialapp.repository.PostRepository;
import com.socialapp.repository.UserRepository;
import com.socialapp.service.CommentReactionService;
import com.socialapp.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private CommentReactionService commentReactionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PostRepository postRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    /**
     * Get comments for a post
     * GET /api/posts/{postId}/comments?page={page}&size={size}
     */
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getComments(
            @PathVariable Long postId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            Long userId = getCurrentUserId();
            Page<CommentResponse> comments = commentService.getCommentsForPost(postId, userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Comments retrieved successfully", comments));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while retrieving comments"));
        }
    }

    /**
     * Create a comment on a post
     * POST /api/posts/{postId}/comments
     */
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request) {
        try {
            Long userId = getCurrentUserId();
            CommentResponse comment = commentService.createComment(postId, userId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Comment created successfully", comment));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while creating comment"));
        }
    }

    /**
     * Create a reply to a comment
     * POST /api/comments/{commentId}/replies
     */
    @PostMapping("/comments/{commentId}/replies")
    public ResponseEntity<ApiResponse<CommentResponse>> createReply(
            @PathVariable Long commentId,
            @Valid @RequestBody CreateCommentRequest request) {
        try {
            Long userId = getCurrentUserId();
            
            // Get the parent comment to find the post ID
            CommentResponse parentComment = commentService.getCommentById(commentId, userId);
            Long postId = parentComment.getPostId();
            
            // Set parent comment ID in request
            request.setParentCommentId(commentId);
            
            CommentResponse reply = commentService.createComment(postId, userId, request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Reply created successfully", reply));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while creating reply"));
        }
    }

    /**
     * Get a single comment by ID
     * GET /api/comments/{commentId}
     */
    @GetMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> getComment(@PathVariable Long commentId) {
        try {
            Long userId = getCurrentUserId();
            CommentResponse comment = commentService.getCommentById(commentId, userId);
            return ResponseEntity.ok(ApiResponse.success("Comment retrieved successfully", comment));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while retrieving comment"));
        }
    }

    /**
     * Update a comment
     * PUT /api/comments/{commentId}
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody UpdateCommentRequest request) {
        try {
            Long userId = getCurrentUserId();
            CommentResponse comment = commentService.updateComment(commentId, userId, request);
            return ResponseEntity.ok(ApiResponse.success("Comment updated successfully", comment));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while updating comment"));
        }
    }

    /**
     * Delete a comment
     * DELETE /api/comments/{commentId}
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long commentId) {
        try {
            Long userId = getCurrentUserId();
            
            // Get comment to find post author
            CommentResponse comment = commentService.getCommentById(commentId, userId);
            Long postId = comment.getPostId();
            Long postAuthorId = postRepository.findById(postId)
                    .map(post -> post.getAuthor().getId())
                    .orElse(null);
            
            commentService.deleteComment(commentId, userId, postAuthorId);
            return ResponseEntity.ok(ApiResponse.success("Comment deleted successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while deleting comment"));
        }
    }

    /**
     * Add or update reaction on a comment
     * POST /api/comments/{commentId}/reactions
     */
    @PostMapping("/comments/{commentId}/reactions")
    public ResponseEntity<ApiResponse<CommentReactionResponse>> addReaction(
            @PathVariable Long commentId,
            @Valid @RequestBody AddCommentReactionRequest request) {
        try {
            Long userId = getCurrentUserId();
            
            // Parse reaction type
            CommentReaction.ReactionType reactionType;
            try {
                reactionType = CommentReaction.ReactionType.valueOf(request.getReactionType());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid reaction type. Must be either LIKE or DISLIKE"));
            }
            
            CommentReactionResponse response = commentReactionService.addOrUpdateReaction(commentId, userId, reactionType);
            
            if (response.getReactionType() == null) {
                return ResponseEntity.ok(ApiResponse.success("Reaction removed successfully", response));
            } else {
                return ResponseEntity.ok(ApiResponse.success("Reaction added successfully", response));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while adding reaction"));
        }
    }

    /**
     * Remove reaction from a comment
     * DELETE /api/comments/{commentId}/reactions
     */
    @DeleteMapping("/comments/{commentId}/reactions")
    public ResponseEntity<ApiResponse<Void>> removeReaction(@PathVariable Long commentId) {
        try {
            Long userId = getCurrentUserId();
            commentReactionService.removeReaction(commentId, userId);
            return ResponseEntity.ok(ApiResponse.success("Reaction removed successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while removing reaction"));
        }
    }

    /**
     * Get reaction counts for a comment
     * GET /api/comments/{commentId}/reactions
     */
    @GetMapping("/comments/{commentId}/reactions")
    public ResponseEntity<ApiResponse<CommentReactionCountsResponse>> getReactionCounts(@PathVariable Long commentId) {
        try {
            CommentReactionCountsResponse response = commentReactionService.getReactionCounts(commentId);
            return ResponseEntity.ok(ApiResponse.success("Reaction counts retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while retrieving reaction counts"));
        }
    }
}

