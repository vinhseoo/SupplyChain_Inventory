package com.scim.controller;

import com.scim.dto.request.BarcodeScanRequest;
import com.scim.dto.request.StocktakeItemRequest;
import com.scim.dto.request.StocktakeSessionRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockAdjustmentResponse;
import com.scim.dto.response.StocktakeSessionResponse;
import com.scim.entity.StocktakeStatus;
import com.scim.service.StocktakeSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stocktake/sessions")
@RequiredArgsConstructor
@Tag(name = "Stocktake Sessions", description = "APIs for stocktaking sessions and audits")
public class StocktakeSessionController {

    private final StocktakeSessionService stocktakeSessionService;

    @GetMapping
    @Operation(summary = "Get list of stocktake sessions", description = "Retrieve stocktake sessions paginated with optional search, warehouse, and status filters")
    @PreAuthorize("hasAuthority('stocktake:read')")
    public ResponseEntity<ApiResponse<PageResponse<StocktakeSessionResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) StocktakeStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(stocktakeSessionService.getAll(search, warehouseId, status, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get stocktake session by ID", description = "Retrieve detailed information of a stocktake session including scanned items")
    @PreAuthorize("hasAuthority('stocktake:read')")
    public ResponseEntity<ApiResponse<StocktakeSessionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(stocktakeSessionService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new stocktake session", description = "Initializes a session at a warehouse, auto-populating items from system stock levels")
    @PreAuthorize("hasAuthority('stocktake:write')")
    public ResponseEntity<ApiResponse<StocktakeSessionResponse>> create(@Valid @RequestBody StocktakeSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(stocktakeSessionService.create(request)));
    }

    @PutMapping("/{id}/items/{itemId}")
    @Operation(summary = "Manually update scanned quantity", description = "Update actual quantity and recalculate variance of a specific stocktake item")
    @PreAuthorize("hasAuthority('stocktake:write')")
    public ResponseEntity<ApiResponse<StocktakeSessionResponse>> updateItemQty(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @Valid @RequestBody StocktakeItemRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(stocktakeSessionService.updateItemQty(id, itemId, request)));
    }

    @PostMapping("/{id}/scan")
    @Operation(summary = "Scan barcode or QR code", description = "Process scanned batch/product barcode at a location and increment actual quantity")
    @PreAuthorize("hasAuthority('stocktake:write')")
    public ResponseEntity<ApiResponse<StocktakeSessionResponse>> scanBarcode(
            @PathVariable Long id,
            @Valid @RequestBody BarcodeScanRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(stocktakeSessionService.scanBarcode(id, request)));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete scanning for session", description = "Freeze session scanning and finalize variance calculations")
    @PreAuthorize("hasAuthority('stocktake:write')")
    public ResponseEntity<ApiResponse<StocktakeSessionResponse>> complete(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(stocktakeSessionService.complete(id)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel stocktake session", description = "Void stocktake session and cancel scanning")
    @PreAuthorize("hasAuthority('stocktake:write')")
    public ResponseEntity<ApiResponse<StocktakeSessionResponse>> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(stocktakeSessionService.cancel(id)));
    }

    @PostMapping("/{id}/adjust")
    @Operation(summary = "Generate stock adjustment", description = "Create approved stock adjustment based on variance, applying updates to actual stock levels")
    @PreAuthorize("hasAuthority('stocktake:write')")
    public ResponseEntity<ApiResponse<StockAdjustmentResponse>> createAdjustment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(stocktakeSessionService.createAdjustment(id)));
    }
}
