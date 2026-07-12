package com.scim.mapper;

import com.scim.dto.response.SystemSettingResponse;
import com.scim.entity.SystemSetting;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface SystemSettingMapper {
    SystemSettingResponse toResponse(SystemSetting systemSetting);
}
