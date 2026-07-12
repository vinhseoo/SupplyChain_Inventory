package com.scim.entity;

import com.scim.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "product_batches", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "batch_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBatch extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "batch_number", nullable = false, length = 100)
    private String batchNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(name = "production_date")
    private LocalDate productionDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "quantity", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "remaining_quantity", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal remainingQuantity = BigDecimal.ZERO;

    @Column(name = "cost_price", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal costPrice = BigDecimal.ZERO;
}
