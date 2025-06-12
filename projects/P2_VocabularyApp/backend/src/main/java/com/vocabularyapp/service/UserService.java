package com.vocabularyapp.service;

import com.vocabularyapp.dto.AuthResponse;
import com.vocabularyapp.dto.LoginRequest;
import com.vocabularyapp.dto.RegisterRequest;
import com.vocabularyapp.entity.User;
import com.vocabularyapp.repository.UserRepository;
import com.vocabularyapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordService passwordService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    /**
     * Register a new user
     * @param registerRequest Registration request
     * @return AuthResponse with token or error message
     */
    public AuthResponse register(RegisterRequest registerRequest) {
        try {
            // Check if user already exists
            if (userRepository.existsByEmail(registerRequest.getEmail())) {
                return AuthResponse.error("User with this email already exists");
            }
            
            // Create new user
            User user = new User();
            user.setEmail(registerRequest.getEmail());
            user.setPasswordHash(passwordService.hashPassword(registerRequest.getPassword()));
            
            // Save user to database
            User savedUser = userRepository.save(user);
            
            // Generate JWT token
            String token = jwtUtil.generateToken(savedUser.getEmail(), savedUser.getId());
            
            return AuthResponse.success(token, savedUser.getEmail(), savedUser.getId(), 
                "User registered successfully");
                
        } catch (Exception e) {
            return AuthResponse.error("Registration failed: " + e.getMessage());
        }
    }
    
    /**
     * Login user
     * @param loginRequest Login request
     * @return AuthResponse with token or error message
     */
    public AuthResponse login(LoginRequest loginRequest) {
        try {
            // Find user by email
            Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());
            
            if (userOptional.isEmpty()) {
                return AuthResponse.error("Invalid email or password");
            }
            
            User user = userOptional.get();
            
            // Verify password
            if (!passwordService.verifyPassword(loginRequest.getPassword(), user.getPasswordHash())) {
                return AuthResponse.error("Invalid email or password");
            }
            
            // Generate JWT token
            String token = jwtUtil.generateToken(user.getEmail(), user.getId());
            
            return AuthResponse.success(token, user.getEmail(), user.getId(), 
                "Login successful");
                
        } catch (Exception e) {
            return AuthResponse.error("Login failed: " + e.getMessage());
        }
    }
    
    /**
     * Get user by ID
     * @param userId User ID
     * @return User entity or null
     */
    public User getUserById(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }
    
    /**
     * Get user by email
     * @param email User email
     * @return User entity or null
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    /**
     * Validate JWT token and get user
     * @param token JWT token
     * @return User entity or null if token is invalid
     */
    public User validateTokenAndGetUser(String token) {
        try {
            if (!jwtUtil.isTokenValid(token)) {
                return null;
            }
            
            String email = jwtUtil.extractUsername(token);
            return getUserByEmail(email);
            
        } catch (Exception e) {
            return null;
        }
    }
}
