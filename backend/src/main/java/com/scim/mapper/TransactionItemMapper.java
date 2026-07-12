package com.scim.mapper;

import com.scim.dto.request.TransactionItemRequest;
import com.scim.dto.response.TransactionItemResponse;
import com.scim.entity.TransactionItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface TransactionItemMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productCode", source = "product.code")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productSku", source = "product.sku")
    @Mapping(target = "uomName", source = "product.uom.name")
    @Mapping(target = "sourceLocationId", source = "sourceLocation.id")
    @Mapping(target = "sourceLocationName", source = "sourceLocation.name")
    @Mapping(target = "sourceLocationCode", source = "sourceLocation.code")
    @Mapping(target = "destinationLocationId", source = "destinationLocation.id")
    @Mapping(target = "destinationLocationName", source = "destinationLocation.name")
    @Mapping(target = "destinationLocationCode", source = "destinationLocation.code")
    TransactionItemResponse toResponse(TransactionItem entity);

    List<TransactionItemResponse> toResponseList(List<TransactionItem> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "transaction", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "sourceLocation", ignore = true)
    @Mapping(target = "destinationLocation", ignore = true)
    TransactionItem toEntity(TransactionItemRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "transaction", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "sourceLocation", ignore = true)
    @Mapping(target = "destinationLocation", ignore = true)
    void updateEntity(TransactionItemRequest request, @MappingTarget TransactionItem entity);
}
