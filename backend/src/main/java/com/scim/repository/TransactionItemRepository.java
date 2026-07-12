package com.scim.repository;

import com.scim.entity.TransactionItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionItemRepository extends JpaRepository<TransactionItem, Long> {
}
