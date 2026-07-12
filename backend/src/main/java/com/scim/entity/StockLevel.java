package com.scim.entity;

import com.scim.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "stock_levels", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "warehouse_id", "location_id", "batch_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockLevel extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    private Warehouse warehouse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    @Column(name = "quantity", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @Column(name = "reserved_quantity", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal reservedQuantity = BigDecimal.ZERO;
}
