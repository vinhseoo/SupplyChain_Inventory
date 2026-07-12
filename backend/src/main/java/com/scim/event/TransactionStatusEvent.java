package com.scim.event;

import com.scim.entity.InventoryTransaction;
import org.springframework.context.ApplicationEvent;

public class TransactionStatusEvent extends ApplicationEvent {
    private final InventoryTransaction transaction;

    public TransactionStatusEvent(Object source, InventoryTransaction transaction) {
        super(source);
        this.transaction = transaction;
    }

    public InventoryTransaction getTransaction() {
        return transaction;
    }
}
