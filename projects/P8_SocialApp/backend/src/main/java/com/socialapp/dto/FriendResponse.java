package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendResponse {
    private Long id;
    private Long userId;
    private String email;
    private String fullName;
    private String profilePhotoUrl;
    private Long profileId;
    private String friendshipCreatedAt;
}

