package com.scim.entity;

import com.scim.entity.base.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "activity_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog extends BaseEntity {

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;
}
