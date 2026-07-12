package com.scim.mapper;

import com.scim.dto.response.StockMovementResponse;
import com.scim.entity.StockMovement;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface StockMovementMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productCode", source = "product.code")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productSku", source = "product.sku")
    @Mapping(target = "uomName", source = "product.uom.name")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.name")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    @Mapping(target = "locationId", source = "location.id")
    @Mapping(target = "locationCode", source = "location.code")
    @Mapping(target = "locationName", source = "location.name")
    @Mapping(target = "batchId", source = "batch.id")
    @Mapping(target = "batchNumber", source = "batch.batchNumber")
    @Mapping(target = "transactionId", source = "transaction.id")
    @Mapping(target = "transactionCode", source = "transaction.code")
    StockMovementResponse toResponse(StockMovement entity);

    List<StockMovementResponse> toResponseList(List<StockMovement> entities);
}
