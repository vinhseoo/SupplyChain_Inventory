package com.scim.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseRequest {

    @NotBlank(message = "Mã kho không được để trống")
    @Size(max = 50, message = "Mã kho không vượt quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên kho không được để trống")
    @Size(max = 200, message = "Tên kho không vượt quá 200 ký tự")
    private String name;

    @Size(max = 500, message = "Địa chỉ không vượt quá 500 ký tự")
    private String address;

    @Size(max = 500, message = "Mô tả không vượt quá 500 ký tự")
    private String description;

    private Boolean isActive;
}
