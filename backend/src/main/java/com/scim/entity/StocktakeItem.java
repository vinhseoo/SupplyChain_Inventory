package com.scim.entity;

import com.scim.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "stocktake_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StocktakeItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stocktake_session_id", nullable = false)
    private StocktakeSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private ProductBatch batch;

    @Column(name = "system_quantity", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal systemQuantity = BigDecimal.ZERO;

    @Column(name = "actual_quantity", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal actualQuantity = BigDecimal.ZERO;

    @Column(name = "variance", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal variance = BigDecimal.ZERO;

    @Column(name = "note")
    private String note;
}
