package com.scim.controller;

import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockAdjustmentResponse;
import com.scim.entity.StockAdjustmentStatus;
import com.scim.service.StockAdjustmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stock-adjustments")
@RequiredArgsConstructor
@Tag(name = "Stock Adjustments", description = "APIs for stock level adjustments")
public class StockAdjustmentController {

    private final StockAdjustmentService stockAdjustmentService;

    @GetMapping
    @Operation(summary = "Get list of stock adjustments", description = "Retrieve stock adjustments paginated with optional search, warehouse, and status filters")
    public ResponseEntity<ApiResponse<PageResponse<StockAdjustmentResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) StockAdjustmentStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(stockAdjustmentService.getAll(search, warehouseId, status, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get stock adjustment by ID", description = "Retrieve detailed information of a stock adjustment session including adjusted items")
    public ResponseEntity<ApiResponse<StockAdjustmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(stockAdjustmentService.getById(id)));
    }
}
