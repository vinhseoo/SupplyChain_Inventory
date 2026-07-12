package com.scim.controller;

import com.scim.dto.response.*;
import com.scim.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics & Dashboard", description = "APIs for dashboard analytics, ABC classification, slow moving items, and depletion forecasting")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/kpis")
    @Operation(summary = "Get analytical KPIs summary", description = "Retrieve total stock value, active warnings count, SKU count, and total completed transactions count")
    @PreAuthorize("hasAuthority('dashboard:read')")
    public ResponseEntity<ApiResponse<KpiSummaryResponse>> getKpis() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getKpis()));
    }

    @GetMapping("/abc")
    @Operation(summary = "Get product ABC Pareto classification", description = "Retrieve list of products categorized into A, B, or C classes according to Pareto rule")
    @PreAuthorize("hasAuthority('dashboard:read')")
    public ResponseEntity<ApiResponse<List<AbcClassificationResponse>>> getAbcClassification() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getAbcClassification()));
    }

    @GetMapping("/slow-moving")
    @Operation(summary = "Get slow-moving inventory items", description = "Retrieve products with no stock movement in the last 30/60/90 days")
    @PreAuthorize("hasAuthority('dashboard:read')")
    public ResponseEntity<ApiResponse<List<SlowMovingItemResponse>>> getSlowMovingInventory(
            @RequestParam(defaultValue = "30") Integer minDaysInactive) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getSlowMovingInventory(minDaysInactive)));
    }

    @GetMapping("/forecast")
    @Operation(summary = "Get stock depletion forecast", description = "Retrieve estimated days until stock depletion based on historical consumption rate")
    @PreAuthorize("hasAuthority('dashboard:read')")
    public ResponseEntity<ApiResponse<List<StockDepletionForecastResponse>>> getStockDepletionForecast(
            @RequestParam(required = false) Double maxDaysToOut) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getStockDepletionForecast(maxDaysToOut)));
    }

    @GetMapping("/trend")
    @Operation(summary = "Get stock movement trend", description = "Retrieve list of daily inbound and outbound quantities over a period of days")
    @PreAuthorize("hasAuthority('dashboard:read')")
    public ResponseEntity<ApiResponse<List<MovementTrendResponse>>> getMovementTrend(
            @RequestParam(defaultValue = "30") Integer lastDays) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getMovementTrend(lastDays)));
    }
}
