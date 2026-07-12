package com.scim.config;

import com.scim.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditLogService auditLogService;

    @Pointcut("execution(* com.scim.service.impl.*ServiceImpl.create*(..)) || " +
              "execution(* com.scim.service.impl.*ServiceImpl.update*(..)) || " +
              "execution(* com.scim.service.impl.*ServiceImpl.delete*(..)) || " +
              "execution(* com.scim.service.impl.*ServiceImpl.submit*(..)) || " +
              "execution(* com.scim.service.impl.*ServiceImpl.approve*(..)) || " +
              "execution(* com.scim.service.impl.*ServiceImpl.reject*(..)) || " +
              "execution(* com.scim.service.impl.*ServiceImpl.complete*(..)) || " +
              "execution(* com.scim.service.impl.*ServiceImpl.cancel*(..))")
    public void writeOperations() {}

    @AfterReturning(pointcut = "writeOperations()", returning = "result")
    public void logWriteActivity(JoinPoint joinPoint, Object result) {
        try {
            String methodName = joinPoint.getSignature().getName();
            String className = joinPoint.getTarget().getClass().getSimpleName();
            String entityName = className.replace("ServiceImpl", "");
            
            // Skip logging internal/system operations or AuditLog itself
            if ("AuditLog".equals(entityName) || "ActivityLog".equals(entityName)) {
                return;
            }

            String actionType = "";
            if (methodName.startsWith("create")) actionType = "Thêm mới";
            else if (methodName.startsWith("update")) actionType = "Cập nhật";
            else if (methodName.startsWith("delete")) actionType = "Xóa";
            else if (methodName.startsWith("submit")) actionType = "Gửi duyệt";
            else if (methodName.startsWith("approve")) actionType = "Phê duyệt";
            else if (methodName.startsWith("reject")) actionType = "Từ chối";
            else if (methodName.startsWith("complete")) actionType = "Hoàn tất";
            else if (methodName.startsWith("cancel")) actionType = "Hủy bỏ";
            else actionType = "Thực hiện thao tác trên";

            Long id = getEntityId(result);
            String code = getEntityCode(result);

            String detail = "";
            if (id != null) {
                detail += " (ID: " + id;
                if (code != null) {
                    detail += ", Mã: " + code;
                }
                detail += ")";
            } else {
                // If result is null or doesn't have ID, check first argument (usually ID or Request)
                Object[] args = joinPoint.getArgs();
                if (args != null && args.length > 0) {
                    detail += " (Tham số: " + args[0].toString() + ")";
                }
            }

            String description = String.format("%s %s%s", actionType, getEntityVnName(entityName), detail);
            auditLogService.logActivity(description);

            // For creates/updates/deletes, also log a data change record if ID is found
            if (id != null && ("create".equals(methodName) || "update".equals(methodName) || "delete".equals(methodName) || methodName.startsWith("create") || methodName.startsWith("update") || methodName.startsWith("delete"))) {
                String action = "CREATE";
                if (methodName.startsWith("update")) action = "UPDATE";
                else if (methodName.startsWith("delete")) action = "DELETE";

                auditLogService.logChange(entityName, id, action, null, result);
            }
        } catch (Exception e) {
            log.warn("Failed to log activity/change via Aspect: {}", e.getMessage());
        }
    }

    private Long getEntityId(Object result) {
        if (result == null) return null;
        try {
            Method getId = result.getClass().getMethod("id");
            Object idVal = getId.invoke(result);
            if (idVal instanceof Long) return (Long) idVal;
        } catch (Exception e) {
            try {
                Method getId = result.getClass().getMethod("getId");
                Object idVal = getId.invoke(result);
                if (idVal instanceof Long) return (Long) idVal;
            } catch (Exception ignored) {}
        }
        return null;
    }

    private String getEntityCode(Object result) {
        if (result == null) return null;
        try {
            Method getCode = result.getClass().getMethod("code");
            return (String) getCode.invoke(result);
        } catch (Exception e) {
            try {
                Method getCode = result.getClass().getMethod("getCode");
                return (String) getCode.invoke(result);
            } catch (Exception e2) {
                try {
                    Method getName = result.getClass().getMethod("name");
                    return (String) getName.invoke(result);
                } catch (Exception e3) {
                    try {
                        Method getName = result.getClass().getMethod("getName");
                        return (String) getName.invoke(result);
                    } catch (Exception ignored) {}
                }
            }
        }
        return null;
    }

    private String getEntityVnName(String entityName) {
        return switch (entityName) {
            case "Product" -> "Sản phẩm";
            case "Supplier" -> "Nhà cung cấp";
            case "Warehouse" -> "Kho hàng";
            case "Location" -> "Vị trí kệ";
            case "InventoryTransaction" -> "Phiếu giao dịch kho";
            case "StocktakeSession" -> "Đợt kiểm kê";
            case "StockAdjustment" -> "Phiếu điều chỉnh tồn";
            case "User" -> "Người dùng";
            case "Role" -> "Vai trò";
            case "SystemSetting" -> "Cấu hình hệ thống";
            default -> entityName;
        };
    }
}
