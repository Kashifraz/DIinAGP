package com.socialapp.controller;

import com.socialapp.dto.AddReactionRequest;
import com.socialapp.dto.ApiResponse;
import com.socialapp.dto.ReactionCountsResponse;
import com.socialapp.dto.ReactionResponse;
import com.socialapp.model.PostReaction;
import com.socialapp.model.User;
import com.socialapp.repository.UserRepository;
import com.socialapp.service.ReactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
public class ReactionController {

    @Autowired
    private ReactionService reactionService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    /**
     * Add or update reaction on a post
     * POST /api/posts/{postId}/reactions
     * 
     * If same reaction exists, it will be removed (toggle off)
     * If different reaction exists, it will be updated to new type
     */
    @PostMapping("/{postId}/reactions")
    public ResponseEntity<ApiResponse<ReactionResponse>> addReaction(
            @PathVariable Long postId,
            @Valid @RequestBody AddReactionRequest request) {
        try {
            Long userId = getCurrentUserId();
            
            // Parse reaction type
            PostReaction.ReactionType reactionType;
            try {
                reactionType = PostReaction.ReactionType.valueOf(request.getReactionType());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid reaction type. Must be one of: HEART, THUMBS_UP, LAUGH, SAD, ANGRY, THUMBS_DOWN"));
            }
            
            ReactionResponse response = reactionService.addOrUpdateReaction(postId, userId, reactionType);
            
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
     * Remove reaction from a post
     * DELETE /api/posts/{postId}/reactions
     */
    @DeleteMapping("/{postId}/reactions")
    public ResponseEntity<ApiResponse<Void>> removeReaction(@PathVariable Long postId) {
        try {
            Long userId = getCurrentUserId();
            reactionService.removeReaction(postId, userId);
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
     * Get reaction counts for a post
     * GET /api/posts/{postId}/reactions
     */
    @GetMapping("/{postId}/reactions")
    public ResponseEntity<ApiResponse<ReactionCountsResponse>> getReactionCounts(@PathVariable Long postId) {
        try {
            ReactionCountsResponse response = reactionService.getReactionCounts(postId);
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

