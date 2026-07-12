package com.scim.controller;

import com.scim.dto.request.CategoryRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.CategoryResponse;
import com.scim.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "APIs for managing product categories and structures")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "Get all categories", description = "Retrieve a list of all categories matching search filter")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAll(
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAll(search)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Retrieve detailed information of a category by its database ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create category", description = "Create a new product category")
    public ResponseEntity<ApiResponse<CategoryResponse>> create(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(categoryService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Modify an existing category by its database ID")
    public ResponseEntity<ApiResponse<CategoryResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Soft delete a category and its nested children recursively")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
