package com.scim.mapper;

import com.scim.dto.request.SupplierRequest;
import com.scim.dto.response.SupplierResponse;
import com.scim.entity.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface SupplierMapper {

    SupplierResponse toResponse(Supplier entity);

    List<SupplierResponse> toResponseList(List<Supplier> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Supplier toEntity(SupplierRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(SupplierRequest request, @MappingTarget Supplier entity);
}
