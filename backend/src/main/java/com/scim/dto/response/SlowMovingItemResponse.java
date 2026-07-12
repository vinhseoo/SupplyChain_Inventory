package com.scim.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SlowMovingItemResponse(
    Long productId,
    String name,
    String sku,
    BigDecimal price,
    BigDecimal currentStock,
    LocalDate lastMovementDate,
    int daysInactive
) {}
