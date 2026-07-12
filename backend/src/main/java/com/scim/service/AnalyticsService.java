package com.scim.service;

import com.scim.dto.response.*;
import java.util.List;

public interface AnalyticsService {
    KpiSummaryResponse getKpis();
    List<AbcClassificationResponse> getAbcClassification();
    List<SlowMovingItemResponse> getSlowMovingInventory(Integer minDaysInactive);
    List<StockDepletionForecastResponse> getStockDepletionForecast(Double maxDaysToOut);
    List<MovementTrendResponse> getMovementTrend(Integer lastDays);
    void refreshMaterializedViews();
}
