package com.vocabularyapp.dto;

public class AuthResponse {
    
    private String token;
    private String email;
    private Long userId;
    private String message;
    private boolean success;
    
    // Constructors
    public AuthResponse() {}
    
    public AuthResponse(String token, String email, Long userId, String message, boolean success) {
        this.token = token;
        this.email = email;
        this.userId = userId;
        this.message = message;
        this.success = success;
    }
    
    // Static factory methods
    public static AuthResponse success(String token, String email, Long userId, String message) {
        return new AuthResponse(token, email, userId, message, true);
    }
    
    public static AuthResponse error(String message) {
        return new AuthResponse(null, null, null, message, false);
    }
    
    // Getters and Setters
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
}
