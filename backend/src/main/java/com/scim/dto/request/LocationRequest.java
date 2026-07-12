package com.scim.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationRequest {

    @NotBlank(message = "Mã vị trí không được để trống")
    @Size(max = 50, message = "Mã vị trí không vượt quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên vị trí không được để trống")
    @Size(max = 200, message = "Tên vị trí không vượt quá 200 ký tự")
    private String name;

    @NotNull(message = "Mã ID kho không được để trống")
    private Long warehouseId;

    private Long parentId;

    @NotBlank(message = "Loại vị trí không được để trống")
    @Size(max = 50, message = "Loại vị trí không vượt quá 50 ký tự")
    private String type; // ZONE, AISLE, SHELF, RACK, BIN, etc.

    @Size(max = 500, message = "Mô tả không vượt quá 500 ký tự")
    private String description;

    private Boolean isActive;
}
