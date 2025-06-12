package com.socialapp.service;

import com.socialapp.dto.CommentResponse;
import com.socialapp.dto.CreateCommentRequest;
import com.socialapp.dto.UpdateCommentRequest;
import com.socialapp.model.Comment;
import com.socialapp.model.Post;
import com.socialapp.model.Profile;
import com.socialapp.model.User;
import com.socialapp.repository.CommentRepository;
import com.socialapp.repository.CommentReactionRepository;
import com.socialapp.repository.FriendRequestRepository;
import com.socialapp.repository.PostRepository;
import com.socialapp.repository.ProfileRepository;
import com.socialapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private CommentReactionRepository commentReactionRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private NotificationService notificationService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    /**
     * Create a new comment on a post
     */
    public CommentResponse createComment(Long postId, Long userId, CreateCommentRequest request) {
        // Validate post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is a friend of the post author OR is the post author themselves (authorization)
        boolean areFriends = friendRequestRepository.areFriends(userId, post.getAuthor().getId());
        boolean isPostAuthor = userId.equals(post.getAuthor().getId());
        if (!areFriends && !isPostAuthor) {
            throw new RuntimeException("You can only comment on posts from your friends");
        }

        // If this is a reply, validate parent comment exists and belongs to the same post
        Comment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));
            
            if (!parentComment.getPost().getId().equals(postId)) {
                throw new RuntimeException("Parent comment does not belong to this post");
            }
        }

        // Create comment
        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(user);
        comment.setContent(request.getContent());
        comment.setParentComment(parentComment);
        comment = commentRepository.save(comment);

        // Send notifications
        if (parentComment == null) {
            // Top-level comment: notify post owner
            Long postOwnerId = post.getAuthor().getId();
            notificationService.sendCommentNotification(postOwnerId, userId, postId);
        } else {
            // Reply: notify parent comment author
            Long parentCommentAuthorId = parentComment.getAuthor().getId();
            notificationService.sendCommentReplyNotification(parentCommentAuthorId, userId, postId);
        }

        return mapToResponse(comment, userId);
    }

    /**
     * Get comments for a post with nested replies
     */
    public Page<CommentResponse> getCommentsForPost(Long postId, Long currentUserId, int page, int size) {
        // Validate post exists
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found");
        }

        int pageSize = Math.min(size > 0 ? size : DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, pageSize);

        // Get top-level comments (no parent)
        Page<Comment> topLevelComments = commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedAtDesc(postId, pageable);

        return topLevelComments.map(comment -> {
            CommentResponse response = mapToResponse(comment, currentUserId);
            // Load replies for this comment
            List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
            response.setReplies(replies.stream()
                    .map(reply -> mapToResponse(reply, currentUserId))
                    .collect(Collectors.toList()));
            return response;
        });
    }

    /**
     * Get a single comment by ID
     */
    public CommentResponse getCommentById(Long commentId, Long currentUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        CommentResponse response = mapToResponse(comment, currentUserId);
        
        // Load replies if any
        List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(commentId);
        response.setReplies(replies.stream()
                .map(reply -> mapToResponse(reply, currentUserId))
                .collect(Collectors.toList()));

        return response;
    }

    /**
     * Update a comment
     */
    public CommentResponse updateComment(Long commentId, Long userId, UpdateCommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Authorization: only author can update
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("You can only update your own comments");
        }

        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);

        return mapToResponse(comment, userId);
    }

    /**
     * Delete a comment
     */
    public void deleteComment(Long commentId, Long userId, Long postAuthorId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Authorization: author or post author can delete
        boolean isAuthor = comment.getAuthor().getId().equals(userId);
        boolean isPostAuthor = postAuthorId.equals(userId);

        if (!isAuthor && !isPostAuthor) {
            throw new RuntimeException("You can only delete your own comments or comments on your posts");
        }

        // Cascading delete will handle replies automatically
        commentRepository.delete(comment);
    }

    /**
     * Map Comment entity to CommentResponse DTO
     */
    private CommentResponse mapToResponse(Comment comment, Long currentUserId) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setPostId(comment.getPost().getId());
        response.setAuthorId(comment.getAuthor().getId());
        response.setAuthorEmail(comment.getAuthor().getEmail());
        response.setAuthorFullName(comment.getAuthor().getFullName());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt() != null ? comment.getCreatedAt().format(DATE_FORMATTER) : null);
        response.setUpdatedAt(comment.getUpdatedAt() != null ? comment.getUpdatedAt().format(DATE_FORMATTER) : null);

        // Set parent comment ID if this is a reply
        if (comment.getParentComment() != null) {
            response.setParentCommentId(comment.getParentComment().getId());
        }

        // Get author profile photo
        profileRepository.findByUser(comment.getAuthor()).ifPresent(profile -> {
            response.setAuthorProfilePhotoUrl(profile.getProfilePhotoUrl());
        });

        // Get reaction counts
        long likeCount = commentReactionRepository.countByCommentIdAndReactionType(
                comment.getId(), com.socialapp.model.CommentReaction.ReactionType.LIKE);
        long dislikeCount = commentReactionRepository.countByCommentIdAndReactionType(
                comment.getId(), com.socialapp.model.CommentReaction.ReactionType.DISLIKE);
        
        response.setLikeCount(likeCount);
        response.setDislikeCount(dislikeCount);

        // Get current user's reaction (if any)
        if (currentUserId != null) {
            Optional<com.socialapp.model.CommentReaction> userReaction = 
                commentReactionRepository.findByCommentIdAndUserId(comment.getId(), currentUserId);
            
            if (userReaction.isPresent()) {
                com.socialapp.model.CommentReaction.ReactionType reactionType = userReaction.get().getReactionType();
                response.setIsLiked(reactionType == com.socialapp.model.CommentReaction.ReactionType.LIKE);
                response.setIsDisliked(reactionType == com.socialapp.model.CommentReaction.ReactionType.DISLIKE);
            } else {
                response.setIsLiked(false);
                response.setIsDisliked(false);
            }
        } else {
            response.setIsLiked(false);
            response.setIsDisliked(false);
        }

        return response;
    }
}

