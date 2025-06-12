package com.ecommerce.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class StripeConfig {

    @Value("${stripe.secret-key}")
    private String secretKey;

    @Value("${stripe.publishable-key}")
    private String publishableKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    @Value("${stripe.currency}")
    private String currency;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    @Bean
    public String stripePublishableKey() {
        return publishableKey;
    }

    @Bean
    public String stripeWebhookSecret() {
        return webhookSecret;
    }

    @Bean
    public String stripeCurrency() {
        return currency;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getPublishableKey() {
        return publishableKey;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }

    public String getCurrency() {
        return currency;
    }
}
