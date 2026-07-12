package com.scim.service;

import com.scim.dto.request.ProductRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.ProductImportSummaryResponse;
import com.scim.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    PageResponse<ProductResponse> getAll(String search, Long categoryId, Long uomId, Pageable pageable);

    ProductResponse getById(Long id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);

    byte[] exportToExcel(String search, Long categoryId, Long uomId);

    ProductImportSummaryResponse importFromExcel(MultipartFile file);
}
