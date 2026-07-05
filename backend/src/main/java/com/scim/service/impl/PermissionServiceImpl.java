package com.scim.service.impl;

import com.scim.dto.permission.response.PermissionResponse;
import com.scim.mapper.PermissionMapper;
import com.scim.repository.PermissionRepository;
import com.scim.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository permissionRepository;
    private final PermissionMapper permissionMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PermissionResponse> getAll() {
        return permissionMapper.toResponseList(permissionRepository.findAll());
    }
}
