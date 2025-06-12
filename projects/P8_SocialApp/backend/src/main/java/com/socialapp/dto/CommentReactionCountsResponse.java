package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentReactionCountsResponse {
    private Long commentId;
    private Long likeCount;
    private Long dislikeCount;
}

