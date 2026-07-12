package com.scim.dto.response;

import java.math.BigDecimal;

public record KpiSummaryResponse(
    BigDecimal totalInventoryValue,
    long totalSkus,
    long totalInboundTransactions,
    long totalOutboundTransactions,
    long activeAlertsCount
) {}
