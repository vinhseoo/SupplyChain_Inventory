---
name: backend-api
description: Skill để tạo REST API endpoint mới trong backend Spring Boot. Bao gồm Controller, DTO, Service, Repository theo kiến trúc Layered.
---

# Backend API — Tạo REST API Endpoint

## Quy trình tạo API endpoint mới

Khi cần tạo một API endpoint mới, LUÔN thực hiện theo thứ tự sau:

### Step 1: Database Migration (nếu cần)
- Tạo file `V{n}__{description}.sql` trong `src/main/resources/db/migration/`
- Kiểm tra version number tiếp theo (xem migration files hiện tại)
- Tạo table với đầy đủ audit fields: `created_at`, `updated_at`, `created_by`, `updated_by`, `version`
- Tạo indexes cho foreign keys và search columns

### Step 2: Entity
- Đặt trong `com.scim.entity`
- Extends `BaseEntity`
- Annotations bắt buộc: `@Entity`, `@Table(name = "table_name")`, `@Getter`, `@Setter`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`
- Dùng `@Column(name = "...")` cho tất cả fields
- FetchType.LAZY cho tất cả associations

```java
@Entity
@Table(name = "suppliers")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Supplier extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}
```

### Step 3: Request DTO
- Đặt trong `com.scim.dto.request`
- Naming: `XxxRequest`
- Dùng Jakarta Validation annotations

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierRequest {

    @NotBlank(message = "Supplier code is required")
    @Size(max = 50, message = "Supplier code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Supplier name is required")
    @Size(max = 200, message = "Supplier name must not exceed 200 characters")
    private String name;
}
```

### Step 4: Response DTO
- Đặt trong `com.scim.dto.response`
- Naming: `XxxResponse`

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierResponse {
    private Long id;
    private String code;
    private String name;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### Step 5: MapStruct Mapper
- Đặt trong `com.scim.mapper`
- Dùng `@Mapper(componentModel = "spring")`

```java
@Mapper(componentModel = "spring")
public interface SupplierMapper {
    SupplierResponse toResponse(Supplier entity);
    List<SupplierResponse> toResponseList(List<Supplier> entities);
    Supplier toEntity(SupplierRequest request);
    void updateEntity(SupplierRequest request, @MappingTarget Supplier entity);
}
```

### Step 6: Repository
- Đặt trong `com.scim.repository`
- Extends `JpaRepository<Entity, Long>`

```java
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByCode(String code);
    Page<Supplier> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Optional<Supplier> findByCode(String code);
}
```

### Step 7: Service Interface + Implementation
- Interface trong `com.scim.service`
- Implementation trong `com.scim.service.impl`

```java
// Interface
public interface SupplierService {
    PageResponse<SupplierResponse> getAll(String search, Pageable pageable);
    SupplierResponse getById(Long id);
    SupplierResponse create(SupplierRequest request);
    SupplierResponse update(Long id, SupplierRequest request);
    void delete(Long id);
}

// Implementation
@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    public SupplierResponse create(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Supplier", "code", request.getCode());
        }
        Supplier supplier = supplierMapper.toEntity(request);
        supplier = supplierRepository.save(supplier);
        log.info("Created supplier: {}", supplier.getCode());
        return supplierMapper.toResponse(supplier);
    }
}
```

### Step 8: Controller
- Đặt trong `com.scim.controller`
- Annotations: `@RestController`, `@RequestMapping`, `@RequiredArgsConstructor`, `@Tag` (Swagger)
- Mọi response PHẢI wrap trong `ApiResponse<T>`

```java
@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@Tag(name = "Suppliers", description = "Supplier management APIs")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    @Operation(summary = "Get all suppliers", description = "Get paginated list of suppliers")
    public ResponseEntity<ApiResponse<PageResponse<SupplierResponse>>> getAll(
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(supplierService.getAll(search, pageable)));
    }

    @PostMapping
    @Operation(summary = "Create supplier")
    public ResponseEntity<ApiResponse<SupplierResponse>> create(@Valid @RequestBody SupplierRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(supplierService.create(request)));
    }
}
```

## Checklist
- [ ] Migration file tạo đúng version
- [ ] Entity extends BaseEntity
- [ ] Request DTO có validation annotations
- [ ] Response DTO KHÔNG chứa sensitive data
- [ ] Mapper dùng MapStruct
- [ ] Repository có custom queries cần thiết
- [ ] Service có logging ở mức INFO cho write operations
- [ ] Controller wrap response trong ApiResponse
- [ ] Controller có Swagger annotations (@Tag, @Operation)
