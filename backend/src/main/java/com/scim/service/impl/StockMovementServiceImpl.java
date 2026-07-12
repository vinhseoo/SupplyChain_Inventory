package com.scim.service.impl;

import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockMovementResponse;
import com.scim.entity.StockMovement;
import com.scim.mapper.StockMovementMapper;
import com.scim.repository.StockMovementRepository;
import com.scim.service.StockMovementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockMovementServiceImpl implements StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final StockMovementMapper stockMovementMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockMovementResponse> getStockCard(Long productId, Long warehouseId, Long locationId, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<StockMovement> page = stockMovementRepository.findStockCard(productId, warehouseId, locationId, startDate, endDate, pageable);
        List<StockMovementResponse> content = stockMovementMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
