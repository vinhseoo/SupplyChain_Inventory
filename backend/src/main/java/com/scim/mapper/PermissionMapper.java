package com.scim.mapper;

import com.scim.dto.permission.response.PermissionResponse;
import com.scim.entity.Permission;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PermissionMapper {

    PermissionResponse toResponse(Permission entity);

    List<PermissionResponse> toResponseList(List<Permission> entities);
}
