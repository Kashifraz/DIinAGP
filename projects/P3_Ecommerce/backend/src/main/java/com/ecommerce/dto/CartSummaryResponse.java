package com.ecommerce.dto;

import java.util.List;

public class CartSummaryResponse {
    
    private List<CartItemResponse> items;
    private Integer totalItems;
    private Long totalQuantity;
    private Double totalPrice;
    private Double subtotal;
    private Double tax;
    private Double shipping;
    private Double grandTotal;
    
    // Constructors
    public CartSummaryResponse() {}
    
    public CartSummaryResponse(List<CartItemResponse> items, Integer totalItems, Long totalQuantity, 
                              Double totalPrice, Double subtotal, Double tax, Double shipping, Double grandTotal) {
        this.items = items;
        this.totalItems = totalItems;
        this.totalQuantity = totalQuantity;
        this.totalPrice = totalPrice;
        this.subtotal = subtotal;
        this.tax = tax;
        this.shipping = shipping;
        this.grandTotal = grandTotal;
    }
    
    // Getters and Setters
    public List<CartItemResponse> getItems() {
        return items;
    }
    
    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }
    
    public Integer getTotalItems() {
        return totalItems;
    }
    
    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }
    
    public Long getTotalQuantity() {
        return totalQuantity;
    }
    
    public void setTotalQuantity(Long totalQuantity) {
        this.totalQuantity = totalQuantity;
    }
    
    public Double getTotalPrice() {
        return totalPrice;
    }
    
    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }
    
    public Double getSubtotal() {
        return subtotal;
    }
    
    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }
    
    public Double getTax() {
        return tax;
    }
    
    public void setTax(Double tax) {
        this.tax = tax;
    }
    
    public Double getShipping() {
        return shipping;
    }
    
    public void setShipping(Double shipping) {
        this.shipping = shipping;
    }
    
    public Double getGrandTotal() {
        return grandTotal;
    }
    
    public void setGrandTotal(Double grandTotal) {
        this.grandTotal = grandTotal;
    }
    
    @Override
    public String toString() {
        return "CartSummaryResponse{" +
                "items=" + items +
                ", totalItems=" + totalItems +
                ", totalQuantity=" + totalQuantity +
                ", totalPrice=" + totalPrice +
                ", subtotal=" + subtotal +
                ", tax=" + tax +
                ", shipping=" + shipping +
                ", grandTotal=" + grandTotal +
                '}';
    }
}
