package com.scim.dto.response;

import com.scim.entity.StockMovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
    private Long id;
    private Long productId;
    private String productCode;
    private String productName;
    private String productSku;
    private String uomName;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private Long locationId;
    private String locationCode;
    private String locationName;
    private Long batchId;
    private String batchNumber;
    private Long transactionId;
    private String transactionCode;
    private StockMovementType type;
    private BigDecimal quantity;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private LocalDateTime createdAt;
    private String createdBy;
}
