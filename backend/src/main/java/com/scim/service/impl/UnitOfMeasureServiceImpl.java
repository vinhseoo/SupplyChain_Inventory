package com.scim.service.impl;

import com.scim.dto.request.UnitOfMeasureRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.UnitOfMeasureResponse;
import com.scim.entity.UnitOfMeasure;
import com.scim.exception.DuplicateResourceException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.UnitOfMeasureMapper;
import com.scim.repository.UnitOfMeasureRepository;
import com.scim.service.UnitOfMeasureService;
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
public class UnitOfMeasureServiceImpl implements UnitOfMeasureService {

    private final UnitOfMeasureRepository uomRepository;
    private final UnitOfMeasureMapper uomMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UnitOfMeasureResponse> getAll(String search, Pageable pageable) {
        Page<UnitOfMeasure> page = uomRepository.findWithFilters(search, null, pageable);
        List<UnitOfMeasureResponse> content = uomMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public UnitOfMeasureResponse getById(Long id) {
        UnitOfMeasure uom = uomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit of Measure", "id", id));
        return uomMapper.toResponse(uom);
    }

    @Override
    @Transactional
    public UnitOfMeasureResponse create(UnitOfMeasureRequest request) {
        if (uomRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Unit of Measure", "code", request.getCode());
        }
        UnitOfMeasure uom = uomMapper.toEntity(request);
        if (request.getIsActive() != null) {
            uom.setIsActive(request.getIsActive());
        }
        uom = uomRepository.save(uom);
        log.info("Created unit of measure: {}", uom.getCode());
        return uomMapper.toResponse(uom);
    }

    @Override
    @Transactional
    public UnitOfMeasureResponse update(Long id, UnitOfMeasureRequest request) {
        UnitOfMeasure uom = uomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit of Measure", "id", id));

        if (uomRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Unit of Measure", "code", request.getCode());
        }

        uomMapper.updateEntity(request, uom);
        if (request.getIsActive() != null) {
            uom.setIsActive(request.getIsActive());
        }
        uom = uomRepository.save(uom);
        log.info("Updated unit of measure: {}", uom.getCode());
        return uomMapper.toResponse(uom);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        UnitOfMeasure uom = uomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Unit of Measure", "id", id));
        uom.setIsActive(false);
        uomRepository.save(uom);
        log.info("Soft deleted unit of measure: {}", uom.getCode());
    }
}
