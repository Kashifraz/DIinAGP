package com.ecommerce.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class StripeWebhookEvent {
    
    private String id;
    
    private String type;
    
    private String created;
    
    private StripeWebhookData data;
    
    private boolean livemode;
    
    private int pendingWebhooks;
    
    private String request;
    
    // Constructors
    public StripeWebhookEvent() {
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }
    
    public void setId(String id) {
        this.id = id;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getCreated() {
        return created;
    }
    
    public void setCreated(String created) {
        this.created = created;
    }
    
    public StripeWebhookData getData() {
        return data;
    }
    
    public void setData(StripeWebhookData data) {
        this.data = data;
    }
    
    public boolean isLivemode() {
        return livemode;
    }
    
    public void setLivemode(boolean livemode) {
        this.livemode = livemode;
    }
    
    public int getPendingWebhooks() {
        return pendingWebhooks;
    }
    
    public void setPendingWebhooks(int pendingWebhooks) {
        this.pendingWebhooks = pendingWebhooks;
    }
    
    public String getRequest() {
        return request;
    }
    
    public void setRequest(String request) {
        this.request = request;
    }
    
    @Override
    public String toString() {
        return "StripeWebhookEvent{" +
                "id='" + id + '\'' +
                ", type='" + type + '\'' +
                ", created='" + created + '\'' +
                ", data=" + data +
                ", livemode=" + livemode +
                ", pendingWebhooks=" + pendingWebhooks +
                ", request='" + request + '\'' +
                '}';
    }
    
    public static class StripeWebhookData {
        
        private StripeWebhookObject object;
        
        // Constructors
        public StripeWebhookData() {
        }
        
        // Getters and Setters
        public StripeWebhookObject getObject() {
            return object;
        }
        
        public void setObject(StripeWebhookObject object) {
            this.object = object;
        }
        
        @Override
        public String toString() {
            return "StripeWebhookData{" +
                    "object=" + object +
                    '}';
        }
    }
    
    public static class StripeWebhookObject {
        
        private String id;
        
        private String status;
        
        private String type;
        
        @JsonProperty("payment_intent")
        private String paymentIntent;
        
        private StripeWebhookMetadata metadata;
        
        // Constructors
        public StripeWebhookObject() {
        }
        
        // Getters and Setters
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public String getType() {
            return type;
        }
        
        public void setType(String type) {
            this.type = type;
        }
        
        public String getPaymentIntent() {
            return paymentIntent;
        }
        
        public void setPaymentIntent(String paymentIntent) {
            this.paymentIntent = paymentIntent;
        }
        
        public StripeWebhookMetadata getMetadata() {
            return metadata;
        }
        
        public void setMetadata(StripeWebhookMetadata metadata) {
            this.metadata = metadata;
        }
        
        @Override
        public String toString() {
            return "StripeWebhookObject{" +
                    "id='" + id + '\'' +
                    ", status='" + status + '\'' +
                    ", type='" + type + '\'' +
                    ", paymentIntent='" + paymentIntent + '\'' +
                    ", metadata=" + metadata +
                    '}';
        }
    }
    
    public static class StripeWebhookMetadata {
        
        @JsonProperty("order_id")
        private String orderId;
        
        @JsonProperty("user_id")
        private String userId;
        
        // Constructors
        public StripeWebhookMetadata() {
        }
        
        // Getters and Setters
        public String getOrderId() {
            return orderId;
        }
        
        public void setOrderId(String orderId) {
            this.orderId = orderId;
        }
        
        public String getUserId() {
            return userId;
        }
        
        public void setUserId(String userId) {
            this.userId = userId;
        }
        
        @Override
        public String toString() {
            return "StripeWebhookMetadata{" +
                    "orderId='" + orderId + '\'' +
                    ", userId='" + userId + '\'' +
                    '}';
        }
    }
}
