package com.scim.dto.response;

import com.scim.entity.StocktakeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StocktakeSessionResponse {
    private Long id;
    private String code;
    private Long warehouseId;
    private String warehouseName;
    private String warehouseCode;
    private StocktakeStatus status;
    private String note;
    private List<StocktakeItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private Long version;
}
