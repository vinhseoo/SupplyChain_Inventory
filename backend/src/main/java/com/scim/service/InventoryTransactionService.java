package com.scim.service;

import com.scim.dto.request.InventoryTransactionRequest;
import com.scim.dto.response.InventoryTransactionResponse;
import com.scim.dto.response.StockLevelResponse;
import com.scim.entity.TransactionStatus;
import com.scim.entity.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface InventoryTransactionService {

    Page<InventoryTransactionResponse> getAll(String search, TransactionType type, TransactionStatus status,
                                              LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);

    InventoryTransactionResponse getById(Long id);

    InventoryTransactionResponse create(InventoryTransactionRequest request);

    InventoryTransactionResponse update(Long id, InventoryTransactionRequest request);

    void delete(Long id);

    InventoryTransactionResponse submit(Long id);

    InventoryTransactionResponse approve(Long id);

    InventoryTransactionResponse reject(Long id, String reason);

    InventoryTransactionResponse complete(Long id);

    List<StockLevelResponse> suggestOutbound(Long productId, Long warehouseId, BigDecimal quantity, String strategy);

    byte[] generatePdf(Long id);
}
