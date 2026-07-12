package com.scim.service;

import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockLevelResponse;
import org.springframework.data.domain.Pageable;

public interface StockLevelService {
    PageResponse<StockLevelResponse> getAll(Long warehouseId, Long productId, Long locationId, String search, Pageable pageable);
}
