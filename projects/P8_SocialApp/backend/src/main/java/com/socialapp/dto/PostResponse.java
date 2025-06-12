package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostResponse {
    private Long id;
    private Long authorId;
    private String authorEmail;
    private String authorFullName;
    private String authorProfilePhotoUrl;
    private String content;
    private List<PostImageResponse> images;
    // Reaction counts for each type
    private Long heartCount;
    private Long thumbsUpCount;
    private Long laughCount;
    private Long sadCount;
    private Long angryCount;
    private Long thumbsDownCount;
    // Current user's reaction (if any)
    private String userReaction; // HEART, THUMBS_UP, LAUGH, SAD, ANGRY, THUMBS_DOWN, or null
    private String createdAt;
    private String updatedAt;
}

