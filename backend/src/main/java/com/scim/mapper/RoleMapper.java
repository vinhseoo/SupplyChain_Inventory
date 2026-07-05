package com.scim.mapper;

import com.scim.dto.permission.response.PermissionResponse;
import com.scim.dto.role.request.RoleRequest;
import com.scim.dto.role.response.RoleResponse;
import com.scim.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {PermissionMapper.class}, builder = @org.mapstruct.Builder(disableBuilder = true))
public interface RoleMapper {

    @Mapping(target = "permissions", source = "permissions")
    RoleResponse toResponse(Role entity, List<PermissionResponse> permissions);

    RoleResponse toResponse(Role entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Role toEntity(RoleRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "name", ignore = true) // name is unique and not updated
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(RoleRequest request, @MappingTarget Role entity);
}
