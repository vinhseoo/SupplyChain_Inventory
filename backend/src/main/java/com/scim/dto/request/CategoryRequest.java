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
public class CategoryRequest {

    @NotBlank(message = "Mã danh mục không được để trống")
    @Size(max = 50, message = "Mã danh mục không vượt quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 200, message = "Tên danh mục không vượt quá 200 ký tự")
    private String name;

    private Long parentId;

    @Size(max = 500, message = "Mô tả không vượt quá 500 ký tự")
    private String description;

    private Boolean isActive;
}
