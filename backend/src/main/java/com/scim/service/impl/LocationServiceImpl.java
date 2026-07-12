package com.scim.service.impl;

import com.scim.dto.request.LocationRequest;
import com.scim.dto.response.LocationNodeResponse;
import com.scim.dto.response.LocationResponse;
import com.scim.entity.Location;
import com.scim.entity.Warehouse;
import com.scim.exception.DuplicateResourceException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.LocationMapper;
import com.scim.repository.LocationRepository;
import com.scim.repository.WarehouseRepository;
import com.scim.service.LocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;
    private final WarehouseRepository warehouseRepository;
    private final LocationMapper locationMapper;

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getByWarehouseId(Long warehouseId) {
        List<Location> locations = locationRepository.findByWarehouseId(warehouseId);
        return locationMapper.toResponseList(locations);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationNodeResponse> getWarehouseLocationTree(Long warehouseId) {
        List<Location> allLocations = locationRepository.findByWarehouseId(warehouseId);
        
        List<LocationNodeResponse> allNodes = locationMapper.toNodeResponseList(allLocations);
        
        List<LocationNodeResponse> roots = allNodes.stream()
                .filter(node -> node.getParentId() == null)
                .collect(Collectors.toList());
                
        Map<Long, LocationNodeResponse> nodeMap = allNodes.stream()
                .collect(Collectors.toMap(LocationNodeResponse::getId, node -> node));
                
        for (LocationNodeResponse node : allNodes) {
            if (node.getParentId() != null) {
                LocationNodeResponse parentNode = nodeMap.get(node.getParentId());
                if (parentNode != null) {
                    parentNode.getChildren().add(node);
                }
            }
        }
        
        return roots;
    }

    @Override
    @Transactional(readOnly = true)
    public LocationResponse getById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", id));
        return locationMapper.toResponse(location);
    }

    @Override
    @Transactional
    public LocationResponse create(LocationRequest request) {
        if (locationRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Location", "code", request.getCode());
        }

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));

        Location parent = null;
        if (request.getParentId() != null) {
            parent = locationRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location", "parent id", request.getParentId()));
        }

        Location location = locationMapper.toEntity(request);
        location.setWarehouse(warehouse);
        location.setParent(parent);
        if (request.getIsActive() != null) {
            location.setIsActive(request.getIsActive());
        }

        location = locationRepository.save(location);
        log.info("Created location: {}", location.getCode());
        return locationMapper.toResponse(location);
    }

    @Override
    @Transactional
    public LocationResponse update(Long id, LocationRequest request) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", id));

        if (locationRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Location", "code", request.getCode());
        }

        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));

        Location parent = null;
        if (request.getParentId() != null) {
            if (request.getParentId().equals(id)) {
                throw new com.scim.exception.BusinessException("Vị trí cha không thể là chính nó.");
            }
            parent = locationRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location", "parent id", request.getParentId()));
        }

        locationMapper.updateEntity(request, location);
        location.setWarehouse(warehouse);
        location.setParent(parent);
        if (request.getIsActive() != null) {
            location.setIsActive(request.getIsActive());
        }

        location = locationRepository.save(location);
        log.info("Updated location: {}", location.getCode());
        return locationMapper.toResponse(location);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", id));
        
        softDeleteRecursive(location);
        log.info("Soft deleted location tree starting from: {}", location.getCode());
    }

    private void softDeleteRecursive(Location location) {
        location.setIsActive(false);
        locationRepository.save(location);
        
        List<Location> children = locationRepository.findByParentId(location.getId());
        for (Location child : children) {
            softDeleteRecursive(child);
        }
    }
}
