package com.scim.dto.response;

import com.scim.entity.StockAdjustmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentResponse {
    private Long id;
    private String code;
    private Long sessionId;
    private String sessionCode;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private StockAdjustmentStatus status;
    private String reason;
    private List<StockAdjustmentItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
