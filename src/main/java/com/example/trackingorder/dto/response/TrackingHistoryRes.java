package com.example.trackingorder.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrackingHistoryRes {
    private String title; //Order Placed, Order Confirmed,Package Picked Up
    private String fromStatus;
    private String toStatus;
    private String note;
    private String locationDescription;
    private String updatedBy; //trackingLog.getUpdateBy().getUsername()
    private String updateAt;
}
