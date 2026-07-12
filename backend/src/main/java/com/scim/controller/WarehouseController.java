package com.scim.controller;

import com.scim.dto.request.WarehouseRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.LocationNodeResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.WarehouseResponse;
import com.scim.service.LocationService;
import com.scim.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
@Tag(name = "Warehouses", description = "APIs for warehouse configurations and nested location hierarchy lookups")
public class WarehouseController {

    private final WarehouseService warehouseService;
    private final LocationService locationService;

    @GetMapping
    @Operation(summary = "Get all warehouses paginated", description = "Retrieve a paginated list of warehouses matching filter")
    public ResponseEntity<ApiResponse<PageResponse<WarehouseResponse>>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getAll(search, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID", description = "Retrieve detailed warehouse information by its database ID")
    public ResponseEntity<ApiResponse<WarehouseResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create warehouse", description = "Create a new warehouse profile")
    public ResponseEntity<ApiResponse<WarehouseResponse>> create(@Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(warehouseService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update warehouse", description = "Modify an existing warehouse profile by its database ID")
    public ResponseEntity<ApiResponse<WarehouseResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody WarehouseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(warehouseService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete warehouse", description = "Soft delete a warehouse profile from the system")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        warehouseService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/{id}/locations/tree")
    @Operation(summary = "Get warehouse location tree", description = "Retrieve the complete hierarchical tree diagram of locations under a warehouse")
    public ResponseEntity<ApiResponse<List<LocationNodeResponse>>> getLocationTree(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(locationService.getWarehouseLocationTree(id)));
    }
}
