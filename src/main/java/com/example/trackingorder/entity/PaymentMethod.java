package com.example.trackingorder.entity;

import com.example.trackingorder.common.PaymentMethodStatus;
import com.example.trackingorder.common.PaymentMethodType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.Date;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "payment_methods")
public class PaymentMethod extends BaseEntity{
    @Id
    @UuidGenerator
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @Column(name = "method_type")
    private PaymentMethodType methodType;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "status")
    private PaymentMethodStatus status;

    @Column(name = "paid_at")
    private Date paidAt;

}
