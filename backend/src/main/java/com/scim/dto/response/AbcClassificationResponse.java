package com.scim.dto.response;

import java.math.BigDecimal;

public record AbcClassificationResponse(
    Long productId,
    String name,
    String sku,
    BigDecimal totalValue,
    double cumulativePercentage,
    String abcClass
) {}
