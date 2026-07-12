package com.scim.service;

import com.scim.dto.request.UnitOfMeasureRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.UnitOfMeasureResponse;
import org.springframework.data.domain.Pageable;

public interface UnitOfMeasureService {

    PageResponse<UnitOfMeasureResponse> getAll(String search, Pageable pageable);

    UnitOfMeasureResponse getById(Long id);

    UnitOfMeasureResponse create(UnitOfMeasureRequest request);

    UnitOfMeasureResponse update(Long id, UnitOfMeasureRequest request);

    void delete(Long id);
}
