package com.scim.mapper;

import com.scim.dto.response.StockAdjustmentItemResponse;
import com.scim.entity.StockAdjustmentItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface StockAdjustmentItemMapper {

    @Mapping(target = "adjustmentId", source = "adjustment.id")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productCode", source = "product.code")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productSku", source = "product.sku")
    @Mapping(target = "uomName", source = "product.uom.name")
    @Mapping(target = "locationId", source = "location.id")
    @Mapping(target = "locationName", source = "location.name")
    @Mapping(target = "locationCode", source = "location.code")
    @Mapping(target = "batchId", source = "batch.id")
    @Mapping(target = "batchNumber", source = "batch.batchNumber")
    StockAdjustmentItemResponse toResponse(StockAdjustmentItem entity);

    List<StockAdjustmentItemResponse> toResponseList(List<StockAdjustmentItem> entities);
}
