package com.scim.scheduler;

import com.scim.entity.NotificationType;
import com.scim.entity.Product;
import com.scim.entity.ProductBatch;
import com.scim.repository.NotificationRepository;
import com.scim.repository.ProductBatchRepository;
import com.scim.repository.ProductRepository;
import com.scim.repository.StockLevelRepository;
import com.scim.service.NotificationService;
import com.scim.service.SystemSettingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryAlertScheduler {

    private final ProductRepository productRepository;
    private final ProductBatchRepository productBatchRepository;
    private final StockLevelRepository stockLevelRepository;
    private final SystemSettingService systemSettingService;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    @Scheduled(initialDelay = 15000, fixedDelay = 86400000) // Run 15s after startup, then daily
    @Transactional
    public void runAlertsCheck() {
        log.info("Starting scheduled inventory alerts check (Low Stock & Expiry)...");
        try {
            checkLowStockAlerts();
            checkExpiryAlerts();
        } catch (Exception e) {
            log.error("Error running inventory alerts scheduler: {}", e.getMessage(), e);
        }
        log.info("Finished inventory alerts check.");
    }

    private void checkLowStockAlerts() {
        Integer globalThreshold = systemSettingService.getIntValue("LOW_STOCK_THRESHOLD", 10);
        List<Product> activeProducts = productRepository.findAll().stream()
                .filter(Product::getIsActive)
                .toList();

        for (Product product : activeProducts) {
            BigDecimal totalStock = stockLevelRepository.getTotalStockByProduct(product.getId()).orElse(BigDecimal.ZERO);
            BigDecimal minStock = product.getMinimumStock() != null && product.getMinimumStock().compareTo(BigDecimal.ZERO) > 0
                    ? product.getMinimumStock()
                    : BigDecimal.valueOf(globalThreshold);

            if (totalStock.compareTo(minStock) < 0) {
                String title = "Cảnh báo tồn kho thấp";
                String content = String.format("Sản phẩm %s (SKU: %s) có lượng tồn kho là %s, thấp hơn ngưỡng tối thiểu %s.",
                        product.getName(), product.getSku(), totalStock, minStock);

                // Prevent duplicates within 24 hours
                if (!notificationRepository.existsByTitleAndContentAndCreatedAtAfter(title, content, LocalDateTime.now().minusDays(1))) {
                    notificationService.create(null, title, content, NotificationType.WARNING);
                    log.info("Triggered low stock alert for product: {}", product.getSku());
                }
            }
        }
    }

    private void checkExpiryAlerts() {
        Integer expiryDays = systemSettingService.getIntValue("ALERT_EXPIRY_DAYS", 30);
        LocalDateTime thresholdDate = LocalDateTime.now().plusDays(expiryDays);

        List<ProductBatch> expiringBatches = productBatchRepository.findAll().stream()
                .filter(b -> b.getRemainingQuantity() != null && b.getRemainingQuantity().compareTo(BigDecimal.ZERO) > 0)
                .filter(b -> b.getExpiryDate() != null && b.getExpiryDate().isBefore(thresholdDate) && b.getExpiryDate().isAfter(LocalDateTime.now()))
                .toList();

        for (ProductBatch batch : expiringBatches) {
            String title = "Cảnh báo lô hàng sắp hết hạn";
            String content = String.format("Lô hàng %s của sản phẩm %s sẽ hết hạn vào ngày %s. Số lượng còn lại: %s.",
                    batch.getBatchNumber(), batch.getProduct().getName(), batch.getExpiryDate().toLocalDate(), batch.getRemainingQuantity());

            // Prevent duplicates within 24 hours
            if (!notificationRepository.existsByTitleAndContentAndCreatedAtAfter(title, content, LocalDateTime.now().minusDays(1))) {
                notificationService.create(null, title, content, NotificationType.WARNING);
                log.info("Triggered expiry alert for batch: {}", batch.getBatchNumber());
            }
        }
    }
}
