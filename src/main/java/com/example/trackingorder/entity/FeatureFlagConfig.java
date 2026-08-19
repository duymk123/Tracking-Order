package com.example.trackingorder.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(
        name = "feature_flag_configs",
        indexes = {
                @Index(name = "idx_feature_flag_name", columnList = "flag_name"),
                @Index(name = "idx_feature_flag_client_ip", columnList = "client_ip")
        }
)
public class FeatureFlagConfig extends BaseEntity {

    @Id
    @UuidGenerator
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "flag_name", nullable = false, length = 100)
    private String flagName;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled;

    @Column(name = "customer_code", length = 100)
    private String customerCode;

    @Column(name = "client_ip", length = 100)
    private String clientIp;

    @Column(name = "strategy_id", length = 100)
    private String strategyId;

    @Column(name = "strategy_params", columnDefinition = "json")
    private String strategyParams;

    @Column(name = "applied_version", nullable = false, length = 100)
    private String appliedVersion;
}
