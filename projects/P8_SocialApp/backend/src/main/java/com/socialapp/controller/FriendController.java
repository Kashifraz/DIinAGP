package com.socialapp.controller;

import com.socialapp.dto.ApiResponse;
import com.socialapp.dto.FriendRequestResponse;
import com.socialapp.dto.FriendResponse;
import com.socialapp.dto.SendFriendRequestRequest;
import com.socialapp.model.User;
import com.socialapp.repository.UserRepository;
import com.socialapp.service.FriendService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    /**
     * Send a friend request
     * POST /api/friends/requests
     */
    @PostMapping("/requests")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> sendFriendRequest(
            @Valid @RequestBody SendFriendRequestRequest request) {
        try {
            Long senderId = getCurrentUserId();
            FriendRequestResponse friendRequest = friendService.sendFriendRequest(senderId, request.getReceiverId());
            return ResponseEntity.ok(ApiResponse.success("Friend request sent successfully", friendRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Accept a friend request
     * PUT /api/friends/requests/{requestId}/accept
     */
    @PutMapping("/requests/{requestId}/accept")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> acceptFriendRequest(
            @PathVariable Long requestId) {
        try {
            Long receiverId = getCurrentUserId();
            FriendRequestResponse friendRequest = friendService.acceptFriendRequest(receiverId, requestId);
            return ResponseEntity.ok(ApiResponse.success("Friend request accepted successfully", friendRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Reject a friend request
     * PUT /api/friends/requests/{requestId}/reject
     */
    @PutMapping("/requests/{requestId}/reject")
    public ResponseEntity<ApiResponse<FriendRequestResponse>> rejectFriendRequest(
            @PathVariable Long requestId) {
        try {
            Long receiverId = getCurrentUserId();
            FriendRequestResponse friendRequest = friendService.rejectFriendRequest(receiverId, requestId);
            return ResponseEntity.ok(ApiResponse.success("Friend request rejected successfully", friendRequest));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cancel a sent friend request
     * DELETE /api/friends/requests/{requestId}
     */
    @DeleteMapping("/requests/{requestId}")
    public ResponseEntity<ApiResponse<Void>> cancelFriendRequest(
            @PathVariable Long requestId) {
        try {
            Long senderId = getCurrentUserId();
            friendService.cancelFriendRequest(senderId, requestId);
            return ResponseEntity.ok(ApiResponse.success("Friend request cancelled successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get pending friend requests received by current user
     * GET /api/friends/requests/received?page={page}&size={size}
     */
    @GetMapping("/requests/received")
    public ResponseEntity<ApiResponse<Page<FriendRequestResponse>>> getReceivedRequests(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            Long userId = getCurrentUserId();
            Page<FriendRequestResponse> requests = friendService.getPendingReceivedRequests(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Received friend requests retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while retrieving friend requests"));
        }
    }

    /**
     * Get pending friend requests sent by current user
     * GET /api/friends/requests/sent?page={page}&size={size}
     */
    @GetMapping("/requests/sent")
    public ResponseEntity<ApiResponse<Page<FriendRequestResponse>>> getSentRequests(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            Long userId = getCurrentUserId();
            Page<FriendRequestResponse> requests = friendService.getPendingSentRequests(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Sent friend requests retrieved successfully", requests));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while retrieving friend requests"));
        }
    }

    /**
     * Get all friends (accepted friend requests)
     * GET /api/friends?page={page}&size={size}
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<FriendResponse>>> getFriends(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            Long userId = getCurrentUserId();
            Page<FriendResponse> friends = friendService.getFriends(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Friends retrieved successfully", friends));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while retrieving friends"));
        }
    }

    /**
     * Check if two users are friends
     * GET /api/friends/check/{userId}
     */
    @GetMapping("/check/{userId}")
    public ResponseEntity<ApiResponse<Boolean>> checkFriendship(@PathVariable Long userId) {
        try {
            Long currentUserId = getCurrentUserId();
            boolean areFriends = friendService.areFriends(currentUserId, userId);
            return ResponseEntity.ok(ApiResponse.success("Friendship status retrieved successfully", areFriends));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while checking friendship status"));
        }
    }

    /**
     * Unfriend a user (remove friendship)
     * DELETE /api/friends/{friendId}
     */
    @DeleteMapping("/{friendId}")
    public ResponseEntity<ApiResponse<Void>> unfriend(@PathVariable Long friendId) {
        try {
            Long userId = getCurrentUserId();
            friendService.unfriend(userId, friendId);
            return ResponseEntity.ok(ApiResponse.success("Friend removed successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while removing friend"));
        }
    }
}

