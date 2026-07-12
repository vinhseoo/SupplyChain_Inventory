package com.scim.service.impl;

import com.scim.dto.request.SystemSettingRequest;
import com.scim.dto.response.SystemSettingResponse;
import com.scim.entity.SystemSetting;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.SystemSettingMapper;
import com.scim.repository.SystemSettingRepository;
import com.scim.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingServiceImpl implements SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;
    private final SystemSettingMapper systemSettingMapper;
    private final com.scim.service.AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<SystemSettingResponse> getAll() {
        return systemSettingRepository.findAll().stream()
                .map(systemSettingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "settings", key = "#key")
    public SystemSettingResponse getByKey(String key) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemSetting", "key", key));
        return systemSettingMapper.toResponse(setting);
    }

    @Override
    @Transactional
    @CacheEvict(value = "settings", key = "#key")
    public SystemSettingResponse update(String key, SystemSettingRequest request) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemSetting", "key", key));
        
        String oldVal = setting.getSettingVal();
        setting.setSettingVal(request.settingVal());
        setting = systemSettingRepository.save(setting);
        
        // Log changes in audit and activity logs
        auditLogService.logChange("SystemSetting", setting.getId(), "UPDATE", oldVal, request.settingVal());
        auditLogService.logActivity(String.format("Cập nhật cấu hình hệ thống '%s' từ '%s' thành '%s'", key, oldVal, request.settingVal()));

        log.info("Updated system setting: {} to value: {}", key, request.settingVal());
        return systemSettingMapper.toResponse(setting);
    }

    @Override
    @Transactional(readOnly = true)
    public String getValue(String key, String defaultValue) {
        try {
            return systemSettingRepository.findBySettingKey(key)
                    .map(SystemSetting::getSettingVal)
                    .orElse(defaultValue);
        } catch (Exception e) {
            return defaultValue;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Integer getIntValue(String key, Integer defaultValue) {
        String val = getValue(key, null);
        if (val == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(val);
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }
}
