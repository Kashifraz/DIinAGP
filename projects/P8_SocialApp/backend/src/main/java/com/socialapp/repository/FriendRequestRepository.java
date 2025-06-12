package com.socialapp.repository;

import com.socialapp.model.FriendRequest;
import com.socialapp.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    
    // Find friend request by sender and receiver
    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);
    
    // Find friend request by sender and receiver IDs
    Optional<FriendRequest> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
    
    // Check if friend request exists between two users
    boolean existsBySenderIdAndReceiverId(Long senderId, Long receiverId);
    
    // Find all friend requests sent by a user
    Page<FriendRequest> findBySenderIdAndStatus(Long senderId, FriendRequest.FriendRequestStatus status, Pageable pageable);
    
    // Find all friend requests received by a user
    Page<FriendRequest> findByReceiverIdAndStatus(Long receiverId, FriendRequest.FriendRequestStatus status, Pageable pageable);
    
    // Find all pending friend requests received by a user
    List<FriendRequest> findByReceiverIdAndStatus(Long receiverId, FriendRequest.FriendRequestStatus status);
    
    // Find all accepted friend requests (friendships) for a user
    @Query("SELECT fr FROM FriendRequest fr WHERE (fr.sender.id = :userId OR fr.receiver.id = :userId) AND fr.status = 'ACCEPTED'")
    Page<FriendRequest> findAcceptedFriendships(@Param("userId") Long userId, Pageable pageable);
    
    // Check if two users are friends (have an ACCEPTED request)
    @Query("SELECT COUNT(fr) > 0 FROM FriendRequest fr WHERE " +
           "((fr.sender.id = :userId1 AND fr.receiver.id = :userId2) OR " +
           "(fr.sender.id = :userId2 AND fr.receiver.id = :userId1)) AND fr.status = 'ACCEPTED'")
    boolean areFriends(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    // Find friend request between two users (any status)
    @Query("SELECT fr FROM FriendRequest fr WHERE " +
           "((fr.sender.id = :userId1 AND fr.receiver.id = :userId2) OR " +
           "(fr.sender.id = :userId2 AND fr.receiver.id = :userId1))")
    Optional<FriendRequest> findFriendRequestBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}

