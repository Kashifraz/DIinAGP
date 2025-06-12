package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReactionCountsResponse {
    private Long postId;
    private Map<String, Long> counts; // Map of reaction type to count
    // Example: {"HEART": 5, "THUMBS_UP": 3, "LAUGH": 2}
}

