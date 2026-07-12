package com.scim.service.impl;

import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockAdjustmentResponse;
import com.scim.entity.StockAdjustment;
import com.scim.entity.StockAdjustmentStatus;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.StockAdjustmentMapper;
import com.scim.repository.StockAdjustmentRepository;
import com.scim.service.StockAdjustmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockAdjustmentServiceImpl implements StockAdjustmentService {

    private final StockAdjustmentRepository adjustmentRepository;
    private final StockAdjustmentMapper adjustmentMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockAdjustmentResponse> getAll(String search, Long warehouseId, StockAdjustmentStatus status, Pageable pageable) {
        Page<StockAdjustment> page = adjustmentRepository.findWithFilters(search, warehouseId, status, pageable);
        List<StockAdjustmentResponse> content = adjustmentMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public StockAdjustmentResponse getById(Long id) {
        StockAdjustment adjustment = adjustmentRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("StockAdjustment", "id", id));
        return adjustmentMapper.toResponse(adjustment);
    }
}
