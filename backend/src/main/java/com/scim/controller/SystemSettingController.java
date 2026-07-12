package com.scim.controller;

import com.scim.dto.request.SystemSettingRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.SystemSettingResponse;
import com.scim.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/system-settings")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "APIs for viewing and managing system configuration settings")
public class SystemSettingController {

    private final SystemSettingService systemSettingService;

    @GetMapping
    @Operation(summary = "Get all system settings", description = "Retrieve list of all key-value configurations in the system")
    public ResponseEntity<ApiResponse<List<SystemSettingResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(systemSettingService.getAll()));
    }

    @GetMapping("/{key}")
    @Operation(summary = "Get setting by key", description = "Retrieve details of a system setting by its configuration key")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> getByKey(@PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.ok(systemSettingService.getByKey(key)));
    }

    @PutMapping("/{key}")
    @Operation(summary = "Update system setting", description = "Update the configuration value of a specific system setting key")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> update(
            @PathVariable String key,
            @Valid @RequestBody SystemSettingRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(systemSettingService.update(key, request)));
    }
}
