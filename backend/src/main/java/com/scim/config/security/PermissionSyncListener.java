package com.scim.config.security;

import com.scim.entity.Permission;
import com.scim.repository.PermissionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.*;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionSyncListener implements ApplicationListener<ApplicationReadyEvent> {

    private final RequestMappingHandlerMapping requestMappingHandlerMapping;
    private final PermissionRepository permissionRepository;

    @Value("${server.servlet.context-path:/api}")
    private String contextPath;

    @Override
    @Transactional
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("[PermissionSync] Starting API permissions synchronization with context-path: {}...", contextPath);
        try {
            Map<RequestMappingInfo, HandlerMethod> handlerMethods = requestMappingHandlerMapping.getHandlerMethods();
            List<Permission> scannedPermissions = new ArrayList<>();

            // Format context path to start with / and not end with /
            String formattedContext = contextPath;
            if (!formattedContext.startsWith("/")) {
                formattedContext = "/" + formattedContext;
            }
            if (formattedContext.endsWith("/")) {
                formattedContext = formattedContext.substring(0, formattedContext.length() - 1);
            }

            for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : handlerMethods.entrySet()) {
                RequestMappingInfo mappingInfo = entry.getKey();
                HandlerMethod handlerMethod = entry.getValue();

                // Extract API group (simple name of Controller class or Tag name)
                String apiGroup = handlerMethod.getBeanType().getSimpleName();
                Tag tagAnnotation = handlerMethod.getBeanType().getAnnotation(Tag.class);
                if (tagAnnotation != null && !tagAnnotation.name().isBlank()) {
                    apiGroup = tagAnnotation.name();
                }

                // Extract Description from Swagger @Operation summary
                String description = null;
                Operation operationAnnotation = handlerMethod.getMethodAnnotation(Operation.class);
                if (operationAnnotation != null && !operationAnnotation.summary().isBlank()) {
                    description = operationAnnotation.summary();
                } else {
                    description = "API: " + handlerMethod.getMethod().getName();
                }

                // Get paths/patterns
                Set<String> paths = Collections.emptySet();
                if (mappingInfo.getPathPatternsCondition() != null) {
                    paths = mappingInfo.getPathPatternsCondition().getPatternValues();
                } else if (mappingInfo.getPatternsCondition() != null) {
                    paths = mappingInfo.getPatternsCondition().getPatterns();
                }

                // Get HTTP Methods
                Set<RequestMethod> methods = mappingInfo.getMethodsCondition().getMethods();
                if (methods.isEmpty()) {
                    continue;
                }

                for (String path : paths) {
                    // Prepend context path if not already present
                    String fullPath = path;
                    if (!fullPath.startsWith(formattedContext)) {
                        fullPath = formattedContext + (fullPath.startsWith("/") ? fullPath : "/" + fullPath);
                    }

                    // Exclude authentication, system, and default authenticated endpoints
                    if (fullPath.startsWith(formattedContext + "/auth/") 
                            || fullPath.startsWith(formattedContext + "/error")
                            || fullPath.endsWith("/roles/active")
                            || fullPath.endsWith("/users/me")
                            || fullPath.endsWith("/users/change-password")
                            || fullPath.endsWith("/users/avatar")
                            || fullPath.contains("/actuator")
                            || fullPath.contains("/v3/api-docs")
                            || fullPath.contains("/swagger-ui")) {
                        continue;
                    }

                    for (RequestMethod method : methods) {
                        String name = method.name() + ":" + fullPath;
                        Permission permission = Permission.builder()
                                .name(name)
                                .path(fullPath)
                                .method(method.name())
                                .apiGroup(apiGroup)
                                .description(description)
                                .build();
                        scannedPermissions.add(permission);
                    }
                }
            }

            // Sync with DB
            List<Permission> existingPermissions = permissionRepository.findAll();
            Map<String, Permission> existingMap = existingPermissions.stream()
                    .collect(Collectors.toMap(Permission::getName, p -> p));

            List<Permission> toSave = new ArrayList<>();
            Set<String> scannedNames = new HashSet<>();

            for (Permission scanned : scannedPermissions) {
                scannedNames.add(scanned.getName());
                Permission existing = existingMap.get(scanned.getName());
                if (existing == null) {
                    toSave.add(scanned);
                } else {
                    boolean modified = false;
                    if (!Objects.equals(existing.getDescription(), scanned.getDescription())) {
                        existing.setDescription(scanned.getDescription());
                        modified = true;
                    }
                    if (!Objects.equals(existing.getApiGroup(), scanned.getApiGroup())) {
                        existing.setApiGroup(scanned.getApiGroup());
                        modified = true;
                    }
                    if (!Objects.equals(existing.getPath(), scanned.getPath())) {
                        existing.setPath(scanned.getPath());
                        modified = true;
                    }
                    if (!Objects.equals(existing.getMethod(), scanned.getMethod())) {
                        existing.setMethod(scanned.getMethod());
                        modified = true;
                    }
                    if (modified) {
                        toSave.add(existing);
                    }
                }
            }

            if (!toSave.isEmpty()) {
                permissionRepository.saveAll(toSave);
                log.info("[PermissionSync] Saved/Updated {} permissions in database.", toSave.size());
            }

            // Remove permissions that no longer exist in the controllers
            List<Permission> toDelete = existingPermissions.stream()
                    .filter(p -> !scannedNames.contains(p.getName()))
                    .toList();

            if (!toDelete.isEmpty()) {
                permissionRepository.deleteAll(toDelete);
                log.info("[PermissionSync] Deleted {} obsolete permissions from database.", toDelete.size());
            }

            log.info("[PermissionSync] API permissions synchronization completed. Total permissions: {}", scannedNames.size());
        } catch (Exception e) {
            log.error("[PermissionSync] Failed to synchronize API permissions: {}", e.getMessage(), e);
        }
    }
}
