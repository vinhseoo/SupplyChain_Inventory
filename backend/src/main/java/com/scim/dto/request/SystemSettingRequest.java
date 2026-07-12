package com.scim.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SystemSettingRequest(
    @NotBlank(message = "Gia tri cau hinh khong duoc bo trong")
    @Size(max = 500, message = "Gia tri cau hinh toi da 500 ky tu")
    String settingVal
) {}
