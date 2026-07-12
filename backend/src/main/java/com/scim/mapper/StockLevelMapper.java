package com.scim.mapper;

import com.scim.dto.response.StockLevelResponse;
import com.scim.entity.StockLevel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface StockLevelMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productCode", source = "product.code")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productSku", source = "product.sku")
    @Mapping(target = "productBarcode", source = "product.barcode")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseName", source = "warehouse.name")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    @Mapping(target = "locationId", source = "location.id")
    @Mapping(target = "locationCode", source = "location.code")
    @Mapping(target = "locationName", source = "location.name")
    @Mapping(target = "batchId", source = "batch.id")
    @Mapping(target = "batchNumber", source = "batch.batchNumber")
    @Mapping(target = "expiryDate", source = "batch.expiryDate")
    @Mapping(target = "uomName", source = "product.uom.name")
    StockLevelResponse toResponse(StockLevel entity);

    List<StockLevelResponse> toResponseList(List<StockLevel> entities);
}
