package com.scim.mapper;

import com.scim.dto.request.UnitOfMeasureRequest;
import com.scim.dto.response.UnitOfMeasureResponse;
import com.scim.entity.UnitOfMeasure;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface UnitOfMeasureMapper {

    UnitOfMeasureResponse toResponse(UnitOfMeasure entity);

    List<UnitOfMeasureResponse> toResponseList(List<UnitOfMeasure> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    UnitOfMeasure toEntity(UnitOfMeasureRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(UnitOfMeasureRequest request, @MappingTarget UnitOfMeasure entity);
}
