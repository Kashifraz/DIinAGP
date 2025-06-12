package com.ecommerce.controller;

import com.ecommerce.dto.AuthResponse;
import com.ecommerce.dto.LoginRequest;
import com.ecommerce.dto.RegisterRequest;
import com.ecommerce.model.User;
import com.ecommerce.security.JwtTokenProvider;
import com.ecommerce.service.EmailService;
import com.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private EmailService emailService;
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            // Check if user already exists
            if (userService.existsByEmail(registerRequest.getEmail())) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Email is already registered");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Create new user
            User user = new User();
            user.setEmail(registerRequest.getEmail());
            user.setPasswordHash(registerRequest.getPassword()); // Will be hashed in service
            user.setFirstName(registerRequest.getFirstName());
            user.setLastName(registerRequest.getLastName());
            user.setRole(User.UserRole.CUSTOMER);
            
            User savedUser = userService.createUser(user);
            
            // Send verification email
            emailService.sendVerificationEmail(savedUser.getEmail(), savedUser.getVerificationToken());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "User registered successfully. Please check your email for verification.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Registration failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Debug: Check if user exists
            User user = userService.getUserByEmail(loginRequest.getEmail()).orElse(null);
            if (user == null) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "User not found");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Debug: Check email verification status
            if (!user.isEmailVerified()) {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Email not verified");
                return ResponseEntity.badRequest().body(response);
            }
            
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getEmail(),
                    loginRequest.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);
            
            AuthResponse authResponse = new AuthResponse(
                jwt,
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole().name()
            );
            
            return ResponseEntity.ok(authResponse);
            
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid email or password");
            response.put("debug", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String token) {
        try {
            boolean verified = userService.verifyEmail(token);
            
            if (verified) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Email verified successfully");
                return ResponseEntity.ok(response);
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("error", "Invalid or expired verification token");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Email verification failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                
                if (tokenProvider.validateToken(jwt)) {
                    String email = tokenProvider.getEmailFromToken(jwt);
                    String newToken = tokenProvider.generateToken(email);
                    
                    User user = userService.getUserByEmail(email).orElse(null);
                    if (user != null) {
                        AuthResponse authResponse = new AuthResponse(
                            newToken,
                            user.getEmail(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getRole().name()
                        );
                        return ResponseEntity.ok(authResponse);
                    }
                }
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("error", "Invalid token");
            return ResponseEntity.badRequest().body(response);
            
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Token refresh failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
