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
public class StockLevelResponse {
    private Long id;
    private Long productId;
    private String productCode;
    private String productName;
    private String productSku;
    private String productBarcode;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private Long locationId;
    private String locationCode;
    private String locationName;
    private Long batchId;
    private String batchNumber;
    private LocalDate expiryDate;
    private BigDecimal quantity;
    private BigDecimal reservedQuantity;
    private String uomName;
}
