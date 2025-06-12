package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponse {
    private Long id;
    private Long senderId;
    private String senderEmail;
    private String senderFullName;
    private String senderProfilePhotoUrl;
    private Long receiverId;
    private String receiverEmail;
    private String receiverFullName;
    private String receiverProfilePhotoUrl;
    private String status;
    private String createdAt;
    private String updatedAt;
}

