package com.scim.controller;

import com.scim.dto.role.request.RoleRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.role.response.RoleResponse;
import com.scim.service.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "APIs for role management and permission configurations")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @Operation(summary = "Get all roles paginated", description = "Retrieve a paginated list of roles with optional search filter")
    public ResponseEntity<ApiResponse<PageResponse<RoleResponse>>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(roleService.getAll(search, pageable)));
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active roles", description = "Retrieve list of all active roles for assignment dropdowns")
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllActive() {
        return ResponseEntity.ok(ApiResponse.ok(roleService.getAllActive()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role by ID", description = "Retrieve detailed information about a specific role by its ID")
    public ResponseEntity<ApiResponse<RoleResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(roleService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create role", description = "Create a new role with specific type (ALL/CUSTOM) and permissions mapping")
    public ResponseEntity<ApiResponse<RoleResponse>> create(@Valid @RequestBody RoleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(roleService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update role", description = "Update an existing role details, type, and permission mappings")
    public ResponseEntity<ApiResponse<RoleResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody RoleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(roleService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete role", description = "Soft delete a role from the system by marking it inactive")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }
}
