package com.vocabularyapp.config;

import com.vocabularyapp.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        final String authorizationHeader = request.getHeader("Authorization");
        String requestPath = request.getRequestURI();
        
        // Debug logging for quiz endpoints
        if (requestPath.contains("/quiz/")) {
            System.out.println("🎯 JWT Filter - Quiz request: " + requestPath);
            System.out.println("🎯 JWT Filter - Authorization header: " + (authorizationHeader != null ? "Present" : "Missing"));
        }
        
        String username = null;
        String jwt = null;
        
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                if (requestPath.contains("/quiz/")) {
                    System.out.println("🎯 JWT Filter - Extracted username: " + username);
                }
            } catch (Exception e) {
                System.out.println("🎯 JWT Filter - Error extracting username: " + e.getMessage());
                logger.error("Error extracting username from JWT", e);
            }
        }
        
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                if (jwtUtil.validateToken(jwt, username)) {
                    UsernamePasswordAuthenticationToken authToken = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    if (requestPath.contains("/quiz/")) {
                        System.out.println("🎯 JWT Filter - Authentication set successfully");
                    }
                } else {
                    if (requestPath.contains("/quiz/")) {
                        System.out.println("🎯 JWT Filter - Token validation failed");
                    }
                }
            } catch (Exception e) {
                System.out.println("🎯 JWT Filter - Error validating token: " + e.getMessage());
                logger.error("Error validating JWT token", e);
            }
        } else if (requestPath.contains("/quiz/")) {
            System.out.println("🎯 JWT Filter - No authentication set. Username: " + username + ", Existing auth: " + (SecurityContextHolder.getContext().getAuthentication() != null));
        }
        
        filterChain.doFilter(request, response);
    }
}
