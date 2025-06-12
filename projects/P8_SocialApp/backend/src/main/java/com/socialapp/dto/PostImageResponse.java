package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostImageResponse {
    private Long id;
    private String imageUrl;
    private Integer orderIndex;
    private String createdAt;
}

