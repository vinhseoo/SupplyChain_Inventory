package com.scim.service;

import com.scim.dto.role.request.RoleRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.role.response.RoleResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoleService {
    PageResponse<RoleResponse> getAll(String search, Pageable pageable);
    List<RoleResponse> getAllActive();
    RoleResponse getById(Long id);
    RoleResponse create(RoleRequest request);
    RoleResponse update(Long id, RoleRequest request);
    void delete(Long id);
}
