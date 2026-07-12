package com.scim.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StocktakeItemRequest {

    @NotNull(message = "Số lượng thực tế không được để trống")
    @PositiveOrZero(message = "Số lượng thực tế không được âm")
    private BigDecimal actualQuantity;

    private String note;
}
