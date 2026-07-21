package com.scim.service;

import com.scim.dto.request.BarcodeScanRequest;
import com.scim.dto.request.StocktakeItemRequest;
import com.scim.dto.request.StocktakeSessionRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockAdjustmentResponse;
import com.scim.dto.response.StocktakeSessionResponse;
import com.scim.entity.StocktakeStatus;
import org.springframework.data.domain.Pageable;

public interface StocktakeSessionService {
    PageResponse<StocktakeSessionResponse> getAll(String search, Long warehouseId, StocktakeStatus status, Pageable pageable);
    StocktakeSessionResponse getById(Long id);
    StocktakeSessionResponse create(StocktakeSessionRequest request);
    StocktakeSessionResponse updateItemQty(Long id, Long itemId, StocktakeItemRequest request);
    StocktakeSessionResponse scanBarcode(Long id, BarcodeScanRequest request);
    StocktakeSessionResponse complete(Long id);
    StocktakeSessionResponse cancel(Long id);
    StocktakeSessionResponse deleteItem(Long id, Long itemId);
    StockAdjustmentResponse createAdjustment(Long id);
}
