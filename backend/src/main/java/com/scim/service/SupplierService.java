package com.scim.service;

import com.scim.dto.request.SupplierRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.SupplierResponse;
import org.springframework.data.domain.Pageable;

public interface SupplierService {

    PageResponse<SupplierResponse> getAll(String search, Pageable pageable);

    SupplierResponse getById(Long id);

    SupplierResponse create(SupplierRequest request);

    SupplierResponse update(Long id, SupplierRequest request);

    void delete(Long id);

    byte[] exportToExcel(String search);
}
