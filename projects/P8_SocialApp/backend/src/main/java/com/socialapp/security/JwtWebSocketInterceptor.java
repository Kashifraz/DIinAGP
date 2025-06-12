package com.socialapp.security;

import com.socialapp.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class JwtWebSocketInterceptor implements ChannelInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Get JWT token from STOMP headers (Authorization header)
            List<String> authHeaders = accessor.getNativeHeader("Authorization");
            String token = null;
            
            if (authHeaders != null && !authHeaders.isEmpty()) {
                token = authHeaders.get(0);
            }
            
            // If not in headers, try session attributes (for SockJS fallback)
            if (token == null || token.isEmpty()) {
                Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                if (sessionAttributes != null) {
                    token = (String) sessionAttributes.get("token");
                }
            }
            
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
            }
            
            if (token != null && !token.isEmpty()) {
                try {
                    // Validate token and extract user info
                    String email = jwtUtil.extractUsername(token);
                    if (email != null && jwtUtil.validateToken(token, email)) {
                        // Create authentication object
                        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                        Authentication auth = new UsernamePasswordAuthenticationToken(
                                email, null, authorities);
                        accessor.setUser(auth);
                    }
                    // If validation fails, connection will proceed but won't have auth
                    // You can reject it by returning null or throwing exception if needed
                } catch (Exception e) {
                    // Token validation failed - log but don't block (let STOMP handle it)
                    System.err.println("WebSocket JWT validation failed: " + e.getMessage());
                }
            }
        }
        
        return message;
    }
}

