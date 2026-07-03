---
name: backend-exception
description: Skill để tạo và xử lý custom exceptions trong backend SCIM.
---

# Backend Exception — Error Handling Pattern

## Exception Hierarchy

```
RuntimeException
├── ResourceNotFoundException     (404)
├── DuplicateResourceException    (409)
├── BusinessException             (400)
├── InsufficientStockException    (422)
└── UnauthorizedException         (401)
```

## Khi nào dùng exception nào

| Exception | Khi nào | Ví dụ |
|---|---|---|
| `ResourceNotFoundException` | Tìm entity by ID nhưng không thấy | `findById(id).orElseThrow(...)` |
| `DuplicateResourceException` | Tạo entity với unique field đã tồn tại | `existsByCode(code)` |
| `BusinessException` | Vi phạm business rule | Phiếu đã duyệt không được sửa |
| `InsufficientStockException` | Xuất kho nhưng không đủ tồn | Stock < requested quantity |
| `UnauthorizedException` | Token expired, invalid credentials | JWT validation fail |

## Cách tạo exception mới

```java
package com.scim.exception;

public class NewCustomException extends RuntimeException {
    public NewCustomException(String message) {
        super(message);
    }
}
```

Sau đó thêm handler vào `GlobalExceptionHandler`:

```java
@ExceptionHandler(NewCustomException.class)
public ResponseEntity<ApiResponse<Void>> handleNewCustom(NewCustomException ex) {
    log.warn("Custom error: {}", ex.getMessage());
    return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(ex.getMessage()));
}
```

## Rules
- KHÔNG catch exception rồi return null
- KHÔNG throw generic `RuntimeException` — dùng custom exception phù hợp
- Log level WARN cho business exceptions, ERROR cho system exceptions
- Response luôn qua `ApiResponse.error()` format
