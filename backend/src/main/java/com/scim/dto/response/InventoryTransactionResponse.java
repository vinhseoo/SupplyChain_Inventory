package com.scim.dto.response;

import com.scim.entity.TransactionStatus;
import com.scim.entity.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionResponse {
    private Long id;
    private String code;
    private TransactionType type;
    private TransactionStatus status;
    private Long sourceWarehouseId;
    private String sourceWarehouseName;
    private String sourceWarehouseCode;
    private Long destinationWarehouseId;
    private String destinationWarehouseName;
    private String destinationWarehouseCode;
    private Long supplierId;
    private String supplierName;
    private String supplierCode;
    private BigDecimal totalAmount;
    private LocalDateTime transactionDate;
    private String note;
    private List<TransactionItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}
