package com.scim.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImportSummaryResponse {
    private int totalProcessed;
    private int totalSuccess;
    private int totalFailed;
    private List<String> errorDetails;
}
