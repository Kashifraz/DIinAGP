package com.vocabularyapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/health/**", "/api/health/**").permitAll()
                .requestMatchers("/api/seeding/**").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/test").permitAll()
                .requestMatchers("/api/auth/profile").authenticated()
                .requestMatchers("/api/vocabulary/**").authenticated() // Require authentication for vocabulary
                .requestMatchers("/api/learning/**").authenticated() // Require authentication for learning
                       .requestMatchers("/api/quiz/start", "/api/quiz/question/**", "/api/quiz/complete/**", "/api/quiz/progress/**", "/api/quiz/history", "/api/quiz/statistics/**").authenticated() // Require authentication for quiz
                       .requestMatchers("/api/quiz/submit").permitAll() // Temporarily allow submit without auth for debugging
                       .requestMatchers("/api/quiz-results/**").authenticated() // Require authentication for quiz results
                .requestMatchers("/error").permitAll()
                .anyRequest().permitAll() // Temporarily allow all requests
            )
            .httpBasic(basic -> basic.disable())
            .formLogin(form -> form.disable())
            .logout(logout -> logout.disable())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
