package com.scim.controller;

import com.scim.entity.ProductBatch;
import com.scim.exception.ResourceNotFoundException;
import com.scim.repository.ProductBatchRepository;
import com.scim.service.QrCodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr-code")
@RequiredArgsConstructor
@Tag(name = "QR Code Utility", description = "APIs for generating QR Code images")
public class QrCodeController {

    private final QrCodeService qrCodeService;
    private final ProductBatchRepository productBatchRepository;

    @GetMapping(produces = MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "Generate raw QR Code by text value", description = "Creates a 250x250 PNG image stream representing the input text")
    public ResponseEntity<byte[]> generateQrCode(@RequestParam String text) {
        byte[] image = qrCodeService.generateQrCode(text, 250, 250);
        return ResponseEntity.ok(image);
    }

    @GetMapping(value = "/batches/{batchId}", produces = MediaType.IMAGE_PNG_VALUE)
    @Operation(summary = "Generate QR Code for a product batch", description = "Generates a PNG image containing the standard batch string format 'SCIM:BATCH:<batchNumber>'")
    public ResponseEntity<byte[]> generateBatchQrCode(@PathVariable Long batchId) {
        ProductBatch batch = productBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductBatch", "id", batchId));
        String qrText = "SCIM:BATCH:" + batch.getBatchNumber();
        byte[] image = qrCodeService.generateQrCode(qrText, 250, 250);
        return ResponseEntity.ok(image);
    }
}
