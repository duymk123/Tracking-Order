package com.example.trackingorder.repository;

import com.example.trackingorder.entity.FeatureFlagConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeatureFlagConfigRepo extends JpaRepository<FeatureFlagConfig, String> {
    List<FeatureFlagConfig> findByFlagNameIgnoreCase(String flagName);
}
