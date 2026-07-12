package com.scim.mapper;

import com.scim.dto.response.NotificationResponse;
import com.scim.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface NotificationMapper {
    NotificationResponse toResponse(Notification notification);
}
