package com.scim.service;

import com.scim.dto.permission.response.PermissionResponse;
import java.util.List;

public interface PermissionService {
    List<PermissionResponse> getAll();
}
