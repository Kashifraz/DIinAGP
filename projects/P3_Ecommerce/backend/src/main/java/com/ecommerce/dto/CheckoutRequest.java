package com.ecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CheckoutRequest {
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    
    @Valid
    @NotNull(message = "Shipping address is required")
    private AddressRequest shippingAddress;
    
    @Valid
    @NotNull(message = "Billing address is required")
    private AddressRequest billingAddress;
    
    private String notes;
    
    // Constructors
    public CheckoutRequest() {
    }
    
    public CheckoutRequest(String paymentMethod, AddressRequest shippingAddress, AddressRequest billingAddress, String notes) {
        this.paymentMethod = paymentMethod;
        this.shippingAddress = shippingAddress;
        this.billingAddress = billingAddress;
        this.notes = notes;
    }
    
    // Getters and Setters
    public String getPaymentMethod() {
        return paymentMethod;
    }
    
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
    
    public AddressRequest getShippingAddress() {
        return shippingAddress;
    }
    
    public void setShippingAddress(AddressRequest shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
    
    public AddressRequest getBillingAddress() {
        return billingAddress;
    }
    
    public void setBillingAddress(AddressRequest billingAddress) {
        this.billingAddress = billingAddress;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    // Inner class for address
    public static class AddressRequest {
        @NotBlank(message = "First name is required")
        @Size(max = 100, message = "First name must not exceed 100 characters")
        private String firstName;
        
        @NotBlank(message = "Last name is required")
        @Size(max = 100, message = "Last name must not exceed 100 characters")
        private String lastName;
        
        @NotBlank(message = "Address line 1 is required")
        @Size(max = 255, message = "Address line 1 must not exceed 255 characters")
        private String addressLine1;
        
        @Size(max = 255, message = "Address line 2 must not exceed 255 characters")
        private String addressLine2;
        
        @NotBlank(message = "City is required")
        @Size(max = 100, message = "City must not exceed 100 characters")
        private String city;
        
        @NotBlank(message = "State/Province is required")
        @Size(max = 100, message = "State/Province must not exceed 100 characters")
        private String state;
        
        @NotBlank(message = "Postal code is required")
        @Size(max = 20, message = "Postal code must not exceed 20 characters")
        private String postalCode;
        
        @NotBlank(message = "Country is required")
        @Size(max = 100, message = "Country must not exceed 100 characters")
        private String country;
        
        @Size(max = 20, message = "Phone number must not exceed 20 characters")
        private String phoneNumber;
        
        // Constructors
        public AddressRequest() {
        }
        
        public AddressRequest(String firstName, String lastName, String addressLine1, String addressLine2, 
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
            return "AddressRequest{" +
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
        return "CheckoutRequest{" +
                "paymentMethod='" + paymentMethod + '\'' +
                ", shippingAddress=" + shippingAddress +
                ", billingAddress=" + billingAddress +
                ", notes='" + notes + '\'' +
                '}';
    }
}
