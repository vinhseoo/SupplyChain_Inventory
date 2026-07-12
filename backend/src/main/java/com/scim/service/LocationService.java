package com.scim.service;

import com.scim.dto.request.LocationRequest;
import com.scim.dto.response.LocationNodeResponse;
import com.scim.dto.response.LocationResponse;

import java.util.List;

public interface LocationService {

    List<LocationResponse> getByWarehouseId(Long warehouseId);

    List<LocationNodeResponse> getWarehouseLocationTree(Long warehouseId);

    LocationResponse getById(Long id);

    LocationResponse create(LocationRequest request);

    LocationResponse update(Long id, LocationRequest request);

    void delete(Long id);
}
