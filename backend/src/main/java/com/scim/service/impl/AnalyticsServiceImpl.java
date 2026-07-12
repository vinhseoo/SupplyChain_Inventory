package com.scim.service.impl;

import com.scim.dto.response.*;
import com.scim.service.AnalyticsService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

    @PersistenceContext
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public KpiSummaryResponse getKpis() {
        try {
            BigDecimal totalInventoryValue = toBigDecimal(entityManager.createNativeQuery(
                    "SELECT COALESCE(SUM(sl.quantity * p.price), 0) FROM stock_levels sl JOIN products p ON sl.product_id = p.id"
            ).getSingleResult());

            long totalSkus = toLong(entityManager.createNativeQuery(
                    "SELECT COUNT(id) FROM products WHERE is_active = true"
            ).getSingleResult());

            long totalInbound = toLong(entityManager.createNativeQuery(
                    "SELECT COUNT(id) FROM inventory_transactions WHERE type = 'INBOUND' AND status = 'COMPLETED'"
            ).getSingleResult());

            long totalOutbound = toLong(entityManager.createNativeQuery(
                    "SELECT COUNT(id) FROM inventory_transactions WHERE type = 'OUTBOUND' AND status = 'COMPLETED'"
            ).getSingleResult());

            long activeAlerts = toLong(entityManager.createNativeQuery(
                    "SELECT COUNT(id) FROM notifications WHERE is_read = false AND type = 'WARNING'"
            ).getSingleResult());

            return new KpiSummaryResponse(totalInventoryValue, totalSkus, totalInbound, totalOutbound, activeAlerts);
        } catch (Exception e) {
            log.error("Failed to query KPI summary: {}", e.getMessage(), e);
            return new KpiSummaryResponse(BigDecimal.ZERO, 0L, 0L, 0L, 0L);
        }
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<AbcClassificationResponse> getAbcClassification() {
        List<AbcClassificationResponse> result = new ArrayList<>();
        try {
            List<Object[]> rows = entityManager.createNativeQuery(
                    "SELECT product_id, name, sku, total_val, cum_pct, abc_class FROM mv_product_abc_classification ORDER BY total_val DESC"
            ).getResultList();

            for (Object[] row : rows) {
                result.add(new AbcClassificationResponse(
                        toLong(row[0]),
                        (String) row[1],
                        (String) row[2],
                        toBigDecimal(row[3]),
                        toDouble(row[4]),
                        (String) row[5]
                ));
            }
        } catch (Exception e) {
            log.error("Failed to get ABC classification: {}", e.getMessage(), e);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<SlowMovingItemResponse> getSlowMovingInventory(Integer minDaysInactive) {
        int days = minDaysInactive != null ? minDaysInactive : 30;
        List<SlowMovingItemResponse> result = new ArrayList<>();
        try {
            List<Object[]> rows = entityManager.createNativeQuery(
                    "SELECT product_id, name, sku, price, current_stock, last_movement_date, days_inactive " +
                    "FROM mv_slow_moving_inventory " +
                    "WHERE days_inactive >= :days " +
                    "ORDER BY days_inactive DESC"
            ).setParameter("days", days).getResultList();

            for (Object[] row : rows) {
                result.add(new SlowMovingItemResponse(
                        toLong(row[0]),
                        (String) row[1],
                        (String) row[2],
                        toBigDecimal(row[3]),
                        toBigDecimal(row[4]),
                        toLocalDate(row[5]),
                        toInt(row[6])
                ));
            }
        } catch (Exception e) {
            log.error("Failed to get slow moving inventory: {}", e.getMessage(), e);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<StockDepletionForecastResponse> getStockDepletionForecast(Double maxDaysToOut) {
        double days = maxDaysToOut != null ? maxDaysToOut : 9999.0;
        List<StockDepletionForecastResponse> result = new ArrayList<>();
        try {
            List<Object[]> rows = entityManager.createNativeQuery(
                    "SELECT product_id, name, sku, current_stock, avg_daily_consumption, days_to_out " +
                    "FROM mv_stock_out_forecast " +
                    "WHERE days_to_out <= :days " +
                    "ORDER BY days_to_out ASC"
            ).setParameter("days", days).getResultList();

            for (Object[] row : rows) {
                result.add(new StockDepletionForecastResponse(
                        toLong(row[0]),
                        (String) row[1],
                        (String) row[2],
                        toBigDecimal(row[3]),
                        toBigDecimal(row[4]),
                        toDouble(row[5])
                ));
            }
        } catch (Exception e) {
            log.error("Failed to get stock depletion forecast: {}", e.getMessage(), e);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<MovementTrendResponse> getMovementTrend(Integer lastDays) {
        int days = lastDays != null ? lastDays : 30;
        List<MovementTrendResponse> result = new ArrayList<>();
        try {
            List<Object[]> rows = entityManager.createNativeQuery(
                    "SELECT " +
                    "  DATE(created_at) as movement_date, " +
                    "  COALESCE(SUM(CASE WHEN quantity > 0 THEN quantity ELSE 0 END), 0) as inbound_qty, " +
                    "  COALESCE(SUM(CASE WHEN quantity < 0 THEN ABS(quantity) ELSE 0 END), 0) as outbound_qty " +
                    "FROM stock_movements " +
                    "WHERE created_at >= CURRENT_DATE - (:days * INTERVAL '1 day') " +
                    "GROUP BY DATE(created_at) " +
                    "ORDER BY movement_date ASC"
            ).setParameter("days", days).getResultList();

            for (Object[] row : rows) {
                result.add(new MovementTrendResponse(
                        toLocalDate(row[0]),
                        toBigDecimal(row[1]),
                        toBigDecimal(row[2])
                ));
            }
        } catch (Exception e) {
            log.error("Failed to get movement trend: {}", e.getMessage(), e);
        }
        return result;
    }

    @Override
    @Transactional
    public void refreshMaterializedViews() {
        log.info("Refreshing materialized views for analytics...");
        try {
            entityManager.createNativeQuery("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_abc_classification").executeUpdate();
            entityManager.createNativeQuery("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_slow_moving_inventory").executeUpdate();
            entityManager.createNativeQuery("REFRESH MATERIALIZED VIEW CONCURRENTLY mv_stock_out_forecast").executeUpdate();
            log.info("Materialized views refreshed successfully.");
        } catch (Exception e) {
            log.error("Failed to refresh materialized views: {}", e.getMessage(), e);
        }
    }

    // --- Helper converters ---

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        if (val instanceof BigDecimal) return (BigDecimal) val;
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue());
        return new BigDecimal(val.toString());
    }

    private double toDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        return Double.parseDouble(val.toString());
    }

    private int toInt(Object val) {
        if (val == null) return 0;
        if (val instanceof Number) return ((Number) val).intValue();
        return Integer.parseInt(val.toString());
    }

    private long toLong(Object val) {
        if (val == null) return 0L;
        if (val instanceof Number) return ((Number) val).longValue();
        return Long.parseLong(val.toString());
    }

    private LocalDate toLocalDate(Object val) {
        if (val == null) return null;
        if (val instanceof java.sql.Date) return ((java.sql.Date) val).toLocalDate();
        if (val instanceof java.sql.Timestamp) return ((java.sql.Timestamp) val).toLocalDateTime().toLocalDate();
        if (val instanceof LocalDate) return (LocalDate) val;
        if (val instanceof java.time.LocalDateTime) return ((java.time.LocalDateTime) val).toLocalDate();
        return LocalDate.parse(val.toString().substring(0, 10));
    }
}
