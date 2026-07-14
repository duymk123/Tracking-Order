package com.example.trackingorder.entity;

import com.example.trackingorder.common.DiscountTypeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "Coupons")
public class Coupon extends BaseEntity {
    @Id
    @UuidGenerator
    private String id;

    @Column(name = "code")
    private String code;

    @Column(name = "discount_type")
    @Enumerated(EnumType.STRING)
    private DiscountTypeEnum discountType;

    @Column(name = "discount_value")
    private BigDecimal discountValue;

    @Column(name = "min_order_value")
    private BigDecimal minOrderValue;

    @Column(name = "max_usage")
    private Integer maxUsage;

    @Column(name = "used_count")
    private Integer usedCount;

    @Column(name = "expired_at")
    private Date expiredAt;
}
