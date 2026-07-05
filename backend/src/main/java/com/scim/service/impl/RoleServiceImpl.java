package com.scim.service.impl;

import com.scim.dto.role.request.RoleRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.permission.response.PermissionResponse;
import com.scim.dto.role.response.RoleResponse;
import com.scim.entity.Permission;
import com.scim.entity.Role;
import com.scim.entity.RolePermission;
import com.scim.entity.RoleType;
import com.scim.exception.DuplicateResourceException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.PermissionMapper;
import com.scim.mapper.RoleMapper;
import com.scim.repository.PermissionRepository;
import com.scim.repository.RolePermissionRepository;
import com.scim.repository.RoleRepository;
import com.scim.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final RoleMapper roleMapper;
    private final PermissionMapper permissionMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoleResponse> getAll(String search, Pageable pageable) {
        Page<Role> page = roleRepository.findWithFilters(search, null, pageable);
        List<RoleResponse> content = page.getContent().stream()
                .map(role -> {
                    List<PermissionResponse> permissions = getPermissionsForRole(role);
                    return roleMapper.toResponse(role, permissions);
                })
                .toList();
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> getAllActive() {
        return roleRepository.findAll().stream()
                .filter(Role::getIsActive)
                .map(role -> roleMapper.toResponse(role, getPermissionsForRole(role)))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponse getById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        List<PermissionResponse> permissions = getPermissionsForRole(role);
        return roleMapper.toResponse(role, permissions);
    }

    @Override
    @Transactional
    public RoleResponse create(RoleRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Role", "name", request.getName());
        }

        Role role = roleMapper.toEntity(request);
        role = roleRepository.save(role);

        List<PermissionResponse> permissions = new ArrayList<>();
        if (role.getType() == RoleType.CUSTOM && request.getPermissionIds() != null) {
            for (Long permId : request.getPermissionIds()) {
                Permission perm = permissionRepository.findById(permId)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", permId));
                RolePermission rp = RolePermission.builder().role(role).permission(perm).build();
                rolePermissionRepository.save(rp);
                permissions.add(permissionMapper.toResponse(perm));
            }
        } else if (role.getType() == RoleType.ALL) {
            permissions = permissionMapper.toResponseList(permissionRepository.findAll());
        }

        log.info("Created role: {}", role.getName());
        return roleMapper.toResponse(role, permissions);
    }

    @Override
    @Transactional
    public RoleResponse update(Long id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));

        roleMapper.updateEntity(request, role);
        role = roleRepository.save(role);

        rolePermissionRepository.deleteByRoleId(id);

        List<PermissionResponse> permissions = new ArrayList<>();
        if (role.getType() == RoleType.CUSTOM && request.getPermissionIds() != null) {
            for (Long permId : request.getPermissionIds()) {
                Permission perm = permissionRepository.findById(permId)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission", "id", permId));
                RolePermission rp = RolePermission.builder().role(role).permission(perm).build();
                rolePermissionRepository.save(rp);
                permissions.add(permissionMapper.toResponse(perm));
            }
        } else if (role.getType() == RoleType.ALL) {
            permissions = permissionMapper.toResponseList(permissionRepository.findAll());
        }

        log.info("Updated role: {}", role.getName());
        return roleMapper.toResponse(role, permissions);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "id", id));
        role.setIsActive(false);
        roleRepository.save(role);
        log.info("Deleted (soft) role: {}", role.getName());
    }

    private List<PermissionResponse> getPermissionsForRole(Role role) {
        if (role.getType() == RoleType.ALL) {
            return permissionMapper.toResponseList(permissionRepository.findAll());
        }
        List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleId(role.getId());
        return permissionMapper.toResponseList(
                rolePermissions.stream().map(RolePermission::getPermission).toList()
        );
    }
}
