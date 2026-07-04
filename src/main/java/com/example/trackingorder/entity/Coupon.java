package com.example.trackingorder.entity;

import com.example.trackingorder.common.DiscountTypeEnum;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
    private DiscountTypeEnum discount_type;

    @Column(name = "discount_value")
    private BigDecimal discount_value;

    @Column(name = "min_order_value")
    private BigDecimal min_order_values;

    @Column(name = "max_usage")
    private Integer max_usage;

    @Column(name = "used_count")
    private Integer used_count;

    @Column(name = "expired_at")
    private Date expired_at;
}
