package com.scim.mapper;

import com.scim.dto.request.WarehouseRequest;
import com.scim.dto.response.WarehouseResponse;
import com.scim.entity.Warehouse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface WarehouseMapper {

    WarehouseResponse toResponse(Warehouse entity);

    List<WarehouseResponse> toResponseList(List<Warehouse> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Warehouse toEntity(WarehouseRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(WarehouseRequest request, @MappingTarget Warehouse entity);
}
