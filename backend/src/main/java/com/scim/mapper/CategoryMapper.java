package com.scim.mapper;

import com.scim.dto.request.CategoryRequest;
import com.scim.dto.response.CategoryResponse;
import com.scim.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", builder = @org.mapstruct.Builder(disableBuilder = true))
public interface CategoryMapper {

    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    CategoryResponse toResponse(Category entity);

    List<CategoryResponse> toResponseList(List<Category> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Category toEntity(CategoryRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    void updateEntity(CategoryRequest request, @MappingTarget Category entity);
}
