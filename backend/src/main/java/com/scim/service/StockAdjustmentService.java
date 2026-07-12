package com.scim.service;

import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockAdjustmentResponse;
import com.scim.entity.StockAdjustmentStatus;
import org.springframework.data.domain.Pageable;

public interface StockAdjustmentService {
    PageResponse<StockAdjustmentResponse> getAll(String search, Long warehouseId, StockAdjustmentStatus status, Pageable pageable);
    StockAdjustmentResponse getById(Long id);
}
