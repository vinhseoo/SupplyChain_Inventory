package com.scim.controller;

import com.scim.dto.request.InventoryTransactionRequest;
import com.scim.dto.response.ApiResponse;
import com.scim.dto.response.InventoryTransactionResponse;
import com.scim.dto.response.PageResponse;
import com.scim.dto.response.StockLevelResponse;
import com.scim.entity.TransactionStatus;
import com.scim.entity.TransactionType;
import com.scim.service.InventoryTransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/inventory/transactions")
@RequiredArgsConstructor
@Tag(name = "Inventory Transactions", description = "APIs for Inbound, Outbound, and Transfer transactions")
public class InventoryTransactionController {

    private final InventoryTransactionService transactionService;

    @GetMapping
    @Operation(summary = "Get all transactions paginated", description = "Retrieve list of warehouse transactions matching query filters")
    public ResponseEntity<ApiResponse<PageResponse<InventoryTransactionResponse>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) TransactionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<InventoryTransactionResponse> page = transactionService.getAll(search, type, status, startDate, endDate, pageable);
        PageResponse<InventoryTransactionResponse> pageResponse = PageResponse.of(
                page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages()
        );
        return ResponseEntity.ok(ApiResponse.ok(pageResponse));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction details", description = "Retrieve detailed information of a transaction by ID")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.getById(id)));
    }

    @PostMapping
    @Operation(summary = "Create transaction", description = "Create a new transaction in DRAFT status")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> create(
            @Valid @RequestBody InventoryTransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(transactionService.create(request)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update transaction", description = "Modify an existing transaction in DRAFT status")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody InventoryTransactionRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction", description = "Delete a transaction in DRAFT status")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        transactionService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit transaction", description = "Change transaction status from DRAFT to PENDING for review")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> submit(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.submit(id)));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve transaction", description = "Approve transaction to move status to APPROVED")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> approve(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.approve(id)));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject transaction", description = "Reject transaction and change status to CANCELLED")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> reject(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.reject(id, reason)));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete transaction", description = "Execute transaction, update stocks, calculate WAC and set status to COMPLETED")
    public ResponseEntity<ApiResponse<InventoryTransactionResponse>> complete(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.complete(id)));
    }

    @GetMapping("/suggest-outbound")
    @Operation(summary = "Suggest outbound pick paths", description = "Retrieve recommended warehouse locations and batches based on FEFO/FIFO strategy")
    public ResponseEntity<ApiResponse<List<StockLevelResponse>>> suggestOutbound(
            @RequestParam Long productId,
            @RequestParam Long warehouseId,
            @RequestParam BigDecimal quantity,
            @RequestParam(required = false, defaultValue = "FEFO") String strategy) {
        return ResponseEntity.ok(ApiResponse.ok(transactionService.suggestOutbound(productId, warehouseId, quantity, strategy)));
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Print transaction PDF slip", description = "Download a formatted PDF copy of the transaction invoice/slip")
    public ResponseEntity<byte[]> getPdf(@PathVariable Long id) {
        byte[] data = transactionService.generatePdf(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "transaction-" + id + ".pdf");
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }
}
