package com.scim.entity;

import com.scim.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.Map;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 250)
    private String name;

    @Column(name = "sku", nullable = false, unique = true, length = 100)
    private String sku;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uom_id")
    private UnitOfMeasure uom;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "minimum_stock", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal minimumStock = BigDecimal.ZERO;

    @Column(name = "maximum_stock", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal maximumStock = BigDecimal.ZERO;

    @Column(name = "price", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "properties")
    private Map<String, Object> properties;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
