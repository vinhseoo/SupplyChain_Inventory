package com.scim.dto.request;

import jakarta.validation.constraints.Email;
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
public class SupplierRequest {

    @NotBlank(message = "Mã nhà cung cấp không được để trống")
    @Size(max = 50, message = "Mã nhà cung cấp không vượt quá 50 ký tự")
    private String code;

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    @Size(max = 200, message = "Tên nhà cung cấp không vượt quá 200 ký tự")
    private String name;

    @Size(max = 150, message = "Tên người liên hệ không vượt quá 150 ký tự")
    private String contactName;

    @Email(message = "Email không hợp lệ")
    @Size(max = 150, message = "Email không vượt quá 150 ký tự")
    private String email;

    @Size(max = 50, message = "Số điện thoại không vượt quá 50 ký tự")
    private String phone;

    @Size(max = 50, message = "Mã số thuế không vượt quá 50 ký tự")
    private String taxCode;

    @Size(max = 50, message = "Địa chỉ không vượt quá 500 ký tự")
    private String address;

    private String note;

    private Boolean isActive;
}
