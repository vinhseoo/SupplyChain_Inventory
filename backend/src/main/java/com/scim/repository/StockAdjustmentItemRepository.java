package com.scim.repository;

import com.scim.entity.StockAdjustmentItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockAdjustmentItemRepository extends JpaRepository<StockAdjustmentItem, Long> {
}
