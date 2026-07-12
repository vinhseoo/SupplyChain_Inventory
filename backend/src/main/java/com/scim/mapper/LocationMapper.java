package com.scim.mapper;

import com.scim.dto.request.LocationRequest;
import com.scim.dto.response.LocationNodeResponse;
import com.scim.dto.response.LocationResponse;
import com.scim.entity.Location;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface LocationMapper {

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.name")
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    LocationResponse toResponse(Location entity);

    List<LocationResponse> toResponseList(List<Location> entities);

    @Mapping(target = "parentId", source = "parent.id")
    LocationNodeResponse toNodeResponse(Location entity);

    List<LocationNodeResponse> toNodeResponseList(List<Location> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Location toEntity(LocationRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(LocationRequest request, @MappingTarget Location entity);
}
