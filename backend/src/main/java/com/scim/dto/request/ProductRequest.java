package com.scim.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Mã sản phẩm không được để trống")
    @Size(max = 50, message = "Mã sản phẩm không vượt quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 250, message = "Tên sản phẩm không vượt quá 250 ký tự")
    private String name;

    @NotBlank(message = "SKU không được để trống")
    @Size(max = 100, message = "SKU không vượt quá 100 ký tự")
    private String sku;

    @Size(max = 100, message = "Barcode không vượt quá 100 ký tự")
    private String barcode;

    private Long categoryId;

    private Long uomId;

    private String description;

    @NotNull(message = "Định mức tồn tối thiểu không được để trống")
    @DecimalMin(value = "0.0", message = "Tồn tối thiểu không được nhỏ hơn 0")
    private BigDecimal minimumStock;

    @NotNull(message = "Định mức tồn tối đa không được để trống")
    @DecimalMin(value = "0.0", message = "Tồn tối đa không được nhỏ hơn 0")
    private BigDecimal maximumStock;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0.0", message = "Giá không được nhỏ hơn 0")
    private BigDecimal price;

    private Map<String, Object> properties;

    private Boolean isActive;
}
