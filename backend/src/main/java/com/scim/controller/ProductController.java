package com.scim.controller;

import com.scim.dto.request.ProductRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.ProductImportSummaryResponse;
import com.scim.dto.response.ProductResponse;
import com.scim.service.ProductService;
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
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "APIs for managing products (SKUs), Excel exports, and bulk Excel imports")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get all products paginated", description = "Retrieve a paginated list of products matching search, category, and UOM filters")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long uomId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getAll(search, categoryId, uomId, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve detailed product information by database ID")
    public ResponseEntity<ApiResponse<ProductResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create product", description = "Create a new product record")
    public ResponseEntity<ApiResponse<ProductResponse>> create(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(productService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product", description = "Modify an existing product record by its database ID")
    public ResponseEntity<ApiResponse<ProductResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(productService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete product", description = "Soft delete a product record from the system")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @GetMapping("/export")
    @Operation(summary = "Export products to Excel", description = "Download an Excel sheet of the products list")
    public ResponseEntity<byte[]> exportToExcel(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long uomId) {
        byte[] data = productService.exportToExcel(search, categoryId, uomId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "products.xlsx");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Import products from Excel", description = "Upload an Excel file to bulk import products")
    public ResponseEntity<ApiResponse<ProductImportSummaryResponse>> importFromExcel(
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(ApiResponse.ok(productService.importFromExcel(file)));
    }
}
