package com.example.trackingorder.service;

import com.example.trackingorder.dto.response.TrackingHistoryRes;

import java.util.List;

public interface TrackingLogService {
    List<TrackingHistoryRes> getTrackingHistory(String orderId);
}
