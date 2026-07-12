package com.scim.mapper;

import com.scim.dto.response.StockAdjustmentResponse;
import com.scim.entity.StockAdjustment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true), uses = {StockAdjustmentItemMapper.class})
public interface StockAdjustmentMapper {

    @Mapping(target = "sessionId", source = "session.id")
    @Mapping(target = "sessionCode", source = "session.code")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.name")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    StockAdjustmentResponse toResponse(StockAdjustment entity);

    List<StockAdjustmentResponse> toResponseList(List<StockAdjustment> entities);
}
