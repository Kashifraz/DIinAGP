package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentReactionResponse {
    private Long id;
    private Long commentId;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String reactionType; // LIKE or DISLIKE
    private String createdAt;
    private String updatedAt;
}

