package com.ecommerce.dto;

import com.ecommerce.model.Order;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    
    private Long id;
    private String orderNumber;
    private Order.OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal totalAmount;
    private Order.PaymentStatus paymentStatus;
    private String paymentMethod;
    private String paymentIntentId;
    private AddressResponse shippingAddress;
    private AddressResponse billingAddress;
    private String notes;
    private int totalItems;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    private List<OrderItemResponse> orderItems;
    
    // User information
    private Long userId;
    private String userEmail;
    private String userName;
    
    // Constructors
    public OrderResponse() {
    }
    
    public OrderResponse(Long id, String orderNumber, Order.OrderStatus status, BigDecimal subtotal, 
                        BigDecimal taxAmount, BigDecimal shippingAmount, BigDecimal totalAmount, 
                        Order.PaymentStatus paymentStatus, String paymentMethod, String paymentIntentId, 
                        AddressResponse shippingAddress, AddressResponse billingAddress, String notes, 
                        int totalItems, LocalDateTime createdAt, LocalDateTime updatedAt, 
                        List<OrderItemResponse> orderItems, Long userId, String userEmail, String userName) {
        this.id = id;
        this.orderNumber = orderNumber;
        this.status = status;
        this.subtotal = subtotal;
        this.taxAmount = taxAmount;
        this.shippingAmount = shippingAmount;
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.paymentIntentId = paymentIntentId;
        this.shippingAddress = shippingAddress;
        this.billingAddress = billingAddress;
        this.notes = notes;
        this.totalItems = totalItems;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.orderItems = orderItems;
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public Order.OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(Order.OrderStatus status) {
        this.status = status;
    }
    
    public BigDecimal getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
    
    public BigDecimal getTaxAmount() {
        return taxAmount;
    }
    
    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }
    
    public BigDecimal getShippingAmount() {
        return shippingAmount;
    }
    
    public void setShippingAmount(BigDecimal shippingAmount) {
        this.shippingAmount = shippingAmount;
    }
    
    public BigDecimal getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public Order.PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }
    
    public void setPaymentStatus(Order.PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }
    
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public String getPaymentIntentId() {
        return paymentIntentId;
    }
    
    public void setPaymentIntentId(String paymentIntentId) {
        this.paymentIntentId = paymentIntentId;
    }
    
    public AddressResponse getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(AddressResponse shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
    
    public AddressResponse getBillingAddress() {
        return billingAddress;
    }
    
    public void setBillingAddress(AddressResponse billingAddress) {
        this.billingAddress = billingAddress;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public int getTotalItems() {
        return totalItems;
    }
    
    public void setTotalItems(int totalItems) {
        this.totalItems = totalItems;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<OrderItemResponse> getOrderItems() {
        return orderItems;
    }
    
    public void setOrderItems(List<OrderItemResponse> orderItems) {
        this.orderItems = orderItems;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getUserEmail() {
        return userEmail;
    }
    
    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    // Inner class for address response
    public static class AddressResponse {
        private String firstName;
        private String lastName;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private String phoneNumber;
        
        // Constructors
        public AddressResponse() {
        }
        
        public AddressResponse(String firstName, String lastName, String addressLine1, String addressLine2, 
                             String city, String state, String postalCode, String country, String phoneNumber) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.addressLine1 = addressLine1;
            this.addressLine2 = addressLine2;
            this.city = city;
            this.state = state;
            this.postalCode = postalCode;
            this.country = country;
            this.phoneNumber = phoneNumber;
        }
        
        // Getters and Setters
        public String getFirstName() {
            return firstName;
        }
        
        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }
        
        public String getLastName() {
            return lastName;
        }
        
        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
        
        public String getAddressLine1() {
            return addressLine1;
        }
        
        public void setAddressLine1(String addressLine1) {
            this.addressLine1 = addressLine1;
        }
        
        public String getAddressLine2() {
            return addressLine2;
        }
        
        public void setAddressLine2(String addressLine2) {
            this.addressLine2 = addressLine2;
        }
        
        public String getCity() {
            return city;
        }
        
        public void setCity(String city) {
            this.city = city;
        }
        
        public String getState() {
            return state;
        }
        
        public void setState(String state) {
            this.state = state;
        }
        
        public String getPostalCode() {
            return postalCode;
        }
        
        public void setPostalCode(String postalCode) {
            this.postalCode = postalCode;
        }
        
        public String getCountry() {
            return country;
        }
        
        public void setCountry(String country) {
            this.country = country;
        }
        
        public String getPhoneNumber() {
            return phoneNumber;
        }
        
        public void setPhoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
        }
        
        @Override
        public String toString() {
            return "AddressResponse{" +
                    "firstName='" + firstName + '\'' +
                    ", lastName='" + lastName + '\'' +
                    ", addressLine1='" + addressLine1 + '\'' +
                    ", addressLine2='" + addressLine2 + '\'' +
                    ", city='" + city + '\'' +
                    ", state='" + state + '\'' +
                    ", postalCode='" + postalCode + '\'' +
                    ", country='" + country + '\'' +
                    ", phoneNumber='" + phoneNumber + '\'' +
                    '}';
        }
    }
    
    @Override
    public String toString() {
        return "OrderResponse{" +
                "id=" + id +
                ", orderNumber='" + orderNumber + '\'' +
                ", status=" + status +
                ", totalAmount=" + totalAmount +
                ", paymentStatus=" + paymentStatus +
                ", totalItems=" + totalItems +
                ", createdAt=" + createdAt +
                '}';
    }
}
