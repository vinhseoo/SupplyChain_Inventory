package com.scim.dto.response;

import java.math.BigDecimal;

public record StockDepletionForecastResponse(
    Long productId,
    String name,
    String sku,
    BigDecimal currentStock,
    BigDecimal avgDailyConsumption,
    double daysToOut
) {}
