package com.scim.event;

import com.scim.controller.RealTimeStockController;
import com.scim.repository.StockLevelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class StockChangeEventListener {

    private final StockLevelRepository stockLevelRepository;
    private final StringRedisTemplate redisTemplate;
    private final RealTimeStockController realTimeStockController;

    @EventListener
    public void handleStockChangeEvent(StockChangeEvent event) {
        log.info("Stock change event received for product: {} (ID: {})", event.getSku(), event.getProductId());
        try {
            BigDecimal newQty = stockLevelRepository.getTotalStockByProduct(event.getProductId()).orElse(BigDecimal.ZERO);
            
            // Sync to Redis cache
            String redisKey = "stock:product:" + event.getProductId();
            redisTemplate.opsForValue().set(redisKey, newQty.toString());
            log.debug("Synchronized Redis cache for product stock {}: {}", event.getProductId(), newQty);

            // Construct notification payload for SSE
            Map<String, Object> payload = Map.of(
                    "productId", event.getProductId(),
                    "sku", event.getSku(),
                    "name", event.getName(),
                    "quantity", newQty,
                    "timestamp", LocalDateTime.now().toString()
            );

            // Push to SSE clients
            realTimeStockController.broadcast(payload);
        } catch (Exception e) {
            log.error("Failed to handle stock change event: {}", e.getMessage(), e);
        }
    }
}
