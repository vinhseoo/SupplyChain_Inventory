package com.scim.controller;

import com.scim.dto.request.UnitOfMeasureRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.UnitOfMeasureResponse;
import com.scim.service.UnitOfMeasureService;
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

@RestController
@RequestMapping("/units-of-measure")
@RequiredArgsConstructor
@Tag(name = "Units of Measure", description = "APIs for managing units of measure (UOMs)")
public class UnitOfMeasureController {

    private final UnitOfMeasureService uomService;

    @GetMapping
    @Operation(summary = "Get all units of measure paginated", description = "Retrieve a paginated list of units of measure matching filter")
    public ResponseEntity<ApiResponse<PageResponse<UnitOfMeasureResponse>>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(uomService.getAll(search, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get unit of measure by ID", description = "Retrieve detailed unit of measure information by database ID")
    public ResponseEntity<ApiResponse<UnitOfMeasureResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(uomService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create unit of measure", description = "Create a new unit of measure profile")
    public ResponseEntity<ApiResponse<UnitOfMeasureResponse>> create(@Valid @RequestBody UnitOfMeasureRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(uomService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update unit of measure", description = "Modify an existing unit of measure profile by database ID")
    public ResponseEntity<ApiResponse<UnitOfMeasureResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UnitOfMeasureRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(uomService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete unit of measure", description = "Soft delete a unit of measure profile from the system")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        uomService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
