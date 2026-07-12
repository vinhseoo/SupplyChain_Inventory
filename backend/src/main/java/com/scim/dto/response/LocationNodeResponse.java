package com.scim.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationNodeResponse {
    private Long id;
    private String code;
    private String name;
    private String type;
    private Long parentId;
    private String description;
    private Boolean isActive;
    
    @Builder.Default
    private List<LocationNodeResponse> children = new ArrayList<>();
}
