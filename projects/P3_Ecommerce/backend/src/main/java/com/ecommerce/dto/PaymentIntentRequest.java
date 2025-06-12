package com.ecommerce.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class PaymentIntentRequest {
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.50", message = "Amount must be at least $0.50")
    private BigDecimal amount;
    
    @NotNull(message = "Currency is required")
    private String currency;
    
    private String description;
    
    private String customerId;
    
    private String paymentMethodId;
    
    private String orderId;
    
    // Constructors
    public PaymentIntentRequest() {
    }
    
    public PaymentIntentRequest(BigDecimal amount, String currency, String description) {
        this.amount = amount;
        this.currency = currency;
        this.description = description;
    }
    
    // Getters and Setters
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
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
    
    public String getCustomerId() {
        return customerId;
    }
    
    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }
    
    public String getPaymentMethodId() {
        return paymentMethodId;
    }
    
    public void setPaymentMethodId(String paymentMethodId) {
        this.paymentMethodId = paymentMethodId;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    @Override
    public String toString() {
        return "PaymentIntentRequest{" +
                "amount=" + amount +
                ", currency='" + currency + '\'' +
                ", description='" + description + '\'' +
                ", customerId='" + customerId + '\'' +
                ", paymentMethodId='" + paymentMethodId + '\'' +
                ", orderId='" + orderId + '\'' +
                '}';
    }
}
