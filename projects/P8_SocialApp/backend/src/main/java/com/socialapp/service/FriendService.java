package com.socialapp.service;

import com.socialapp.dto.FriendRequestResponse;
import com.socialapp.dto.FriendResponse;
import com.socialapp.model.FriendRequest;
import com.socialapp.model.Profile;
import com.socialapp.model.User;
import com.socialapp.repository.FriendRequestRepository;
import com.socialapp.repository.ProfileRepository;
import com.socialapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class FriendService {

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private NotificationService notificationService;

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    /**
     * Send a friend request
     */
    public FriendRequestResponse sendFriendRequest(Long senderId, Long receiverId) {
        // Validate users exist
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender user not found"));
        
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver user not found"));

        // Cannot send request to yourself
        if (senderId.equals(receiverId)) {
            throw new RuntimeException("Cannot send friend request to yourself");
        }

        // Check if friend request already exists (in either direction)
        Optional<FriendRequest> existingRequest = friendRequestRepository
                .findFriendRequestBetweenUsers(senderId, receiverId);
        
        if (existingRequest.isPresent()) {
            FriendRequest request = existingRequest.get();
            if (request.getStatus() == FriendRequest.FriendRequestStatus.PENDING) {
                throw new RuntimeException("Friend request already exists");
            } else if (request.getStatus() == FriendRequest.FriendRequestStatus.ACCEPTED) {
                throw new RuntimeException("Users are already friends");
            } else if (request.getStatus() == FriendRequest.FriendRequestStatus.REJECTED) {
                // If the existing request has the same sender/receiver, allow resending
                if (request.getSender().getId().equals(senderId) && 
                    request.getReceiver().getId().equals(receiverId)) {
                    // Resend the same request
                    request.setStatus(FriendRequest.FriendRequestStatus.PENDING);
                    FriendRequest updated = friendRequestRepository.save(request);
                    
                    // Send notification to receiver
                    notificationService.sendFriendRequestNotification(receiverId, senderId);
                    
                    return mapToFriendRequestResponse(updated);
                } else {
                    // Different direction - delete old and create new
                    friendRequestRepository.delete(request);
                }
            }
        }

        // Create new friend request
        FriendRequest friendRequest = new FriendRequest();
        friendRequest.setSender(sender);
        friendRequest.setReceiver(receiver);
        friendRequest.setStatus(FriendRequest.FriendRequestStatus.PENDING);

        FriendRequest saved = friendRequestRepository.save(friendRequest);
        
        // Send notification to receiver
        notificationService.sendFriendRequestNotification(receiverId, senderId);
        
        return mapToFriendRequestResponse(saved);
    }

    /**
     * Accept a friend request
     */
    public FriendRequestResponse acceptFriendRequest(Long receiverId, Long requestId) {
        FriendRequest friendRequest = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        // Verify the receiver is the one accepting
        if (!friendRequest.getReceiver().getId().equals(receiverId)) {
            throw new RuntimeException("You can only accept friend requests sent to you");
        }

        // Check if already accepted
        if (friendRequest.getStatus() == FriendRequest.FriendRequestStatus.ACCEPTED) {
            throw new RuntimeException("Friend request already accepted");
        }

        // Update status to ACCEPTED
        friendRequest.setStatus(FriendRequest.FriendRequestStatus.ACCEPTED);
        FriendRequest updated = friendRequestRepository.save(friendRequest);

        // Send notification to sender (original requester)
        Long senderId = friendRequest.getSender().getId();
        notificationService.sendFriendAcceptedNotification(senderId, receiverId);

        return mapToFriendRequestResponse(updated);
    }

    /**
     * Reject a friend request
     */
    public FriendRequestResponse rejectFriendRequest(Long receiverId, Long requestId) {
        FriendRequest friendRequest = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        // Verify the receiver is the one rejecting
        if (!friendRequest.getReceiver().getId().equals(receiverId)) {
            throw new RuntimeException("You can only reject friend requests sent to you");
        }

        // Check if already rejected
        if (friendRequest.getStatus() == FriendRequest.FriendRequestStatus.REJECTED) {
            throw new RuntimeException("Friend request already rejected");
        }

        // Update status to REJECTED
        friendRequest.setStatus(FriendRequest.FriendRequestStatus.REJECTED);
        FriendRequest updated = friendRequestRepository.save(friendRequest);

        return mapToFriendRequestResponse(updated);
    }

    /**
     * Get pending friend requests received by user
     */
    public Page<FriendRequestResponse> getPendingReceivedRequests(Long userId, int page, int size) {
        int pageSize = Math.min(size > 0 ? size : DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, pageSize);
        
        Page<FriendRequest> requests = friendRequestRepository
                .findByReceiverIdAndStatus(userId, FriendRequest.FriendRequestStatus.PENDING, pageable);
        
        return requests.map(this::mapToFriendRequestResponse);
    }

    /**
     * Get pending friend requests sent by user
     */
    public Page<FriendRequestResponse> getPendingSentRequests(Long userId, int page, int size) {
        int pageSize = Math.min(size > 0 ? size : DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, pageSize);
        
        Page<FriendRequest> requests = friendRequestRepository
                .findBySenderIdAndStatus(userId, FriendRequest.FriendRequestStatus.PENDING, pageable);
        
        return requests.map(this::mapToFriendRequestResponse);
    }

    /**
     * Get all friends (accepted friend requests)
     */
    public Page<FriendResponse> getFriends(Long userId, int page, int size) {
        int pageSize = Math.min(size > 0 ? size : DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, pageSize);
        
        Page<FriendRequest> friendships = friendRequestRepository
                .findAcceptedFriendships(userId, pageable);
        
        return friendships.map(fr -> mapToFriendResponse(fr, userId));
    }

    /**
     * Check if two users are friends
     */
    public boolean areFriends(Long userId1, Long userId2) {
        return friendRequestRepository.areFriends(userId1, userId2);
    }

    /**
     * Cancel a sent friend request
     */
    public void cancelFriendRequest(Long senderId, Long requestId) {
        FriendRequest friendRequest = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        // Verify the sender is the one canceling
        if (!friendRequest.getSender().getId().equals(senderId)) {
            throw new RuntimeException("You can only cancel friend requests you sent");
        }

        // Only allow canceling pending requests
        if (friendRequest.getStatus() != FriendRequest.FriendRequestStatus.PENDING) {
            throw new RuntimeException("Can only cancel pending friend requests");
        }

        friendRequestRepository.delete(friendRequest);
    }

    /**
     * Unfriend a user (remove friendship)
     * This deletes the ACCEPTED friend request, effectively removing the friendship
     */
    public void unfriend(Long userId, Long friendId) {
        // Validate users exist
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        User friend = userRepository.findById(friendId)
                .orElseThrow(() -> new RuntimeException("Friend user not found"));

        // Find the friend request (friendship) between the two users
        Optional<FriendRequest> friendship = friendRequestRepository
                .findFriendRequestBetweenUsers(userId, friendId);

        if (friendship.isEmpty()) {
            throw new RuntimeException("Friendship not found");
        }

        FriendRequest friendRequest = friendship.get();

        // Verify it's an accepted request (friendship)
        if (friendRequest.getStatus() != FriendRequest.FriendRequestStatus.ACCEPTED) {
            throw new RuntimeException("Users are not friends");
        }

        // Verify the user is part of this friendship
        if (!friendRequest.getSender().getId().equals(userId) && 
            !friendRequest.getReceiver().getId().equals(userId)) {
            throw new RuntimeException("You can only unfriend your own friends");
        }

        // Delete the friendship (friend request with ACCEPTED status)
        friendRequestRepository.delete(friendRequest);
    }

    /**
     * Map FriendRequest to FriendRequestResponse DTO
     */
    private FriendRequestResponse mapToFriendRequestResponse(FriendRequest fr) {
        FriendRequestResponse response = new FriendRequestResponse();
        response.setId(fr.getId());
        response.setSenderId(fr.getSender().getId());
        response.setSenderEmail(fr.getSender().getEmail());
        response.setSenderFullName(fr.getSender().getFullName());
        response.setReceiverId(fr.getReceiver().getId());
        response.setReceiverEmail(fr.getReceiver().getEmail());
        response.setReceiverFullName(fr.getReceiver().getFullName());
        response.setStatus(fr.getStatus().name());
        response.setCreatedAt(fr.getCreatedAt() != null ? fr.getCreatedAt().format(DATE_FORMATTER) : null);
        response.setUpdatedAt(fr.getUpdatedAt() != null ? fr.getUpdatedAt().format(DATE_FORMATTER) : null);

        // Add profile photos
        profileRepository.findByUser(fr.getSender()).ifPresent(profile -> {
            response.setSenderProfilePhotoUrl(profile.getProfilePhotoUrl());
        });
        profileRepository.findByUser(fr.getReceiver()).ifPresent(profile -> {
            response.setReceiverProfilePhotoUrl(profile.getProfilePhotoUrl());
        });

        return response;
    }

    /**
     * Map FriendRequest to FriendResponse DTO (for friends list)
     */
    private FriendResponse mapToFriendResponse(FriendRequest fr, Long currentUserId) {
        // Determine which user is the friend (the other user, not current user)
        User friend = fr.getSender().getId().equals(currentUserId) 
                ? fr.getReceiver() 
                : fr.getSender();

        FriendResponse response = new FriendResponse();
        response.setId(fr.getId());
        response.setUserId(friend.getId());
        response.setEmail(friend.getEmail());
        response.setFullName(friend.getFullName());
        response.setFriendshipCreatedAt(fr.getCreatedAt() != null ? fr.getCreatedAt().format(DATE_FORMATTER) : null);

        // Add profile info
        profileRepository.findByUser(friend).ifPresent(profile -> {
            response.setProfileId(profile.getId());
            response.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        });

        return response;
    }
}

