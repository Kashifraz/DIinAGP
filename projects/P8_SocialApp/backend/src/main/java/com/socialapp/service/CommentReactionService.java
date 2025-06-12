package com.socialapp.service;

import com.socialapp.dto.CommentReactionCountsResponse;
import com.socialapp.dto.CommentReactionResponse;
import com.socialapp.model.Comment;
import com.socialapp.model.CommentReaction;
import com.socialapp.model.User;
import com.socialapp.repository.CommentReactionRepository;
import com.socialapp.repository.CommentRepository;
import com.socialapp.repository.FriendRequestRepository;
import com.socialapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@Transactional
public class CommentReactionService {

    @Autowired
    private CommentReactionRepository reactionRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private NotificationService notificationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    /**
     * Add or update reaction on a comment
     * - If no reaction exists, add new reaction
     * - If same reaction exists, remove it (toggle off)
     * - If different reaction exists, update to new reaction type
     * Only friends can react to comments
     */
    public CommentReactionResponse addOrUpdateReaction(Long commentId, Long userId, CommentReaction.ReactionType reactionType) {
        // Validate comment exists
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is a friend of the comment author (authorization)
        boolean areFriends = friendRequestRepository.areFriends(userId, comment.getAuthor().getId());
        if (!areFriends) {
            throw new RuntimeException("You can only react to comments from your friends");
        }

        // Check if reaction already exists
        Optional<CommentReaction> existingReaction = reactionRepository.findByCommentIdAndUserId(commentId, userId);

        if (existingReaction.isPresent()) {
            CommentReaction reaction = existingReaction.get();
            
            // If same reaction type, remove it (toggle off)
            if (reaction.getReactionType() == reactionType) {
                reactionRepository.delete(reaction);
                return createReactionResponse(null, commentId, userId, null);
            } else {
                // If different reaction type, update it
                reaction.setReactionType(reactionType);
                reaction = reactionRepository.save(reaction);
                
                // Send notification if it's a LIKE reaction
                if (reactionType == CommentReaction.ReactionType.LIKE) {
                    Long commentAuthorId = comment.getAuthor().getId();
                    Long postId = comment.getPost().getId();
                    notificationService.sendCommentLikeNotification(commentAuthorId, userId, postId);
                }
                
                return createReactionResponse(reaction, commentId, userId, reactionType);
            }
        } else {
            // Create new reaction
            CommentReaction reaction = new CommentReaction();
            reaction.setComment(comment);
            reaction.setUser(user);
            reaction.setReactionType(reactionType);
            reaction = reactionRepository.save(reaction);
            
            // Send notification if it's a LIKE reaction
            if (reactionType == CommentReaction.ReactionType.LIKE) {
                Long commentAuthorId = comment.getAuthor().getId();
                Long postId = comment.getPost().getId();
                notificationService.sendCommentLikeNotification(commentAuthorId, userId, postId);
            }
            
            return createReactionResponse(reaction, commentId, userId, reactionType);
        }
    }

    /**
     * Remove reaction from a comment
     */
    public void removeReaction(Long commentId, Long userId) {
        CommentReaction reaction = reactionRepository.findByCommentIdAndUserId(commentId, userId)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));
        
        reactionRepository.delete(reaction);
    }

    /**
     * Get reaction counts for a comment
     */
    public CommentReactionCountsResponse getReactionCounts(Long commentId) {
        // Verify comment exists
        if (!commentRepository.existsById(commentId)) {
            throw new RuntimeException("Comment not found");
        }

        long likeCount = reactionRepository.countByCommentIdAndReactionType(
                commentId, CommentReaction.ReactionType.LIKE);
        long dislikeCount = reactionRepository.countByCommentIdAndReactionType(
                commentId, CommentReaction.ReactionType.DISLIKE);

        CommentReactionCountsResponse response = new CommentReactionCountsResponse();
        response.setCommentId(commentId);
        response.setLikeCount(likeCount);
        response.setDislikeCount(dislikeCount);
        return response;
    }

    /**
     * Get user's reaction to a comment
     */
    public String getUserReaction(Long commentId, Long userId) {
        Optional<CommentReaction> reaction = reactionRepository.findByCommentIdAndUserId(commentId, userId);
        return reaction.map(r -> r.getReactionType().name()).orElse(null);
    }

    /**
     * Create CommentReactionResponse DTO
     */
    private CommentReactionResponse createReactionResponse(CommentReaction reaction, Long commentId, Long userId, CommentReaction.ReactionType reactionType) {
        CommentReactionResponse response = new CommentReactionResponse();
        if (reaction != null) {
            response.setId(reaction.getId());
            response.setCreatedAt(reaction.getCreatedAt() != null ? reaction.getCreatedAt().format(DATE_FORMATTER) : null);
            response.setUpdatedAt(reaction.getUpdatedAt() != null ? reaction.getUpdatedAt().format(DATE_FORMATTER) : null);
        }
        response.setCommentId(commentId);
        response.setUserId(userId);
        response.setReactionType(reactionType != null ? reactionType.name() : null);
        
        // Get user details
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            response.setUserEmail(user.getEmail());
            response.setUserFullName(user.getFullName());
        }
        
        return response;
    }
}

