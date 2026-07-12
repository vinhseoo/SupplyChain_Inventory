package com.scim.service.impl;

import com.scim.dto.request.SupplierRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.SupplierResponse;
import com.scim.entity.Supplier;
import com.scim.exception.BusinessException;
import com.scim.exception.DuplicateResourceException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.SupplierMapper;
import com.scim.repository.SupplierRepository;
import com.scim.service.SupplierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SupplierResponse> getAll(String search, Pageable pageable) {
        Page<Supplier> page = supplierRepository.findWithFilters(search, null, pageable);
        List<SupplierResponse> content = supplierMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "suppliers", key = "#id")
    public SupplierResponse getById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional
    @CacheEvict(value = "suppliers", allEntries = true)
    public SupplierResponse create(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Supplier", "code", request.getCode());
        }
        Supplier supplier = supplierMapper.toEntity(request);
        if (request.getIsActive() != null) {
            supplier.setIsActive(request.getIsActive());
        }
        supplier = supplierRepository.save(supplier);
        log.info("Created supplier: {}", supplier.getCode());
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional
    @CacheEvict(value = "suppliers", key = "#id")
    public SupplierResponse update(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));

        if (supplierRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Supplier", "code", request.getCode());
        }

        supplierMapper.updateEntity(request, supplier);
        if (request.getIsActive() != null) {
            supplier.setIsActive(request.getIsActive());
        }
        supplier = supplierRepository.save(supplier);
        log.info("Updated supplier: {}", supplier.getCode());
        return supplierMapper.toResponse(supplier);
    }

    @Override
    @Transactional
    @CacheEvict(value = "suppliers", allEntries = true)
    public void delete(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", id));
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
        log.info("Soft deleted supplier: {}", supplier.getCode());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportToExcel(String search) {
        List<Supplier> suppliers = supplierRepository.findWithFilters(search, null, Pageable.unpaged()).getContent();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Suppliers");

            // Header Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Row 0: Headers
            String[] columns = {"ID", "Mã NCC", "Tên nhà cung cấp", "Người liên hệ", "Email", "Số điện thoại", "Mã số thuế", "Địa chỉ", "Trạng thái", "Ngày tạo"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Supplier supplier : suppliers) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(supplier.getId());
                row.createCell(1).setCellValue(supplier.getCode());
                row.createCell(2).setCellValue(supplier.getName());
                row.createCell(3).setCellValue(supplier.getContactName() != null ? supplier.getContactName() : "");
                row.createCell(4).setCellValue(supplier.getEmail() != null ? supplier.getEmail() : "");
                row.createCell(5).setCellValue(supplier.getPhone() != null ? supplier.getPhone() : "");
                row.createCell(6).setCellValue(supplier.getTaxCode() != null ? supplier.getTaxCode() : "");
                row.createCell(7).setCellValue(supplier.getAddress() != null ? supplier.getAddress() : "");
                row.createCell(8).setCellValue(Boolean.TRUE.equals(supplier.getIsActive()) ? "Hoạt động" : "Ngừng");
                row.createCell(9).setCellValue(supplier.getCreatedAt() != null ? supplier.getCreatedAt().toString() : "");
            }

            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Failed to export suppliers to Excel", e);
            throw new BusinessException("Không thể xuất danh sách nhà cung cấp ra Excel");
        }
    }
}
