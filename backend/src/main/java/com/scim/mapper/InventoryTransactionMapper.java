package com.scim.mapper;

import com.scim.dto.request.InventoryTransactionRequest;
import com.scim.dto.response.InventoryTransactionResponse;
import com.scim.entity.InventoryTransaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true), uses = {TransactionItemMapper.class})
public interface InventoryTransactionMapper {

    @Mapping(target = "sourceWarehouseId", source = "sourceWarehouse.id")
    @Mapping(target = "sourceWarehouseName", source = "sourceWarehouse.name")
    @Mapping(target = "sourceWarehouseCode", source = "sourceWarehouse.code")
    @Mapping(target = "destinationWarehouseId", source = "destinationWarehouse.id")
    @Mapping(target = "destinationWarehouseName", source = "destinationWarehouse.name")
    @Mapping(target = "destinationWarehouseCode", source = "destinationWarehouse.code")
    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierName", source = "supplier.name")
    @Mapping(target = "supplierCode", source = "supplier.code")
    InventoryTransactionResponse toResponse(InventoryTransaction entity);

    List<InventoryTransactionResponse> toResponseList(List<InventoryTransaction> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sourceWarehouse", ignore = true)
    @Mapping(target = "destinationWarehouse", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "items", ignore = true)
    InventoryTransaction toEntity(InventoryTransactionRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "sourceWarehouse", ignore = true)
    @Mapping(target = "destinationWarehouse", ignore = true)
    @Mapping(target = "supplier", ignore = true)
    @Mapping(target = "items", ignore = true)
    void updateEntity(InventoryTransactionRequest request, @MappingTarget InventoryTransaction entity);
}
