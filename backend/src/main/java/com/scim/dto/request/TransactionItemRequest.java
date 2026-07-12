package com.scim.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class TransactionItemRequest {

    @NotNull(message = "Sản phẩm không được để trống")
    private Long productId;

    @NotNull(message = "Số lượng không được để trống")
    @DecimalMin(value = "0.0001", message = "Số lượng phải lớn hơn 0")
    private BigDecimal quantity;

    @NotNull(message = "Đơn giá không được để trống")
    @DecimalMin(value = "0.0", message = "Đơn giá không được âm")
    private BigDecimal price;

    private Long sourceLocationId;

    private Long destinationLocationId;

    @Size(max = 100, message = "Số lô không được vượt quá 100 ký tự")
    private String batchNumber;

    private LocalDate productionDate;

    private LocalDate expiryDate;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;
}
