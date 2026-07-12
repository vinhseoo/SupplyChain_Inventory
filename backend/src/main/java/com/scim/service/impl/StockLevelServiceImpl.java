package com.scim.service.impl;

import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockLevelResponse;
import com.scim.entity.StockLevel;
import com.scim.mapper.StockLevelMapper;
import com.scim.repository.StockLevelRepository;
import com.scim.service.StockLevelService;
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
public class StockLevelServiceImpl implements StockLevelService {

    private final StockLevelRepository stockLevelRepository;
    private final StockLevelMapper stockLevelMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StockLevelResponse> getAll(Long warehouseId, Long productId, Long locationId, String search, Pageable pageable) {
        Page<StockLevel> page = stockLevelRepository.findWithFilters(warehouseId, productId, locationId, search, pageable);
        List<StockLevelResponse> content = stockLevelMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }
}
