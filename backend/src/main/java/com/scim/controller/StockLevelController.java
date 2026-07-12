package com.scim.controller;

import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockLevelResponse;
import com.scim.dto.response.StockMovementResponse;
import com.scim.service.StockLevelService;
import com.scim.service.StockMovementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/inventory/stock-levels")
@RequiredArgsConstructor
@Tag(name = "Stock Levels", description = "APIs for viewing realtime stock balances and stock movements (Stock Card)")
public class StockLevelController {

    private final StockLevelService stockLevelService;
    private final StockMovementService stockMovementService;

    @GetMapping
    @Operation(summary = "Get realtime stock levels paginated", description = "Query current stock balance filterable by warehouse, location, and product")
    public ResponseEntity<ApiResponse<PageResponse<StockLevelResponse>>> getAll(
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(stockLevelService.getAll(warehouseId, productId, locationId, search, pageable)));
    }

    @GetMapping("/history")
    @Operation(summary = "Get stock movement history (Stock Card) paginated", description = "Retrieve stock card logs filterable by product, warehouse, location, and date range")
    public ResponseEntity<ApiResponse<PageResponse<StockMovementResponse>>> getStockCard(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long warehouseId,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(stockMovementService.getStockCard(productId, warehouseId, locationId, startDate, endDate, pageable)));
    }
}
