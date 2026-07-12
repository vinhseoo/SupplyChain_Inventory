package com.scim.controller;

import com.scim.dto.request.SupplierRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.SupplierResponse;
import com.scim.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "APIs for managing suppliers and exporting supplier lists")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Get all suppliers paginated", description = "Retrieve a paginated list of suppliers matching filter")
    public ResponseEntity<ApiResponse<PageResponse<SupplierResponse>>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getAll(search, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get supplier by ID", description = "Retrieve detailed supplier information by its database ID")
    public ResponseEntity<ApiResponse<SupplierResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create supplier", description = "Create a new supplier profile")
    public ResponseEntity<ApiResponse<SupplierResponse>> create(@Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(supplierService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update supplier", description = "Modify an existing supplier profile by its database ID")
    public ResponseEntity<ApiResponse<SupplierResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete supplier", description = "Soft delete a supplier profile from the system")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/export")
    @Operation(summary = "Export suppliers to Excel", description = "Download an Excel sheet of the suppliers list")
    public ResponseEntity<byte[]> exportToExcel(@RequestParam(required = false) String search) {
        byte[] data = supplierService.exportToExcel(search);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "suppliers.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
