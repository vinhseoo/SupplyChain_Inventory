package com.scim.event;

import org.springframework.context.ApplicationEvent;

public class StockChangeEvent extends ApplicationEvent {
    private final Long productId;
    private final String sku;
    private final String name;

    public StockChangeEvent(Object source, Long productId, String sku, String name) {
        super(source);
        this.productId = productId;
        this.sku = sku;
        this.name = name;
    }

    public Long getProductId() {
        return productId;
    }

    public String getSku() {
        return sku;
    }

    public String getName() {
        return name;
    }
}
