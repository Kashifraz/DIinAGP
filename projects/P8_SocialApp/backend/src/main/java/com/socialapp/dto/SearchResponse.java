package com.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponse {
    private Long id;
    private String email;
    private String fullName;
    private String profilePhotoUrl;
    private Long profileId;
}

