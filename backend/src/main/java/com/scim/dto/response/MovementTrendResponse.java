package com.scim.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MovementTrendResponse(
    LocalDate date,
    BigDecimal inboundQty,
    BigDecimal outboundQty
) {}
