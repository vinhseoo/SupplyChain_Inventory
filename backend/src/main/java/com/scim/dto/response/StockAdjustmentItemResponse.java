package com.scim.dto.response;

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
public class StockAdjustmentItemResponse {
    private Long id;
    private Long adjustmentId;
    private Long productId;
    private String productName;
    private String productCode;
    private String productSku;
    private String uomName;
    private Long locationId;
    private String locationName;
    private String locationCode;
    private Long batchId;
    private String batchNumber;
    private BigDecimal systemQuantity;
    private BigDecimal actualQuantity;
    private BigDecimal adjustedQuantity;
    private String reason;
    private LocalDateTime createdAt;
}
