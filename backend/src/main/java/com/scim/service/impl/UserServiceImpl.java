package com.scim.service.impl;

import com.scim.dto.user.request.ChangePasswordRequest;
import com.scim.dto.user.request.ResetPasswordRequest;
import com.scim.dto.user.request.UserCreateRequest;
import com.scim.dto.user.request.UserUpdateRequest;
import com.scim.dto.user.request.UserUpdateMeRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.user.response.UserResponse;
import com.scim.entity.*;
import com.scim.exception.BusinessException;
import com.scim.exception.DuplicateResourceException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.UserMapper;
import com.scim.repository.*;
import com.scim.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAll(String search, Pageable pageable) {
        Page<User> page = userRepository.findWithFilters(search, null, pageable);
        List<UserResponse> content = page.getContent().stream()
                .map(this::mapToUserResponse)
                .toList();
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse create(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("User", "email", request.getEmail());
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);

        // Security check: Only ADMIN can assign roles during creation
        if (request.getRoleIds() != null && !request.getRoleIds().isEmpty()) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_TYPE_ALL"));
            if (!isAdmin) {
                throw new com.scim.exception.BusinessException("Chỉ Quản trị viên mới có quyền gán vai trò khi tạo người dùng.");
            }
        }

        // Save Roles
        if (request.getRoleIds() != null) {
            for (Long roleId : request.getRoleIds()) {
                Role role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));
                UserRole ur = UserRole.builder().user(user).role(role).build();
                userRoleRepository.save(ur);
            }
        }

        log.info("Created user: {}", user.getEmail());
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        userMapper.updateEntity(request, user);
        user = userRepository.save(user);

        // Security check: Only ADMIN can change user roles
        boolean isChangeRolesAttempt = false;
        List<Long> currentRoleIds = userRoleRepository.findByUserId(id).stream()
                .map(ur -> ur.getRole().getId())
                .toList();
        List<Long> requestedRoleIds = request.getRoleIds();
        
        if (requestedRoleIds != null) {
            Set<Long> currentSet = new HashSet<>(currentRoleIds);
            Set<Long> requestedSet = new HashSet<>(requestedRoleIds);
            if (!currentSet.equals(requestedSet)) {
                isChangeRolesAttempt = true;
            }
        } else if (!currentRoleIds.isEmpty()) {
            isChangeRolesAttempt = true;
        }

        if (isChangeRolesAttempt) {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = auth != null && auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_TYPE_ALL"));
            if (!isAdmin) {
                throw new com.scim.exception.BusinessException("Chỉ Quản trị viên mới có quyền thay đổi vai trò của người dùng.");
            }
        }

        // Update Roles
        userRoleRepository.deleteByUserId(id);
        if (request.getRoleIds() != null) {
            for (Long roleId : request.getRoleIds()) {
                Role role = roleRepository.findById(roleId)
                        .orElseThrow(() -> new ResourceNotFoundException("Role", "id", roleId));
                UserRole ur = UserRole.builder().user(user).role(role).build();
                userRoleRepository.save(ur);
            }
        }

        log.info("Updated user: {}", user.getEmail());
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateMe(Long userId, UserUpdateMeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user = userRepository.save(user);

        log.info("User self-updated profile: {}", user.getEmail());
        return mapToUserResponse(user);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setIsActive(false);
        userRepository.save(user);
        log.info("Deleted (soft) user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new BusinessException("Mật khẩu cũ không chính xác");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(Long userId, ResetPasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password reset by administrator for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void updateAvatar(Long userId, String avatarUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        log.info("Avatar updated for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public UserResponse uploadAvatar(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        try {
            // Create uploads directory if not exists
            Path uploadPath = Paths.get("uploads/avatars");
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;

            // Copy file to destination
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Construct relative URL
            // Context path is /api, so it will be served under /api/uploads/avatars/filename
            String avatarUrl = "/api/uploads/avatars/" + filename;
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);

            log.info("Uploaded avatar for user {}: {}", user.getEmail(), avatarUrl);
            return mapToUserResponse(user);
        } catch (Exception e) {
            log.error("Failed to upload avatar", e);
            throw new BusinessException("Không thể tải lên ảnh đại diện: " + e.getMessage());
        }
    }

    private UserResponse mapToUserResponse(User user) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(user.getId());
        List<Role> roles = userRoles.stream()
                .map(UserRole::getRole)
                .filter(Role::getIsActive)
                .toList();

        List<String> roleNames = roles.stream().map(Role::getName).toList();
        List<String> permissionNames;

        boolean hasAllTypeRole = roles.stream()
                .anyMatch(r -> r.getType() == RoleType.ALL || r.getName().equalsIgnoreCase("ADMIN"));

        if (hasAllTypeRole) {
            permissionNames = permissionRepository.findAll().stream()
                    .map(Permission::getName)
                    .toList();
        } else {
            List<Long> roleIds = roles.stream().map(Role::getId).toList();
            if (roleIds.isEmpty()) {
                permissionNames = List.of();
            } else {
                List<RolePermission> rolePermissions = rolePermissionRepository.findByRoleIdIn(roleIds);
                permissionNames = rolePermissions.stream()
                        .map(RolePermission::getPermission)
                        .map(Permission::getName)
                        .distinct()
                        .toList();
            }
        }

        return userMapper.toResponse(user, roleNames, permissionNames);
    }
}
