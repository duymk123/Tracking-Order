package com.example.trackingorder.entity;

import com.example.trackingorder.common.OriginType;
import com.example.trackingorder.common.ReasonEnum;
import com.example.trackingorder.common.StatusReturnEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "returns")
public class Return {
    @Id
    @UuidGenerator
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "reason")
    @Enumerated(EnumType.STRING)
    private ReasonEnum reason;

    @Column(name = "origin_type")
    @Enumerated(EnumType.STRING)
    private OriginType originType;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private StatusReturnEnum  status;

    @Column(name = "refund_amount")
    private BigDecimal refundAmount;

    @Column(name = "notes")
    private String notes;
}
