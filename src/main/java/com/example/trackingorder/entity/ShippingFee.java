package com.example.trackingorder.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "shipping_fees")
public class ShippingFee extends BaseEntity {
    @Id
    @UuidGenerator
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carrier_id")
    private Carrier carrier;

    @Column(name = "region_name")
    private String regionName;

    @Column(name = "weight_from_gram")
    private Integer weighFromGram;

    @Column(name = "weight_to_gram")
    private Integer weightToGram;

    @Column(name = "base_fee")
    private BigDecimal baseFee;

    @Column(name = "extra_fee_per_kg")
    private BigDecimal extraFeePerKg;

    @Column(name = "free_ship_threshold")
    private BigDecimal freeShipThreshold;

}
