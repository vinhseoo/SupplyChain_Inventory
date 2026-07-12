package com.scim.service;

import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockMovementResponse;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface StockMovementService {
    PageResponse<StockMovementResponse> getStockCard(Long productId, Long warehouseId, Long locationId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
}
