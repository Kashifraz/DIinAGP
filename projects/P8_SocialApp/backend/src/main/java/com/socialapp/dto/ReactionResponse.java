package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReactionResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String reactionType; // HEART, THUMBS_UP, LAUGH, SAD, ANGRY, THUMBS_DOWN
    private String createdAt;
    private String updatedAt;
}

