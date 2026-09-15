import { useState, useEffect } from "react";
import { getStoredFeatures } from "../services/authStorage.js";

/**
 * Hook đọc trạng thái Feature Flag trực tiếp từ cache trên Frontend (0ms latency, 0 request).
 * Tự động cập nhật khi token được refresh và cấu hình cờ mới được kéo về.
 *
 * @param {string} flagName Tên cờ (ví dụ: 'BUY_NOW', 'PRICE_INCREASE', 'ORDER_DETAIL')
 * @param {boolean} defaultValue Giá trị mặc định nếu không tìm thấy (mặc định là false)
 * @returns {boolean} Trạng thái bật/tắt của cờ
 */
export function useFeatureFlag(flagName, defaultValue = false) {
  const [enabled, setEnabled] = useState(() => {
    const features = getStoredFeatures();
    return features && flagName in features ? Boolean(features[flagName]) : defaultValue;
  });

  useEffect(() => {
    // Đọc trạng thái ban đầu
    const features = getStoredFeatures();
    if (features && flagName in features) {
      setEnabled(Boolean(features[flagName]));
    }

    // Lắng nghe sự kiện cập nhật cờ từ auto-refresh token
    const handleFeaturesUpdated = (event) => {
      const updatedFeatures = event.detail || getStoredFeatures();
      if (updatedFeatures && flagName in updatedFeatures) {
        setEnabled(Boolean(updatedFeatures[flagName]));
      }
    };

    window.addEventListener("features-updated", handleFeaturesUpdated);
    return () => {
      window.removeEventListener("features-updated", handleFeaturesUpdated);
    };
  }, [flagName, defaultValue]);

  return enabled;
}

/**
 * Hook lấy toàn bộ bản đồ Feature Flags đã được cache trên Frontend.
 */
export function useAllFeatureFlags() {
  const [features, setFeatures] = useState(() => getStoredFeatures());

  useEffect(() => {
    setFeatures(getStoredFeatures());

    const handleFeaturesUpdated = (event) => {
      setFeatures(event.detail || getStoredFeatures());
    };

    window.addEventListener("features-updated", handleFeaturesUpdated);
    return () => {
      window.removeEventListener("features-updated", handleFeaturesUpdated);
    };
  }, []);

  return features;
}
