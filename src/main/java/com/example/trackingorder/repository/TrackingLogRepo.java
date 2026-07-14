package com.example.trackingorder.repository;

import com.example.trackingorder.entity.TrackingLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrackingLogRepo extends JpaRepository<TrackingLog, String> {
}
