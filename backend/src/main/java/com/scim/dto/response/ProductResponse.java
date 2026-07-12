package com.scim.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    private Long id;
    private String code;
    private String name;
    private String sku;
    private String barcode;
    private Long categoryId;
    private String categoryName;
    private Long uomId;
    private String uomName;
    private String description;
    private BigDecimal minimumStock;
    private BigDecimal maximumStock;
    private BigDecimal price;
    private Map<String, Object> properties;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
