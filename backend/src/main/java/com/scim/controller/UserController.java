package com.scim.controller;

import com.scim.dto.user.request.ChangePasswordRequest;
import com.scim.dto.user.request.ResetPasswordRequest;
import com.scim.dto.user.request.UserCreateRequest;
import com.scim.dto.user.request.UserUpdateRequest;
import com.scim.dto.user.request.UserUpdateMeRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.user.response.UserResponse;
import com.scim.entity.User;
import com.scim.exception.UnauthorizedException;
import com.scim.config.security.CustomUserDetails;
import com.scim.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "APIs for user profile management and administrative user configurations")
public class UserController {

    private final UserService userService;

    private CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new UnauthorizedException("Người dùng chưa được xác thực");
        }
        return (CustomUserDetails) authentication.getPrincipal();
    }

    @GetMapping
    @Operation(summary = "Get all users paginated", description = "Retrieve a paginated list of users with search filter")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAll(search, pageable)));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile", description = "Retrieve profile details of the currently authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> getMe() {
        CustomUserDetails userDetails = getCurrentUserDetails();
        return ResponseEntity.ok(ApiResponse.ok(userService.getById(userDetails.getUser().getId())));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile", description = "Allows the logged-in user to update their own full name and phone number")
    public ResponseEntity<ApiResponse<UserResponse>> updateMe(@Valid @RequestBody UserUpdateMeRequest request) {
        CustomUserDetails userDetails = getCurrentUserDetails();
        return ResponseEntity.ok(ApiResponse.ok(userService.updateMe(userDetails.getUser().getId(), request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieve detailed information about a specific user by their ID")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create user", description = "Create a new user account and map roles")
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(userService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Update user profile details and roles by administrator")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(userService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Soft delete a user from the system by marking them inactive")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change own password", description = "Allows the logged-in user to update their password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        CustomUserDetails userDetails = getCurrentUserDetails();
        userService.changePassword(userDetails.getUser().getId(), request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset user password", description = "Allows administrators to reset a user's password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request) {
        userService.resetPassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload own avatar image", description = "Upload and update the avatar image for the logged-in user")
    public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        CustomUserDetails userDetails = getCurrentUserDetails();
        return ResponseEntity.ok(ApiResponse.ok(userService.uploadAvatar(userDetails.getUser().getId(), file)));
    }
}
