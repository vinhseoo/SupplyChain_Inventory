package com.scim.service.impl;

import com.scim.dto.request.ProductRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.ProductImportSummaryResponse;
import com.scim.dto.response.ProductResponse;
import com.scim.entity.Category;
import com.scim.entity.Product;
import com.scim.entity.UnitOfMeasure;
import com.scim.exception.BusinessException;
import com.scim.exception.DuplicateResourceException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.ProductMapper;
import com.scim.repository.CategoryRepository;
import com.scim.repository.ProductRepository;
import com.scim.repository.UnitOfMeasureRepository;
import com.scim.service.ProductService;
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
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UnitOfMeasureRepository uomRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getAll(String search, Long categoryId, Long uomId, Pageable pageable) {
        Page<Product> page = productRepository.findWithFilters(search, categoryId, uomId, null, pageable);
        List<ProductResponse> content = productMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductResponse create(ProductRequest request) {
        if (productRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Product", "code", request.getCode());
        }
        if (productRepository.existsBySku(request.getSku())) {
            throw new DuplicateResourceException("Product", "SKU", request.getSku());
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        UnitOfMeasure uom = null;
        if (request.getUomId() != null) {
            uom = uomRepository.findById(request.getUomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unit of Measure", "id", request.getUomId()));
        }

        Product product = productMapper.toEntity(request);
        product.setCategory(category);
        product.setUom(uom);
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        product = productRepository.save(product);
        log.info("Created product: {}", product.getSku());
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (productRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("Product", "code", request.getCode());
        }
        if (productRepository.existsBySkuAndIdNot(request.getSku(), id)) {
            throw new DuplicateResourceException("Product", "SKU", request.getSku());
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }

        UnitOfMeasure uom = null;
        if (request.getUomId() != null) {
            uom = uomRepository.findById(request.getUomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unit of Measure", "id", request.getUomId()));
        }

        productMapper.updateEntity(request, product);
        product.setCategory(category);
        product.setUom(uom);
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }

        product = productRepository.save(product);
        log.info("Updated product: {}", product.getSku());
        return productMapper.toResponse(product);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setIsActive(false);
        productRepository.save(product);
        log.info("Soft deleted product: {}", product.getSku());
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportToExcel(String search, Long categoryId, Long uomId) {
        List<Product> products = productRepository.findWithFilters(search, categoryId, uomId, null, Pageable.unpaged()).getContent();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Products");

            // Header Style
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            CellStyle headerCellStyle = workbook.createCellStyle();
            headerCellStyle.setFont(headerFont);
            headerCellStyle.setFillForegroundColor(IndexedColors.BLUE.getIndex());
            headerCellStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Row 0: Headers
            String[] columns = {"ID", "Mã sản phẩm", "Tên sản phẩm", "SKU", "Barcode", "Danh mục", "Đơn vị tính", "Giá bán", "Tồn tối thiểu", "Tồn tối đa", "Trạng thái"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerCellStyle);
            }

            int rowIdx = 1;
            for (Product product : products) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(product.getId());
                row.createCell(1).setCellValue(product.getCode());
                row.createCell(2).setCellValue(product.getName());
                row.createCell(3).setCellValue(product.getSku());
                row.createCell(4).setCellValue(product.getBarcode() != null ? product.getBarcode() : "");
                row.createCell(5).setCellValue(product.getCategory() != null ? product.getCategory().getName() : "");
                row.createCell(6).setCellValue(product.getUom() != null ? product.getUom().getName() : "");
                row.createCell(7).setCellValue(product.getPrice().doubleValue());
                row.createCell(8).setCellValue(product.getMinimumStock().doubleValue());
                row.createCell(9).setCellValue(product.getMaximumStock().doubleValue());
                row.createCell(10).setCellValue(Boolean.TRUE.equals(product.getIsActive()) ? "Hoạt động" : "Ngừng");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (IOException e) {
            log.error("Failed to export products to Excel", e);
            throw new BusinessException("Không thể xuất danh mục sản phẩm ra Excel");
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public ProductImportSummaryResponse importFromExcel(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("Vui lòng chọn file Excel để nhập");
        }

        int totalProcessed = 0;
        int totalSuccess = 0;
        int totalFailed = 0;
        List<String> errorDetails = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Skip Header row
            if (rows.hasNext()) {
                rows.next();
            }

            List<Product> productsToSave = new ArrayList<>();

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                totalProcessed++;

                // Minimum columns required: Code, Name, SKU
                Cell codeCell = currentRow.getCell(0);
                Cell nameCell = currentRow.getCell(1);
                Cell skuCell = currentRow.getCell(2);

                String code = getCellValueAsString(codeCell);
                String name = getCellValueAsString(nameCell);
                String sku = getCellValueAsString(skuCell);

                if (code.isEmpty() || name.isEmpty() || sku.isEmpty()) {
                    totalFailed++;
                    errorDetails.add("Dòng " + (currentRow.getRowNum() + 1) + ": Thiếu thông tin bắt buộc (Mã, Tên, hoặc SKU).");
                    continue;
                }

                if (productRepository.existsByCode(code)) {
                    totalFailed++;
                    errorDetails.add("Dòng " + (currentRow.getRowNum() + 1) + ": Mã sản phẩm '" + code + "' đã tồn tại.");
                    continue;
                }

                if (productRepository.existsBySku(sku)) {
                    totalFailed++;
                    errorDetails.add("Dòng " + (currentRow.getRowNum() + 1) + ": SKU '" + sku + "' đã tồn tại.");
                    continue;
                }

                String barcode = getCellValueAsString(currentRow.getCell(3));
                String categoryCode = getCellValueAsString(currentRow.getCell(4));
                String uomCode = getCellValueAsString(currentRow.getCell(5));
                BigDecimal price = getCellValueAsBigDecimal(currentRow.getCell(6));
                BigDecimal minStock = getCellValueAsBigDecimal(currentRow.getCell(7));
                BigDecimal maxStock = getCellValueAsBigDecimal(currentRow.getCell(8));
                String description = getCellValueAsString(currentRow.getCell(9));

                Category category = null;
                if (!categoryCode.isEmpty()) {
                    Optional<Category> catOpt = categoryRepository.findByCode(categoryCode);
                    if (catOpt.isPresent()) {
                        category = catOpt.get();
                    } else {
                        totalFailed++;
                        errorDetails.add("Dòng " + (currentRow.getRowNum() + 1) + ": Mã danh mục '" + categoryCode + "' không tồn tại.");
                        continue;
                    }
                }

                UnitOfMeasure uom = null;
                if (!uomCode.isEmpty()) {
                    Optional<UnitOfMeasure> uomOpt = uomRepository.findByCode(uomCode);
                    if (uomOpt.isPresent()) {
                        uom = uomOpt.get();
                    } else {
                        totalFailed++;
                        errorDetails.add("Dòng " + (currentRow.getRowNum() + 1) + ": Mã ĐVT '" + uomCode + "' không tồn tại.");
                        continue;
                    }
                }

                Product product = Product.builder()
                        .code(code)
                        .name(name)
                        .sku(sku)
                        .barcode(barcode.isEmpty() ? null : barcode)
                        .category(category)
                        .uom(uom)
                        .price(price)
                        .minimumStock(minStock)
                        .maximumStock(maxStock)
                        .description(description)
                        .isActive(true)
                        .build();

                productsToSave.add(product);
                totalSuccess++;
            }

            if (!productsToSave.isEmpty()) {
                productRepository.saveAll(productsToSave);
                log.info("Batch imported {} products via Excel upload.", productsToSave.size());
            }

        } catch (Exception e) {
            log.error("Failed to import products from Excel file", e);
            throw new BusinessException("Lỗi đọc file Excel: " + e.getMessage());
        }

        return ProductImportSummaryResponse.builder()
                .totalProcessed(totalProcessed)
                .totalSuccess(totalSuccess)
                .totalFailed(totalFailed)
                .errorDetails(errorDetails)
                .build();
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double val = cell.getNumericCellValue();
                if (val == (long) val) {
                    return String.valueOf((long) val);
                }
                return String.valueOf(val);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return BigDecimal.ZERO;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                String val = cell.getStringCellValue().trim();
                return val.isEmpty() ? BigDecimal.ZERO : new BigDecimal(val);
            } else if (cell.getCellType() == CellType.FORMULA) {
                return BigDecimal.valueOf(cell.getNumericCellValue());
            }
        } catch (Exception e) {
            log.warn("Failed to parse cell value as BigDecimal", e);
        }
        return BigDecimal.ZERO;
    }
}
