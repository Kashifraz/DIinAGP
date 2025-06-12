package com.ecommerce.service;

import com.ecommerce.config.StripeConfig;
import com.ecommerce.dto.PaymentIntentRequest;
import com.ecommerce.dto.PaymentIntentResponse;
import com.ecommerce.dto.StripeWebhookEvent;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.model.Order;
import com.ecommerce.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.PaymentMethod;
import com.stripe.model.Customer;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentMethodCreateParams;
import com.stripe.param.CustomerCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    @Autowired
    private StripeConfig stripeConfig;

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Create a payment intent for an order
     */
    public PaymentIntentResponse createPaymentIntent(PaymentIntentRequest request) {
        try {
            logger.info("Creating payment intent for amount: {} {}", request.getAmount(), request.getCurrency());

            // Convert BigDecimal to cents (Stripe uses cents)
            long amountInCents = request.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(request.getCurrency())
                    .setDescription(request.getDescription())
                    .setAutomaticPaymentMethods(
                            PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                    .setEnabled(true)
                                    .build()
                    );

            // Add metadata
            Map<String, String> metadata = new HashMap<>();
            if (request.getOrderId() != null) {
                metadata.put("order_id", request.getOrderId());
            }
            if (request.getCustomerId() != null) {
                metadata.put("customer_id", request.getCustomerId());
            }
            if (!metadata.isEmpty()) {
                paramsBuilder.putAllMetadata(metadata);
            }

            // Add customer if provided
            if (request.getCustomerId() != null) {
                paramsBuilder.setCustomer(request.getCustomerId());
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

            logger.info("Payment intent created successfully: {}", paymentIntent.getId());

            return new PaymentIntentResponse(
                    paymentIntent.getId(),
                    paymentIntent.getClientSecret(),
                    paymentIntent.getStatus(),
                    paymentIntent.getAmount(),
                    paymentIntent.getCurrency()
            );

        } catch (StripeException e) {
            logger.error("Error creating payment intent: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage(), e);
        }
    }

    /**
     * Confirm a payment intent
     */
    public PaymentIntentResponse confirmPaymentIntent(String paymentIntentId) {
        try {
            logger.info("Confirming payment intent: {}", paymentIntentId);

            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            paymentIntent = paymentIntent.confirm();

            logger.info("Payment intent confirmed: {} with status: {}", paymentIntentId, paymentIntent.getStatus());

            return new PaymentIntentResponse(
                    paymentIntent.getId(),
                    paymentIntent.getClientSecret(),
                    paymentIntent.getStatus(),
                    paymentIntent.getAmount(),
                    paymentIntent.getCurrency()
            );

        } catch (StripeException e) {
            logger.error("Error confirming payment intent {}: {}", paymentIntentId, e.getMessage(), e);
            throw new RuntimeException("Failed to confirm payment intent: " + e.getMessage(), e);
        }
    }

    /**
     * Retrieve a payment intent
     */
    public PaymentIntentResponse getPaymentIntent(String paymentIntentId) {
        try {
            logger.info("Retrieving payment intent: {}", paymentIntentId);

            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

            return new PaymentIntentResponse(
                    paymentIntent.getId(),
                    paymentIntent.getClientSecret(),
                    paymentIntent.getStatus(),
                    paymentIntent.getAmount(),
                    paymentIntent.getCurrency()
            );

        } catch (StripeException e) {
            logger.error("Error retrieving payment intent {}: {}", paymentIntentId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve payment intent: " + e.getMessage(), e);
        }
    }

    /**
     * Cancel a payment intent
     */
    public PaymentIntentResponse cancelPaymentIntent(String paymentIntentId) {
        try {
            logger.info("Cancelling payment intent: {}", paymentIntentId);

            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            paymentIntent = paymentIntent.cancel();

            logger.info("Payment intent cancelled: {} with status: {}", paymentIntentId, paymentIntent.getStatus());

            return new PaymentIntentResponse(
                    paymentIntent.getId(),
                    paymentIntent.getClientSecret(),
                    paymentIntent.getStatus(),
                    paymentIntent.getAmount(),
                    paymentIntent.getCurrency()
            );

        } catch (StripeException e) {
            logger.error("Error cancelling payment intent {}: {}", paymentIntentId, e.getMessage(), e);
            throw new RuntimeException("Failed to cancel payment intent: " + e.getMessage(), e);
        }
    }

    /**
     * Create a Stripe customer
     */
    public String createCustomer(String email, String name) {
        try {
            logger.info("Creating Stripe customer for email: {}", email);

            CustomerCreateParams params = CustomerCreateParams.builder()
                    .setEmail(email)
                    .setName(name)
                    .build();

            Customer customer = Customer.create(params);

            logger.info("Stripe customer created successfully: {}", customer.getId());

            return customer.getId();

        } catch (StripeException e) {
            logger.error("Error creating Stripe customer: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create Stripe customer: " + e.getMessage(), e);
        }
    }

    /**
     * Handle Stripe webhook events
     */
    public void handleWebhookEvent(StripeWebhookEvent event) {
        logger.info("Processing Stripe webhook event: {} - {}", event.getType(), event.getId());

        try {
            switch (event.getType()) {
                case "payment_intent.succeeded":
                    handlePaymentIntentSucceeded(event);
                    break;
                case "payment_intent.payment_failed":
                    handlePaymentIntentFailed(event);
                    break;
                case "payment_intent.canceled":
                    handlePaymentIntentCanceled(event);
                    break;
                default:
                    logger.info("Unhandled webhook event type: {}", event.getType());
            }
        } catch (Exception e) {
            logger.error("Error handling webhook event {}: {}", event.getType(), e.getMessage(), e);
            throw new RuntimeException("Failed to handle webhook event: " + e.getMessage(), e);
        }
    }

    private void handlePaymentIntentSucceeded(StripeWebhookEvent event) {
        String paymentIntentId = event.getData().getObject().getPaymentIntent();
        String orderId = event.getData().getObject().getMetadata().getOrderId();

        logger.info("Payment succeeded for payment intent: {} and order: {}", paymentIntentId, orderId);

        if (orderId != null) {
            try {
                Order order = orderRepository.findByOrderNumber(orderId)
                        .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

                order.setPaymentStatus(Order.PaymentStatus.PAID);
                order.setStatus(Order.OrderStatus.PROCESSING);
                orderRepository.save(order);

                logger.info("Order {} updated to PAID and CONFIRMED", orderId);
            } catch (Exception e) {
                logger.error("Error updating order {} after successful payment: {}", orderId, e.getMessage(), e);
            }
        }
    }

    private void handlePaymentIntentFailed(StripeWebhookEvent event) {
        String paymentIntentId = event.getData().getObject().getPaymentIntent();
        String orderId = event.getData().getObject().getMetadata().getOrderId();

        logger.info("Payment failed for payment intent: {} and order: {}", paymentIntentId, orderId);

        if (orderId != null) {
            try {
                Order order = orderRepository.findByOrderNumber(orderId)
                        .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                order.setStatus(Order.OrderStatus.CANCELLED);
                orderRepository.save(order);

                logger.info("Order {} updated to FAILED and CANCELLED", orderId);
            } catch (Exception e) {
                logger.error("Error updating order {} after failed payment: {}", orderId, e.getMessage(), e);
            }
        }
    }

    private void handlePaymentIntentCanceled(StripeWebhookEvent event) {
        String paymentIntentId = event.getData().getObject().getPaymentIntent();
        String orderId = event.getData().getObject().getMetadata().getOrderId();

        logger.info("Payment cancelled for payment intent: {} and order: {}", paymentIntentId, orderId);

        if (orderId != null) {
            try {
                Order order = orderRepository.findByOrderNumber(orderId)
                        .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

                order.setPaymentStatus(Order.PaymentStatus.FAILED);
                order.setStatus(Order.OrderStatus.CANCELLED);
                orderRepository.save(order);

                logger.info("Order {} updated to CANCELLED", orderId);
            } catch (Exception e) {
                logger.error("Error updating order {} after cancelled payment: {}", orderId, e.getMessage(), e);
            }
        }
    }
}
