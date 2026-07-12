package com.scim.controller;

import com.scim.dto.request.LocationRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.LocationResponse;
import com.scim.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/locations")
@RequiredArgsConstructor
@Tag(name = "Locations", description = "APIs for location configuration within warehouses")
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/{id}")
    @Operation(summary = "Get location by ID", description = "Retrieve detailed information of a specific location by database ID")
    public ResponseEntity<ApiResponse<LocationResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(locationService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create location", description = "Create a new location inside a warehouse")
    public ResponseEntity<ApiResponse<LocationResponse>> create(@Valid @RequestBody LocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(locationService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update location", description = "Modify an existing location profile by its database ID")
    public ResponseEntity<ApiResponse<LocationResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody LocationRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(locationService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete location", description = "Soft delete a location profile and all its child positions recursively")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        locationService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Get locations by warehouse", description = "Retrieve a flat list of all locations matching warehouse ID")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getByWarehouse(@PathVariable Long warehouseId) {
        return ResponseEntity.ok(ApiResponse.ok(locationService.getByWarehouseId(warehouseId)));
    }
}
