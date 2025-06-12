package com.socialapp.service;

import com.socialapp.dto.LiveNotification;
import com.socialapp.model.Profile;
import com.socialapp.model.User;
import com.socialapp.repository.ProfileRepository;
import com.socialapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    /**
     * Send a live notification to a specific user via WebSocket
     * 
     * @param userId The ID of the user to receive the notification
     * @param notification The notification to send
     */
    public void sendNotification(Long userId, LiveNotification notification) {
        // Send notification to user-specific channel: /topic/user/{userId}
        String destination = "/topic/user/" + userId;
        messagingTemplate.convertAndSend(destination, notification);
    }

    /**
     * Create and send a LIKE notification
     * 
     * @param postOwnerId The ID of the post owner (notification recipient)
     * @param actorId The ID of the user who liked the post
     * @param postId The ID of the post that was liked
     */
    public void sendLikeNotification(Long postOwnerId, Long actorId, Long postId) {
        // Don't send notification if user likes their own post
        if (postOwnerId.equals(actorId)) {
            return;
        }

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Actor user not found"));

        LiveNotification.ActorInfo actorInfo = buildActorInfo(actor);

        String message = actor.getFullName() + " liked your post";
        
        LiveNotification notification = new LiveNotification(
                "LIKE",
                message,
                postId,
                actorInfo,
                LocalDateTime.now().format(DATE_FORMATTER)
        );

        sendNotification(postOwnerId, notification);
    }

    /**
     * Create and send a COMMENT notification
     * 
     * @param postOwnerId The ID of the post owner (notification recipient)
     * @param actorId The ID of the user who commented
     * @param postId The ID of the post that was commented on
     */
    public void sendCommentNotification(Long postOwnerId, Long actorId, Long postId) {
        // Don't send notification if user comments on their own post
        if (postOwnerId.equals(actorId)) {
            return;
        }

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Actor user not found"));

        LiveNotification.ActorInfo actorInfo = buildActorInfo(actor);

        String message = actor.getFullName() + " commented on your post";
        
        LiveNotification notification = new LiveNotification(
                "COMMENT",
                message,
                postId,
                actorInfo,
                LocalDateTime.now().format(DATE_FORMATTER)
        );

        sendNotification(postOwnerId, notification);
    }

    /**
     * Create and send a FRIEND_REQUEST notification
     * 
     * @param receiverId The ID of the user receiving the friend request (notification recipient)
     * @param senderId The ID of the user who sent the friend request
     */
    public void sendFriendRequestNotification(Long receiverId, Long senderId) {
        // Don't send notification if user sends request to themselves
        if (receiverId.equals(senderId)) {
            return;
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender user not found"));

        LiveNotification.ActorInfo actorInfo = buildActorInfo(sender);

        String message = sender.getFullName() + " sent you a friend request";
        
        LiveNotification notification = new LiveNotification(
                "FRIEND_REQUEST",
                message,
                null, // No post ID for friend requests
                actorInfo,
                LocalDateTime.now().format(DATE_FORMATTER)
        );

        sendNotification(receiverId, notification);
    }

    /**
     * Create and send a FRIEND_ACCEPTED notification
     * 
     * @param senderId The ID of the user who originally sent the friend request (notification recipient)
     * @param accepterId The ID of the user who accepted the friend request
     */
    public void sendFriendAcceptedNotification(Long senderId, Long accepterId) {
        // Don't send notification if user accepts their own request
        if (senderId.equals(accepterId)) {
            return;
        }

        User accepter = userRepository.findById(accepterId)
                .orElseThrow(() -> new RuntimeException("Accepter user not found"));

        LiveNotification.ActorInfo actorInfo = buildActorInfo(accepter);

        String message = accepter.getFullName() + " accepted your friend request";
        
        LiveNotification notification = new LiveNotification(
                "FRIEND_ACCEPTED",
                message,
                null, // No post ID for friend acceptances
                actorInfo,
                LocalDateTime.now().format(DATE_FORMATTER)
        );

        sendNotification(senderId, notification);
    }

    /**
     * Create and send a COMMENT_REPLY notification
     * 
     * @param commentAuthorId The ID of the comment author (notification recipient)
     * @param actorId The ID of the user who replied
     * @param postId The ID of the post containing the comment
     */
    public void sendCommentReplyNotification(Long commentAuthorId, Long actorId, Long postId) {
        // Don't send notification if user replies to their own comment
        if (commentAuthorId.equals(actorId)) {
            return;
        }

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Actor user not found"));

        LiveNotification.ActorInfo actorInfo = buildActorInfo(actor);

        String message = actor.getFullName() + " replied to your comment";
        
        LiveNotification notification = new LiveNotification(
                "COMMENT_REPLY",
                message,
                postId,
                actorInfo,
                LocalDateTime.now().format(DATE_FORMATTER)
        );

        sendNotification(commentAuthorId, notification);
    }

    /**
     * Create and send a COMMENT_LIKE notification
     * 
     * @param commentAuthorId The ID of the comment author (notification recipient)
     * @param actorId The ID of the user who liked the comment
     * @param postId The ID of the post containing the comment
     */
    public void sendCommentLikeNotification(Long commentAuthorId, Long actorId, Long postId) {
        // Don't send notification if user likes their own comment
        if (commentAuthorId.equals(actorId)) {
            return;
        }

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new RuntimeException("Actor user not found"));

        LiveNotification.ActorInfo actorInfo = buildActorInfo(actor);

        String message = actor.getFullName() + " liked your comment";
        
        LiveNotification notification = new LiveNotification(
                "COMMENT_LIKE",
                message,
                postId,
                actorInfo,
                LocalDateTime.now().format(DATE_FORMATTER)
        );

        sendNotification(commentAuthorId, notification);
    }

    /**
     * Build ActorInfo from User entity
     */
    private LiveNotification.ActorInfo buildActorInfo(User user) {
        LiveNotification.ActorInfo actorInfo = new LiveNotification.ActorInfo();
        actorInfo.setId(user.getId());
        actorInfo.setEmail(user.getEmail());
        actorInfo.setFullName(user.getFullName());

        // Get profile photo URL if available
        Optional<Profile> profile = profileRepository.findByUser(user);
        if (profile.isPresent() && profile.get().getProfilePhotoUrl() != null) {
            actorInfo.setProfilePhotoUrl(profile.get().getProfilePhotoUrl());
        }

        return actorInfo;
    }
}

