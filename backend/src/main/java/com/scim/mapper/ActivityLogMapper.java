package com.scim.mapper;

import com.scim.dto.response.ActivityLogResponse;
import com.scim.entity.ActivityLog;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface ActivityLogMapper {
    ActivityLogResponse toResponse(ActivityLog activityLog);
}
