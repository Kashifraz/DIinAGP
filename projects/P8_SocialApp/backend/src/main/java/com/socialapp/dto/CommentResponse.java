package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long postId;
    private Long authorId;
    private String authorEmail;
    private String authorFullName;
    private String authorProfilePhotoUrl;
    private Long parentCommentId;
    private String content;
    private Long likeCount;
    private Long dislikeCount;
    private Boolean isLiked;
    private Boolean isDisliked;
    private List<CommentResponse> replies;
    private String createdAt;
    private String updatedAt;
}

