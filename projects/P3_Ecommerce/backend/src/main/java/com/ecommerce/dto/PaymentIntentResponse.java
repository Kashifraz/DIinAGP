package com.ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PaymentIntentResponse {
    
    private String id;
    
    private String clientSecret;
    
    private String status;
    
    private Long amount;
    
    private String currency;
    
    private String description;
    
    @JsonProperty("payment_method")
    private String paymentMethod;
    
    @JsonProperty("customer_id")
    private String customerId;
    
    @JsonProperty("order_id")
    private String orderId;
    
    private Long created;
    
    // Constructors
    public PaymentIntentResponse() {
    }
    
    public PaymentIntentResponse(String id, String clientSecret, String status, Long amount, String currency) {
        this.id = id;
        this.clientSecret = clientSecret;
        this.status = status;
        this.amount = amount;
        this.currency = currency;
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getClientSecret() {
        return clientSecret;
    }
    
    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Long getAmount() {
        return amount;
    }
    
    public void setAmount(Long amount) {
        this.amount = amount;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public Long getCreated() {
        return created;
    }
    
    public void setCreated(Long created) {
        this.created = created;
    }
    
    @Override
    public String toString() {
        return "PaymentIntentResponse{" +
                "id='" + id + '\'' +
                ", clientSecret='" + clientSecret + '\'' +
                ", status='" + status + '\'' +
                ", amount=" + amount +
                ", currency='" + currency + '\'' +
                ", description='" + description + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", customerId='" + customerId + '\'' +
                ", orderId='" + orderId + '\'' +
                ", created=" + created +
                '}';
    }
}
