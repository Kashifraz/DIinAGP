package com.ecommerce.controller;

import com.ecommerce.dto.PaymentIntentRequest;
import com.ecommerce.dto.PaymentIntentResponse;
import com.ecommerce.dto.StripeWebhookEvent;
import com.ecommerce.service.PaymentService;
import com.ecommerce.config.StripeConfig;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:3000")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private StripeConfig stripeConfig;

    /**
     * Create a payment intent
     */
    @PostMapping("/create-payment-intent")
    public ResponseEntity<?> createPaymentIntent(@Valid @RequestBody PaymentIntentRequest request) {
        try {
            logger.info("Creating payment intent for amount: {} {}", request.getAmount(), request.getCurrency());

            PaymentIntentResponse response = paymentService.createPaymentIntent(request);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error creating payment intent: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create payment intent: " + e.getMessage()));
        }
    }

    /**
     * Confirm a payment intent
     */
    @PostMapping("/confirm-payment-intent/{paymentIntentId}")
    public ResponseEntity<?> confirmPaymentIntent(@PathVariable String paymentIntentId) {
        try {
            logger.info("Confirming payment intent: {}", paymentIntentId);

            PaymentIntentResponse response = paymentService.confirmPaymentIntent(paymentIntentId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error confirming payment intent {}: {}", paymentIntentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to confirm payment intent: " + e.getMessage()));
        }
    }

    /**
     * Get payment intent details
     */
    @GetMapping("/payment-intent/{paymentIntentId}")
    public ResponseEntity<?> getPaymentIntent(@PathVariable String paymentIntentId) {
        try {
            logger.info("Retrieving payment intent: {}", paymentIntentId);

            PaymentIntentResponse response = paymentService.getPaymentIntent(paymentIntentId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error retrieving payment intent {}: {}", paymentIntentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve payment intent: " + e.getMessage()));
        }
    }

    /**
     * Cancel a payment intent
     */
    @PostMapping("/cancel-payment-intent/{paymentIntentId}")
    public ResponseEntity<?> cancelPaymentIntent(@PathVariable String paymentIntentId) {
        try {
            logger.info("Cancelling payment intent: {}", paymentIntentId);

            PaymentIntentResponse response = paymentService.cancelPaymentIntent(paymentIntentId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error cancelling payment intent {}: {}", paymentIntentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to cancel payment intent: " + e.getMessage()));
        }
    }

    /**
     * Create a Stripe customer
     */
    @PostMapping("/create-customer")
    public ResponseEntity<?> createCustomer(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");

            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Name is required"));
            }

            logger.info("Creating Stripe customer for email: {}", email);

            String customerId = paymentService.createCustomer(email, name);

            return ResponseEntity.ok(Map.of("customerId", customerId));

        } catch (Exception e) {
            logger.error("Error creating Stripe customer: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create Stripe customer: " + e.getMessage()));
        }
    }

    /**
     * Get Stripe publishable key
     */
    @GetMapping("/config")
    public ResponseEntity<?> getStripeConfig() {
        try {
            return ResponseEntity.ok(Map.of(
                    "publishableKey", stripeConfig.getPublishableKey(),
                    "currency", stripeConfig.getCurrency()
            ));
        } catch (Exception e) {
            logger.error("Error getting Stripe config: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to get Stripe configuration"));
        }
    }

    /**
     * Handle Stripe webhooks
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody String payload, HttpServletRequest request) {
        try {
            String sigHeader = request.getHeader("Stripe-Signature");
            
            if (sigHeader == null) {
                logger.warn("Missing Stripe-Signature header");
                return ResponseEntity.badRequest().body(Map.of("error", "Missing Stripe-Signature header"));
            }

            // Verify webhook signature
            Event event = Webhook.constructEvent(
                    payload,
                    sigHeader,
                    stripeConfig.getWebhookSecret()
            );

            logger.info("Received Stripe webhook event: {} - {}", event.getType(), event.getId());

            // Convert Stripe Event to our DTO
            StripeWebhookEvent webhookEvent = convertToWebhookEvent(event);

            // Process the webhook event
            paymentService.handleWebhookEvent(webhookEvent);

            return ResponseEntity.ok(Map.of("status", "success"));

        } catch (SignatureVerificationException e) {
            logger.error("Invalid webhook signature: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid webhook signature"));
        } catch (Exception e) {
            logger.error("Error processing webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process webhook: " + e.getMessage()));
        }
    }

    /**
     * Convert Stripe Event to our webhook event DTO
     */
    private StripeWebhookEvent convertToWebhookEvent(Event event) {
        StripeWebhookEvent webhookEvent = new StripeWebhookEvent();
        webhookEvent.setId(event.getId());
        webhookEvent.setType(event.getType());
        webhookEvent.setCreated(String.valueOf(event.getCreated()));
        webhookEvent.setLivemode(event.getLivemode());
            webhookEvent.setPendingWebhooks(event.getPendingWebhooks().intValue());
        webhookEvent.setRequest(event.getRequest() != null ? event.getRequest().getId() : null);

        // Convert data object
        StripeWebhookEvent.StripeWebhookData data = new StripeWebhookEvent.StripeWebhookData();
        StripeWebhookEvent.StripeWebhookObject object = new StripeWebhookEvent.StripeWebhookObject();
        
        if (event.getDataObjectDeserializer().getObject().isPresent()) {
            com.stripe.model.StripeObject stripeObject = event.getDataObjectDeserializer().getObject().get();
            
            if (stripeObject instanceof com.stripe.model.PaymentIntent) {
                com.stripe.model.PaymentIntent paymentIntent = (com.stripe.model.PaymentIntent) stripeObject;
                object.setId(paymentIntent.getId());
                object.setStatus(paymentIntent.getStatus());
                object.setType("payment_intent");
                object.setPaymentIntent(paymentIntent.getId());
                
                // Set metadata
                StripeWebhookEvent.StripeWebhookMetadata metadata = new StripeWebhookEvent.StripeWebhookMetadata();
                if (paymentIntent.getMetadata() != null) {
                    metadata.setOrderId(paymentIntent.getMetadata().get("order_id"));
                    metadata.setUserId(paymentIntent.getMetadata().get("user_id"));
                }
                object.setMetadata(metadata);
            }
        }
        
        data.setObject(object);
        webhookEvent.setData(data);

        return webhookEvent;
    }
}
