package com.scim.mapper;

import com.scim.dto.request.StocktakeSessionRequest;
import com.scim.dto.response.StocktakeSessionResponse;
import com.scim.entity.StocktakeSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true), uses = {StocktakeItemMapper.class})
public interface StocktakeSessionMapper {

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.name")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    StocktakeSessionResponse toResponse(StocktakeSession entity);

    List<StocktakeSessionResponse> toResponseList(List<StocktakeSession> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "items", ignore = true)
    StocktakeSession toEntity(StocktakeSessionRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "items", ignore = true)
    void updateEntity(StocktakeSessionRequest request, @MappingTarget StocktakeSession entity);
}
