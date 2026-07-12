package com.scim.service.impl;

import com.scim.dto.request.BarcodeScanRequest;
import com.scim.dto.request.StocktakeItemRequest;
import com.scim.dto.request.StocktakeSessionRequest;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockAdjustmentResponse;
import com.scim.dto.response.StocktakeSessionResponse;
import com.scim.entity.*;
import com.scim.exception.BusinessException;
import com.scim.exception.ResourceNotFoundException;
import com.scim.mapper.StockAdjustmentMapper;
import com.scim.mapper.StocktakeSessionMapper;
import com.scim.repository.*;
import com.scim.service.StocktakeSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StocktakeSessionServiceImpl implements StocktakeSessionService {

    private final StocktakeSessionRepository sessionRepository;
    private final StocktakeItemRepository itemRepository;
    private final StockAdjustmentRepository adjustmentRepository;
    private final StockAdjustmentItemRepository adjustmentItemRepository;
    private final WarehouseRepository warehouseRepository;
    private final StockLevelRepository stockLevelRepository;
    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final LocationRepository locationRepository;
    private final StockMovementRepository stockMovementRepository;

    private final StocktakeSessionMapper sessionMapper;
    private final StockAdjustmentMapper adjustmentMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StocktakeSessionResponse> getAll(String search, Long warehouseId, StocktakeStatus status, Pageable pageable) {
        Page<StocktakeSession> page = sessionRepository.findWithFilters(search, warehouseId, status, pageable);
        List<StocktakeSessionResponse> content = sessionMapper.toResponseList(page.getContent());
        return PageResponse.of(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public StocktakeSessionResponse getById(Long id) {
        StocktakeSession session = sessionRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ResourceNotFoundException("StocktakeSession", "id", id));
        return sessionMapper.toResponse(session);
    }

    @Override
    @Transactional
    public StocktakeSessionResponse create(StocktakeSessionRequest request) {
        Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", request.getWarehouseId()));

        StocktakeSession session = StocktakeSession.builder()
                .code("ST-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")))
                .warehouse(warehouse)
                .status(StocktakeStatus.DRAFT)
                .note(request.getNote())
                .build();

        session = sessionRepository.save(session);
        initializeStocktakeItems(session);

        log.info("Created stocktake session: {}", session.getCode());
        return getById(session.getId());
    }

    private void initializeStocktakeItems(StocktakeSession session) {
        List<StockLevel> stockLevels = stockLevelRepository.findByWarehouseId(session.getWarehouse().getId());
        List<StocktakeItem> items = new ArrayList<>();
        for (StockLevel sl : stockLevels) {
            StocktakeItem item = StocktakeItem.builder()
                    .session(session)
                    .product(sl.getProduct())
                    .location(sl.getLocation())
                    .batch(sl.getBatch())
                    .systemQuantity(sl.getQuantity())
                    .actualQuantity(BigDecimal.ZERO)
                    .variance(sl.getQuantity().negate())
                    .build();
            items.add(item);
        }
        itemRepository.saveAll(items);
    }

    @Override
    @Transactional
    public StocktakeSessionResponse updateItemQty(Long id, Long itemId, StocktakeItemRequest request) {
        StocktakeSession session = getActiveSession(id);
        StocktakeItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("StocktakeItem", "id", itemId));

        if (!item.getSession().getId().equals(id)) {
            throw new BusinessException("Mat hang khong thuoc phien kiem ke nay");
        }

        item.setActualQuantity(request.getActualQuantity());
        item.setVariance(request.getActualQuantity().subtract(item.getSystemQuantity()));
        item.setNote(request.getNote());
        itemRepository.save(item);

        log.info("Updated stocktake item {} quantity to {}", itemId, request.getActualQuantity());
        return getById(id);
    }

    @Override
    @Transactional
    public StocktakeSessionResponse scanBarcode(Long id, BarcodeScanRequest request) {
        StocktakeSession session = getActiveSession(id);
        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", request.getLocationId()));

        if (!location.getWarehouse().getId().equals(session.getWarehouse().getId())) {
            throw new BusinessException("Vi tri quet khong thuoc kho hang cua phien kiem ke");
        }

        String rawCode = request.getCode();
        BigDecimal scanQty = BigDecimal.ONE;

        if (rawCode.contains(":QTY:")) {
            String[] parts = rawCode.split(":QTY:");
            rawCode = parts[0];
            try {
                scanQty = new BigDecimal(parts[1]);
            } catch (Exception e) {
                log.warn("Invalid quantity format in scanned barcode: {}, fallback to 1", parts[1]);
            }
        }

        Product product;
        ProductBatch batch = null;

        if (rawCode.startsWith("SCIM:BATCH:")) {
            String batchNumber = rawCode.substring("SCIM:BATCH:".length());
            batch = productBatchRepository.findByBatchNumber(batchNumber)
                    .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "batchNumber", batchNumber));
            product = batch.getProduct();
        } else if (rawCode.startsWith("SCIM:PROD:")) {
            String sku = rawCode.substring("SCIM:PROD:".length());
            product = productRepository.findBySku(sku)
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "sku", sku));
        } else {
            product = productRepository.findByBarcode(rawCode)
                    .or(() -> productRepository.findBySku(rawCode))
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "barcode/sku", rawCode));
        }

        processScannedProduct(session, product, location, batch, scanQty);
        return getById(id);
    }

    private void processScannedProduct(StocktakeSession session, Product product, Location location, ProductBatch batch, BigDecimal scanQty) {
        Long batchId = batch != null ? batch.getId() : null;
        Optional<StocktakeItem> existingItem = itemRepository.findBySessionAndDetails(
                session.getId(), product.getId(), location.getId(), batchId);

        if (existingItem.isPresent()) {
            StocktakeItem item = existingItem.get();
            item.setActualQuantity(item.getActualQuantity().add(scanQty));
            item.setVariance(item.getActualQuantity().subtract(item.getSystemQuantity()));
            itemRepository.save(item);
        } else {
            Optional<StockLevel> slOpt = stockLevelRepository.findStockLevel(
                    product.getId(), session.getWarehouse().getId(), location.getId(), batchId);
            BigDecimal systemQty = slOpt.map(StockLevel::getQuantity).orElse(BigDecimal.ZERO);

            StocktakeItem item = StocktakeItem.builder()
                    .session(session)
                    .product(product)
                    .location(location)
                    .batch(batch)
                    .systemQuantity(systemQty)
                    .actualQuantity(scanQty)
                    .variance(scanQty.subtract(systemQty))
                    .build();
            itemRepository.save(item);
        }
    }

    @Override
    @Transactional
    public StocktakeSessionResponse complete(Long id) {
        StocktakeSession session = getActiveSession(id);
        session.setStatus(StocktakeStatus.COMPLETED);
        sessionRepository.save(session);
        log.info("Completed stocktake session: {}", session.getCode());
        return getById(id);
    }

    @Override
    @Transactional
    public StocktakeSessionResponse cancel(Long id) {
        StocktakeSession session = getActiveSession(id);
        session.setStatus(StocktakeStatus.CANCELLED);
        sessionRepository.save(session);
        log.info("Cancelled stocktake session: {}", session.getCode());
        return getById(id);
    }

    @Override
    @Transactional
    public StockAdjustmentResponse createAdjustment(Long id) {
        StocktakeSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StocktakeSession", "id", id));

        if (session.getStatus() != StocktakeStatus.COMPLETED) {
            throw new BusinessException("Chi tao phieu dieu chinh tu phien kiem ke da HOAN THANH");
        }

        StockAdjustment adjustment = StockAdjustment.builder()
                .code("ADJ-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")))
                .session(session)
                .warehouse(session.getWarehouse())
                .status(StockAdjustmentStatus.APPROVED)
                .reason("Dieu chinh chenh lech tu phien kiem ke " + session.getCode())
                .build();

        adjustment = adjustmentRepository.save(adjustment);
        applyStocktakeAdjustments(session, adjustment);

        session.setStatus(StocktakeStatus.ADJUSTED);
        sessionRepository.save(session);

        log.info("Created and approved stock adjustment: {} from session: {}", adjustment.getCode(), session.getCode());
        return adjustmentMapper.toResponse(adjustmentRepository.findByIdWithDetails(adjustment.getId()).get());
    }

    private void applyStocktakeAdjustments(StocktakeSession session, StockAdjustment adjustment) {
        for (StocktakeItem item : session.getItems()) {
            if (item.getVariance().compareTo(BigDecimal.ZERO) == 0) {
                continue;
            }

            StockAdjustmentItem adjItem = StockAdjustmentItem.builder()
                    .adjustment(adjustment)
                    .product(item.getProduct())
                    .location(item.getLocation())
                    .batch(item.getBatch())
                    .systemQuantity(item.getSystemQuantity())
                    .actualQuantity(item.getActualQuantity())
                    .adjustedQuantity(item.getVariance())
                    .reason("Sai lech kiem ke: " + item.getVariance())
                    .build();

            adjustmentItemRepository.save(adjItem);
            adjustStockLevel(adjustment.getWarehouse(), adjItem);
        }
    }

    private void adjustStockLevel(Warehouse warehouse, StockAdjustmentItem adjItem) {
        Long batchId = adjItem.getBatch() != null ? adjItem.getBatch().getId() : null;
        Optional<StockLevel> slOpt = stockLevelRepository.findStockLevel(
                adjItem.getProduct().getId(), warehouse.getId(), adjItem.getLocation().getId(), batchId);

        BigDecimal oldQty = BigDecimal.ZERO;
        StockLevel stockLevel;

        if (slOpt.isPresent()) {
            stockLevel = slOpt.get();
            oldQty = stockLevel.getQuantity();
            stockLevel.setQuantity(stockLevel.getQuantity().add(adjItem.getAdjustedQuantity()));
        } else {
            stockLevel = StockLevel.builder()
                    .product(adjItem.getProduct())
                    .warehouse(warehouse)
                    .location(adjItem.getLocation())
                    .batch(adjItem.getBatch())
                    .quantity(adjItem.getAdjustedQuantity())
                    .build();
        }

        if (stockLevel.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            stockLevelRepository.delete(stockLevel);
        } else {
            stockLevelRepository.save(stockLevel);
        }

        if (adjItem.getBatch() != null) {
            ProductBatch batch = adjItem.getBatch();
            batch.setRemainingQuantity(batch.getRemainingQuantity().add(adjItem.getAdjustedQuantity()));
            productBatchRepository.save(batch);
        }

        createStockMovement(warehouse, adjItem, oldQty, stockLevel.getQuantity());
    }

    private void createStockMovement(Warehouse warehouse, StockAdjustmentItem adjItem, BigDecimal oldQty, BigDecimal newQty) {
        StockMovement movement = StockMovement.builder()
                .product(adjItem.getProduct())
                .warehouse(warehouse)
                .location(adjItem.getLocation())
                .batch(adjItem.getBatch())
                .type(StockMovementType.ADJUSTMENT)
                .quantity(adjItem.getAdjustedQuantity())
                .balanceBefore(oldQty)
                .balanceAfter(newQty)
                .build();
        stockMovementRepository.save(movement);
    }

    private StocktakeSession getActiveSession(Long id) {
        StocktakeSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StocktakeSession", "id", id));
        if (session.getStatus() != StocktakeStatus.DRAFT) {
            throw new BusinessException("Chi cho phep cap nhat phien kiem ke o trang thai DRAFT");
        }
        return session;
    }
}
