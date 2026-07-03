---
name: backend-service
description: Skill để viết Service layer trong backend. Bao gồm patterns cho validation, business logic, transaction management, và pagination.
---

# Backend Service — Service Layer Pattern

## Cấu trúc chuẩn

### Service Interface
```java
public interface SupplierService {
    PageResponse<SupplierResponse> getAll(String search, Pageable pageable);
    SupplierResponse getById(Long id);
    SupplierResponse create(SupplierRequest request);
    SupplierResponse update(Long id, SupplierRequest request);
    void delete(Long id);
}
```

### Service Implementation
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupplierResponse> getAll(String search, Pageable pageable) {
        Page<Supplier> page;
        if (StringUtils.hasText(search)) {
            page = supplierRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            page = supplierRepository.findAll(pageable);
        }
        List<SupplierResponse> content = supplierMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional
    public SupplierResponse create(SupplierRequest request) {
        // 1. Validate uniqueness
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Supplier", "code", request.getCode());
        }

        // 2. Map & save
        Supplier supplier = supplierMapper.toEntity(request);
        supplier = supplierRepository.save(supplier);

        // 3. Log
        log.info("Created supplier: {}", supplier.getCode());

        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional
    public SupplierResponse update(Long id, SupplierRequest request) {
        // 1. Find existing
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        // 2. Validate uniqueness (nếu code thay đổi)
        if (!supplier.getCode().equals(request.getCode())
                && supplierRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Supplier", "code", request.getCode());
        }

        // 3. Update & save
        supplierMapper.updateEntity(request, supplier);
        supplier = supplierRepository.save(supplier);

        log.info("Updated supplier: {}", supplier.getCode());
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        // Soft delete
        supplier.setIsActive(false);
        supplierRepository.save(supplier);

        log.info("Deleted (soft) supplier: {}", supplier.getCode());
    }
}
```

## Rules
- `@Transactional(readOnly = true)` cho read operations
- `@Transactional` cho write operations
- Validate business rules TRƯỚC khi save
- Throw custom exceptions (KHÔNG return null)
- Log ở mức INFO cho write operations (create, update, delete)
- Dùng MapStruct cho entity ↔ DTO conversion
- Dùng `orElseThrow()` với `ResourceNotFoundException` khi findById
- Soft delete: set `isActive = false` thay vì xóa record
- Method body tối đa 30 dòng
