package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveNotification {
    private String type; // "LIKE", "COMMENT", "FRIEND_REQUEST", etc.
    private String message;
    private Long postId; // nullable
    private ActorInfo actor; // User who triggered the notification
    private String timestamp;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActorInfo {
        private Long id;
        private String email;
        private String fullName;
        private String profilePhotoUrl; // nullable
    }
}

