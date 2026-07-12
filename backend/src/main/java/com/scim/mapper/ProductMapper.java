package com.scim.mapper;

import com.scim.dto.request.ProductRequest;
import com.scim.dto.response.ProductResponse;
import com.scim.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface ProductMapper {

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "uomId", source = "uom.id")
    @Mapping(target = "uomName", source = "uom.name")
    ProductResponse toResponse(Product entity);

    List<ProductResponse> toResponseList(List<Product> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "uom", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Product toEntity(ProductRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "uom", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(ProductRequest request, @MappingTarget Product entity);
}
