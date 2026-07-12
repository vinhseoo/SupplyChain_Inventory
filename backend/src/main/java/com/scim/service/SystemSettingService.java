package com.scim.service;

import com.scim.dto.request.SystemSettingRequest;
import com.scim.dto.response.SystemSettingResponse;

import java.util.List;

public interface SystemSettingService {
    List<SystemSettingResponse> getAll();
    SystemSettingResponse getByKey(String key);
    SystemSettingResponse update(String key, SystemSettingRequest request);
    String getValue(String key, String defaultValue);
    Integer getIntValue(String key, Integer defaultValue);
}
