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
public class UnitOfMeasureRequest {

    @NotBlank(message = "Mã ĐVT không được để trống")
    @Size(max = 50, message = "Mã ĐVT không vượt quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên ĐVT không được để trống")
    @Size(max = 150, message = "Tên ĐVT không vượt quá 150 ký tự")
    private String name;

    @Size(max = 500, message = "Mô tả không vượt quá 500 ký tự")
    private String description;

    private Boolean isActive;
}
