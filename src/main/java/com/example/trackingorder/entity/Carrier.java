package com.example.trackingorder.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "carriers")
public class Carrier extends BaseEntity {
    @Id
    @UuidGenerator
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "name")
    private String name;

    @Column(name = "api_endpoint")
    private String apiEndpoint;

    @Column(name = "is_active")
    private boolean isActive;

    @Column(name = "support_regions")
    private String supportRegions;

    @OneToMany(mappedBy = "carrier")
    private List<Shipper> shippers;

}
