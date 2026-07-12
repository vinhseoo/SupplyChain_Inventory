package com.scim.dto.request;

import com.scim.entity.TransactionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class InventoryTransactionRequest {

    @NotBlank(message = "Mã phiếu không được để trống")
    @Size(max = 50, message = "Mã phiếu không được vượt quá 50 ký tự")
    private String code;

    @NotNull(message = "Loại giao dịch không được để trống")
    private TransactionType type;

    private Long sourceWarehouseId;

    private Long destinationWarehouseId;

    private Long supplierId;

    private LocalDateTime transactionDate;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;

    @Valid
    @NotNull(message = "Danh sách sản phẩm không được trống")
    private List<TransactionItemRequest> items;
}
