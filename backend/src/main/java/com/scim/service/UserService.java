package com.scim.service;

import com.scim.dto.user.request.ChangePasswordRequest;
import com.scim.dto.user.request.ResetPasswordRequest;
import com.scim.dto.user.request.UserCreateRequest;
import com.scim.dto.user.request.UserUpdateRequest;
import com.scim.dto.user.request.UserUpdateMeRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.user.response.UserResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    PageResponse<UserResponse> getAll(String search, Pageable pageable);
    UserResponse getById(Long id);
    UserResponse create(UserCreateRequest request);
    UserResponse update(Long id, UserUpdateRequest request);
    UserResponse updateMe(Long userId, UserUpdateMeRequest request);
    void delete(Long id);
    void changePassword(Long userId, ChangePasswordRequest request);
    void resetPassword(Long userId, ResetPasswordRequest request);
    void updateAvatar(Long userId, String avatarUrl);
    UserResponse uploadAvatar(Long userId, MultipartFile file);
}
