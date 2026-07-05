package com.scim.mapper;

import com.scim.dto.user.request.UserCreateRequest;
import com.scim.dto.user.request.UserUpdateRequest;
import com.scim.dto.user.response.UserResponse;
import com.scim.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface UserMapper {

    @Mapping(target = "roles", source = "roles")
    @Mapping(target = "permissions", source = "permissions")
    UserResponse toResponse(User entity, List<String> roles, List<String> permissions);

    UserResponse toResponse(User entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    User toEntity(UserCreateRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(UserUpdateRequest request, @MappingTarget User entity);
}
