package com.scim.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionItemResponse {
    private Long id;
    private Long productId;
    private String productCode;
    private String productName;
    private String productSku;
    private String uomName;
    private BigDecimal quantity;
    private BigDecimal price;
    private Long sourceLocationId;
    private String sourceLocationName;
    private String sourceLocationCode;
    private Long destinationLocationId;
    private String destinationLocationName;
    private String destinationLocationCode;
    private String batchNumber;
    private LocalDate productionDate;
    private LocalDate expiryDate;
    private String note;
}
