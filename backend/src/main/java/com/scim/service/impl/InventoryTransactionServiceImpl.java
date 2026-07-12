package com.scim.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.scim.dto.request.InventoryTransactionRequest;
import com.scim.dto.request.TransactionItemRequest;
import com.scim.dto.response.InventoryTransactionResponse;
import com.scim.dto.response.StockLevelResponse;
import com.scim.entity.*;
import com.scim.exception.BusinessException;
import com.scim.exception.DuplicateResourceException;
import com.scim.exception.InsufficientStockException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.InventoryTransactionMapper;
import com.scim.mapper.StockLevelMapper;
import com.scim.repository.*;
import com.scim.service.InventoryTransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.context.ApplicationEventPublisher;
import com.scim.event.TransactionStatusEvent;
import com.scim.event.StockChangeEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryTransactionServiceImpl implements InventoryTransactionService {

    private final InventoryTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final LocationRepository locationRepository;
    private final SupplierRepository supplierRepository;
    private final ProductBatchRepository productBatchRepository;
    private final StockLevelRepository stockLevelRepository;
    private final StockMovementRepository stockMovementRepository;
    private final InventoryTransactionMapper transactionMapper;
    private final StockLevelMapper stockLevelMapper;
    private final StringRedisTemplate redisTemplate;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryTransactionResponse> getAll(String search, TransactionType type, TransactionStatus status,
                                                     LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Page<InventoryTransaction> page = transactionRepository.findWithFilters(search, type, status, startDate, endDate, pageable);
        return page.map(transactionMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryTransactionResponse getById(Long id) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));
        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional
    public InventoryTransactionResponse create(InventoryTransactionRequest request) {
        if (transactionRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("InventoryTransaction", "code", request.getCode());
        }

        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setCode(request.getCode());
        transaction.setType(request.getType());
        transaction.setStatus(TransactionStatus.DRAFT);
        transaction.setNote(request.getNote());
        transaction.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now());

        mapRelations(request, transaction);
        mapItems(request.getItems(), transaction);
        calculateTotalAmount(transaction);

        transaction = transactionRepository.save(transaction);
        log.info("Created transaction: {} of type {}", transaction.getCode(), transaction.getType());
        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional
    public InventoryTransactionResponse update(Long id, InventoryTransactionRequest request) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));

        if (transaction.getStatus() != TransactionStatus.DRAFT && transaction.getStatus() != TransactionStatus.PENDING) {
            throw new BusinessException("Chỉ được sửa phiếu ở trạng thái DRAFT hoặc PENDING");
        }

        if (transactionRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new DuplicateResourceException("InventoryTransaction", "code", request.getCode());
        }

        transaction.setCode(request.getCode());
        transaction.setNote(request.getNote());
        transaction.setTransactionDate(request.getTransactionDate() != null ? request.getTransactionDate() : LocalDateTime.now());

        mapRelations(request, transaction);
        transaction.getItems().clear();
        mapItems(request.getItems(), transaction);
        calculateTotalAmount(transaction);

        transaction = transactionRepository.save(transaction);
        log.info("Updated transaction: {}", transaction.getCode());
        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));

        if (transaction.getStatus() != TransactionStatus.DRAFT) {
            throw new BusinessException("Chỉ được xóa phiếu ở trạng thái DRAFT");
        }

        transactionRepository.delete(transaction);
        log.info("Deleted transaction: {}", transaction.getCode());
    }

    @Override
    @Transactional
    public InventoryTransactionResponse submit(Long id) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));

        if (transaction.getStatus() != TransactionStatus.DRAFT) {
            throw new BusinessException("Chỉ được gửi duyệt phiếu ở trạng thái DRAFT");
        }

        transaction.setStatus(TransactionStatus.PENDING);
        transaction = transactionRepository.save(transaction);
        eventPublisher.publishEvent(new TransactionStatusEvent(this, transaction));
        log.info("Submitted transaction for approval: {}", transaction.getCode());
        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional
    public InventoryTransactionResponse approve(Long id) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new BusinessException("Chỉ được duyệt phiếu ở trạng thái PENDING");
        }

        transaction.setStatus(TransactionStatus.APPROVED);
        transaction = transactionRepository.save(transaction);
        eventPublisher.publishEvent(new TransactionStatusEvent(this, transaction));
        log.info("Approved transaction: {}", transaction.getCode());
        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional
    public InventoryTransactionResponse reject(Long id, String reason) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));

        if (transaction.getStatus() != TransactionStatus.PENDING) {
            throw new BusinessException("Chỉ được từ chối phiếu ở trạng thái PENDING");
        }

        transaction.setStatus(TransactionStatus.CANCELLED);
        if (reason != null && !reason.trim().isEmpty()) {
            transaction.setNote(transaction.getNote() != null ? transaction.getNote() + " | Lý do từ chối: " + reason : "Lý do từ chối: " + reason);
        }
        transaction = transactionRepository.save(transaction);
        eventPublisher.publishEvent(new TransactionStatusEvent(this, transaction));
        log.info("Rejected transaction: {}", transaction.getCode());
        return transactionMapper.toResponse(transaction);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public InventoryTransactionResponse complete(Long id) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));

        if (transaction.getStatus() != TransactionStatus.APPROVED) {
            throw new BusinessException("Chỉ được hoàn thành phiếu ở trạng thái APPROVED");
        }

        // Distributed lock sorting to prevent deadlocks
        List<Long> productIds = transaction.getItems().stream()
                .map(item -> item.getProduct().getId())
                .distinct()
                .sorted()
                .toList();

        List<String> lockedKeys = new ArrayList<>();
        try {
            for (Long pId : productIds) {
                String lockKey = "lock:product:" + pId;
                Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "locked", Duration.ofSeconds(15));
                if (Boolean.FALSE.equals(acquired)) {
                    throw new BusinessException("Hệ thống đang bận xử lý một trong các sản phẩm, vui lòng thử lại sau.");
                }
                lockedKeys.add(lockKey);
            }

            // Execute actual stock movements
            if (transaction.getType() == TransactionType.INBOUND) {
                executeInbound(transaction);
            } else if (transaction.getType() == TransactionType.OUTBOUND) {
                executeOutbound(transaction);
            } else if (transaction.getType() == TransactionType.TRANSFER) {
                executeTransfer(transaction);
            }

            transaction.setStatus(TransactionStatus.COMPLETED);
            transaction = transactionRepository.save(transaction);
            
            // Publish status updates
            eventPublisher.publishEvent(new TransactionStatusEvent(this, transaction));
            
            // Publish StockChangeEvents
            transaction.getItems().stream()
                    .map(TransactionItem::getProduct)
                    .distinct()
                    .forEach(product -> eventPublisher.publishEvent(
                            new StockChangeEvent(this, product.getId(), product.getSku(), product.getName())
                    ));

            log.info("Completed transaction and updated stock: {}", transaction.getCode());
            return transactionMapper.toResponse(transaction);

        } finally {
            for (String lockKey : lockedKeys) {
                redisTemplate.delete(lockKey);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<StockLevelResponse> suggestOutbound(Long productId, Long warehouseId, BigDecimal quantity, String strategy) {
        List<StockLevel> availableStock;
        if ("FIFO".equalsIgnoreCase(strategy)) {
            availableStock = stockLevelRepository.findAvailableStockFIFO(productId, warehouseId);
        } else {
            // FEFO is default
            availableStock = stockLevelRepository.findAvailableStockFEFO(productId, warehouseId);
        }

        List<StockLevel> suggestions = new ArrayList<>();
        BigDecimal needed = quantity;

        for (StockLevel stock : availableStock) {
            if (needed.compareTo(BigDecimal.ZERO) <= 0) {
                break;
            }
            BigDecimal availableQty = stock.getQuantity().subtract(stock.getReservedQuantity());
            if (availableQty.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal take = availableQty.min(needed);
                StockLevel copy = StockLevel.builder()
                        .product(stock.getProduct())
                        .warehouse(stock.getWarehouse())
                        .location(stock.getLocation())
                        .batch(stock.getBatch())
                        .quantity(take)
                        .reservedQuantity(stock.getReservedQuantity())
                        .build();
                copy.setId(stock.getId());
                suggestions.add(copy);
                needed = needed.subtract(take);
            }
        }

        return stockLevelMapper.toResponseList(suggestions);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generatePdf(Long id) {
        InventoryTransaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("InventoryTransaction", "id", id));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);
            document.open();

            // Font Settings
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            // Header Section
            Paragraph title = new Paragraph("PHIEU GIAO DICH KHO", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Metadata info
            document.add(new Paragraph("Ma giao dich: " + transaction.getCode(), boldFont));
            document.add(new Paragraph("Loai giao dich: " + transaction.getType().name(), normalFont));
            document.add(new Paragraph("Trang thai: " + transaction.getStatus().name(), normalFont));
            document.add(new Paragraph("Ngay lap phieu: " + transaction.getTransactionDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")), normalFont));

            if (transaction.getSourceWarehouse() != null) {
                document.add(new Paragraph("Kho xuat: " + transaction.getSourceWarehouse().getName() + " (" + transaction.getSourceWarehouse().getCode() + ")", normalFont));
            }
            if (transaction.getDestinationWarehouse() != null) {
                document.add(new Paragraph("Kho nhap: " + transaction.getDestinationWarehouse().getName() + " (" + transaction.getDestinationWarehouse().getCode() + ")", normalFont));
            }
            if (transaction.getSupplier() != null) {
                document.add(new Paragraph("Nha cung cap: " + transaction.getSupplier().getName(), normalFont));
            }
            if (transaction.getNote() != null) {
                document.add(new Paragraph("Ghi chu: " + transaction.getNote(), normalFont));
            }

            Paragraph spacing = new Paragraph(" ");
            spacing.setSpacingAfter(15);
            document.add(spacing);

            // Items Table
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1f, 3f, 1.5f, 1.5f, 1.5f, 2f});

            // Headers
            String[] headers = {"STT", "Ten san pham", "So luong", "Don gia", "Thanh tien", "So lo"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, boldFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cell);
            }

            int count = 1;
            for (TransactionItem item : transaction.getItems()) {
                table.addCell(new PdfPCell(new Phrase(String.valueOf(count++), normalFont)));
                table.addCell(new PdfPCell(new Phrase(item.getProduct().getName(), normalFont)));
                table.addCell(new PdfPCell(new Phrase(item.getQuantity().toString(), normalFont)));
                table.addCell(new PdfPCell(new Phrase(item.getPrice().toString(), normalFont)));
                BigDecimal amount = item.getQuantity().multiply(item.getPrice());
                table.addCell(new PdfPCell(new Phrase(amount.toString(), normalFont)));
                table.addCell(new PdfPCell(new Phrase(item.getBatchNumber() != null ? item.getBatchNumber() : "", normalFont)));
            }

            document.add(table);

            // Total Section
            Paragraph total = new Paragraph("Tong gia tri: " + transaction.getTotalAmount().toString() + " VND", boldFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            total.setSpacingBefore(15);
            document.add(total);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF for transaction: {}", transaction.getCode(), e);
            throw new BusinessException("Khong the in phieu giao dich kho ra PDF");
        }
    }

    private void executeInbound(InventoryTransaction transaction) {
        Warehouse destWarehouse = transaction.getDestinationWarehouse();
        if (destWarehouse == null) {
            throw new BusinessException("Giao dịch nhập kho yêu cầu Kho nhập");
        }

        for (TransactionItem item : transaction.getItems()) {
            Product product = item.getProduct();
            Location destLocation = item.getDestinationLocation();
            if (destLocation == null) {
                throw new BusinessException("Sản phẩm " + product.getCode() + " yêu cầu vị trí nhập cụ thể");
            }

            ProductBatch batch = null;
            if (item.getBatchNumber() != null && !item.getBatchNumber().trim().isEmpty()) {
                batch = productBatchRepository.findByProductIdAndBatchNumber(product.getId(), item.getBatchNumber().trim())
                        .orElse(null);

                if (batch != null) {
                    batch.setQuantity(batch.getQuantity().add(item.getQuantity()));
                    batch.setRemainingQuantity(batch.getRemainingQuantity().add(item.getQuantity()));
                    batch.setCostPrice(item.getPrice());
                } else {
                    batch = ProductBatch.builder()
                            .product(product)
                            .batchNumber(item.getBatchNumber().trim())
                            .supplier(transaction.getSupplier())
                            .productionDate(item.getProductionDate())
                            .expiryDate(item.getExpiryDate())
                            .quantity(item.getQuantity())
                            .remainingQuantity(item.getQuantity())
                            .costPrice(item.getPrice())
                            .build();
                }
                batch = productBatchRepository.save(batch);
            }

            StockLevel stockLevel = stockLevelRepository.findStockLevel(
                    product.getId(), destWarehouse.getId(), destLocation.getId(),
                    batch != null ? batch.getId() : null).orElse(null);

            BigDecimal beforeQty = BigDecimal.ZERO;
            if (stockLevel != null) {
                beforeQty = stockLevel.getQuantity();
                stockLevel.setQuantity(stockLevel.getQuantity().add(item.getQuantity()));
            } else {
                stockLevel = StockLevel.builder()
                        .product(product)
                        .warehouse(destWarehouse)
                        .location(destLocation)
                        .batch(batch)
                        .quantity(item.getQuantity())
                        .reservedQuantity(BigDecimal.ZERO)
                        .build();
            }
            stockLevelRepository.save(stockLevel);

            // Log stock movement
            StockMovement movement = StockMovement.builder()
                    .product(product)
                    .warehouse(destWarehouse)
                    .location(destLocation)
                    .batch(batch)
                    .transaction(transaction)
                    .type(StockMovementType.INBOUND)
                    .quantity(item.getQuantity())
                    .balanceBefore(beforeQty)
                    .balanceAfter(beforeQty.add(item.getQuantity()))
                    .build();
            stockMovementRepository.save(movement);

            // Calculate WAC
            BigDecimal totalStock = stockLevelRepository.getTotalStockByProduct(product.getId()).orElse(BigDecimal.ZERO);
            BigDecimal currentPrice = product.getPrice();
            BigDecimal oldStock = totalStock.subtract(item.getQuantity());

            if (oldStock.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal oldTotalValue = oldStock.multiply(currentPrice);
                BigDecimal newTotalValue = oldTotalValue.add(item.getQuantity().multiply(item.getPrice()));
                BigDecimal newWac = newTotalValue.divide(totalStock, 4, RoundingMode.HALF_UP);
                product.setPrice(newWac);
            } else {
                product.setPrice(item.getPrice());
            }
            productRepository.save(product);
        }
    }

    private void executeOutbound(InventoryTransaction transaction) {
        Warehouse srcWarehouse = transaction.getSourceWarehouse();
        if (srcWarehouse == null) {
            throw new BusinessException("Giao dịch xuất kho yêu cầu Kho xuất");
        }

        for (TransactionItem item : transaction.getItems()) {
            Product product = item.getProduct();
            Location srcLocation = item.getSourceLocation();
            if (srcLocation == null) {
                throw new BusinessException("Sản phẩm " + product.getCode() + " yêu cầu vị trí xuất cụ thể");
            }

            ProductBatch batch = null;
            if (item.getBatchNumber() != null && !item.getBatchNumber().trim().isEmpty()) {
                batch = productBatchRepository.findByProductIdAndBatchNumber(product.getId(), item.getBatchNumber().trim())
                        .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "batchNumber", item.getBatchNumber()));
            }

            StockLevel stockLevel = stockLevelRepository.findStockLevel(
                    product.getId(), srcWarehouse.getId(), srcLocation.getId(),
                    batch != null ? batch.getId() : null)
                    .orElseThrow(() -> new InsufficientStockException("Không tìm thấy số dư kho khớp với yêu cầu xuất"));

            BigDecimal availableQty = stockLevel.getQuantity().subtract(stockLevel.getReservedQuantity());
            if (availableQty.compareTo(item.getQuantity()) < 0) {
                throw new InsufficientStockException(
                        String.format("Không đủ tồn kho khả dụng tại vị trí %s. Yêu cầu: %s, Khả dụng: %s",
                                srcLocation.getName(), item.getQuantity(), availableQty)
                );
            }

            BigDecimal beforeQty = stockLevel.getQuantity();
            stockLevel.setQuantity(stockLevel.getQuantity().subtract(item.getQuantity()));
            stockLevelRepository.save(stockLevel);

            if (batch != null) {
                if (batch.getRemainingQuantity().compareTo(item.getQuantity()) < 0) {
                    throw new InsufficientStockException(
                            String.format("Lô hàng %s không đủ số lượng tồn khả dụng. Yêu cầu: %s, Khả dụng: %s",
                                    batch.getBatchNumber(), item.getQuantity(), batch.getRemainingQuantity())
                    );
                }
                batch.setRemainingQuantity(batch.getRemainingQuantity().subtract(item.getQuantity()));
                productBatchRepository.save(batch);
            }

            // Log stock movement
            StockMovement movement = StockMovement.builder()
                    .product(product)
                    .warehouse(srcWarehouse)
                    .location(srcLocation)
                    .batch(batch)
                    .transaction(transaction)
                    .type(StockMovementType.OUTBOUND)
                    .quantity(item.getQuantity().negate())
                    .balanceBefore(beforeQty)
                    .balanceAfter(beforeQty.subtract(item.getQuantity()))
                    .build();
            stockMovementRepository.save(movement);
        }
    }

    private void executeTransfer(InventoryTransaction transaction) {
        Warehouse srcWarehouse = transaction.getSourceWarehouse();
        Warehouse destWarehouse = transaction.getDestinationWarehouse();

        if (srcWarehouse == null || destWarehouse == null) {
            throw new BusinessException("Giao dịch chuyển kho yêu cầu Kho xuất và Kho nhập");
        }

        for (TransactionItem item : transaction.getItems()) {
            Product product = item.getProduct();
            Location srcLocation = item.getSourceLocation();
            Location destLocation = item.getDestinationLocation();

            if (srcLocation == null || destLocation == null) {
                throw new BusinessException("Sản phẩm " + product.getCode() + " yêu cầu đầy đủ vị trí xuất và vị trí nhập");
            }

            ProductBatch batch = null;
            if (item.getBatchNumber() != null && !item.getBatchNumber().trim().isEmpty()) {
                batch = productBatchRepository.findByProductIdAndBatchNumber(product.getId(), item.getBatchNumber().trim())
                        .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "batchNumber", item.getBatchNumber()));
            }

            // Deduct source
            StockLevel srcStock = stockLevelRepository.findStockLevel(
                    product.getId(), srcWarehouse.getId(), srcLocation.getId(),
                    batch != null ? batch.getId() : null)
                    .orElseThrow(() -> new InsufficientStockException("Không tìm thấy số dư kho tại vị trí nguồn"));

            BigDecimal availableQty = srcStock.getQuantity().subtract(srcStock.getReservedQuantity());
            if (availableQty.compareTo(item.getQuantity()) < 0) {
                throw new InsufficientStockException(
                        String.format("Không đủ tồn kho khả dụng tại vị trí nguồn %s. Yêu cầu: %s, Khả dụng: %s",
                                srcLocation.getName(), item.getQuantity(), availableQty)
                );
            }

            BigDecimal srcBeforeQty = srcStock.getQuantity();
            srcStock.setQuantity(srcStock.getQuantity().subtract(item.getQuantity()));
            stockLevelRepository.save(srcStock);

            // Log source movement
            StockMovement srcMovement = StockMovement.builder()
                    .product(product)
                    .warehouse(srcWarehouse)
                    .location(srcLocation)
                    .batch(batch)
                    .transaction(transaction)
                    .type(StockMovementType.TRANSFER_OUT)
                    .quantity(item.getQuantity().negate())
                    .balanceBefore(srcBeforeQty)
                    .balanceAfter(srcBeforeQty.subtract(item.getQuantity()))
                    .build();
            stockMovementRepository.save(srcMovement);

            // Add destination
            StockLevel destStock = stockLevelRepository.findStockLevel(
                    product.getId(), destWarehouse.getId(), destLocation.getId(),
                    batch != null ? batch.getId() : null).orElse(null);

            BigDecimal destBeforeQty = BigDecimal.ZERO;
            if (destStock != null) {
                destBeforeQty = destStock.getQuantity();
                destStock.setQuantity(destStock.getQuantity().add(item.getQuantity()));
            } else {
                destStock = StockLevel.builder()
                        .product(product)
                        .warehouse(destWarehouse)
                        .location(destLocation)
                        .batch(batch)
                        .quantity(item.getQuantity())
                        .reservedQuantity(BigDecimal.ZERO)
                        .build();
            }
            stockLevelRepository.save(destStock);

            // Log destination movement
            StockMovement destMovement = StockMovement.builder()
                    .product(product)
                    .warehouse(destWarehouse)
                    .location(destLocation)
                    .batch(batch)
                    .transaction(transaction)
                    .type(StockMovementType.TRANSFER_IN)
                    .quantity(item.getQuantity())
                    .balanceBefore(destBeforeQty)
                    .balanceAfter(destBeforeQty.add(item.getQuantity()))
                    .build();
            stockMovementRepository.save(destMovement);
        }
    }

    private void mapRelations(InventoryTransactionRequest request, InventoryTransaction transaction) {
        if (request.getSourceWarehouseId() != null) {
            Warehouse src = warehouseRepository.findById(request.getSourceWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getSourceWarehouseId()));
            transaction.setSourceWarehouse(src);
        } else {
            transaction.setSourceWarehouse(null);
        }

        if (request.getDestinationWarehouseId() != null) {
            Warehouse dest = warehouseRepository.findById(request.getDestinationWarehouseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getDestinationWarehouseId()));
            transaction.setDestinationWarehouse(dest);
        } else {
            transaction.setDestinationWarehouse(null);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier", "id", request.getSupplierId()));
            transaction.setSupplier(supplier);
        } else {
            transaction.setSupplier(null);
        }
    }

    private void mapItems(List<TransactionItemRequest> reqItems, InventoryTransaction transaction) {
        if (reqItems == null || reqItems.isEmpty()) {
            return;
        }

        List<TransactionItem> items = new ArrayList<>();
        for (TransactionItemRequest reqItem : reqItems) {
            Product product = productRepository.findById(reqItem.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", reqItem.getProductId()));

            Location srcLoc = null;
            if (reqItem.getSourceLocationId() != null) {
                srcLoc = locationRepository.findById(reqItem.getSourceLocationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Location", "id", reqItem.getSourceLocationId()));
            }

            Location destLoc = null;
            if (reqItem.getDestinationLocationId() != null) {
                destLoc = locationRepository.findById(reqItem.getDestinationLocationId())
                        .orElseThrow(() -> new ResourceNotFoundException("Location", "id", reqItem.getDestinationLocationId()));
            }

            TransactionItem item = TransactionItem.builder()
                    .transaction(transaction)
                    .product(product)
                    .quantity(reqItem.getQuantity())
                    .price(reqItem.getPrice())
                    .sourceLocation(srcLoc)
                    .destinationLocation(destLoc)
                    .batchNumber(reqItem.getBatchNumber())
                    .productionDate(reqItem.getProductionDate())
                    .expiryDate(reqItem.getExpiryDate())
                    .note(reqItem.getNote())
                    .build();
            items.add(item);
        }
        transaction.getItems().addAll(items);
    }

    private void calculateTotalAmount(InventoryTransaction transaction) {
        BigDecimal total = BigDecimal.ZERO;
        for (TransactionItem item : transaction.getItems()) {
            total = total.add(item.getQuantity().multiply(item.getPrice()));
        }
        transaction.setTotalAmount(total);
    }
}
