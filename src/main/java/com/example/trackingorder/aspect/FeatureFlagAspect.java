package com.example.trackingorder.aspect;

import com.example.trackingorder.annotation.RequireFeature;
import com.example.trackingorder.client.FeatureFlagClient;
import com.example.trackingorder.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class FeatureFlagAspect {
    private final FeatureFlagClient featureFlagClient;


//     Chặn trước khi bất kỳ method nào có gắn @RequireFeature được thực thi

    @Before("@annotation(requireFeature)")
    public void checkFeatureFlag(JoinPoint joinPoint, RequireFeature requireFeature) {

        // Lấy danh sách feature flags (ưu tiên flags, nếu trống thì lấy value)
        String[] features = requireFeature.features();

        // Lặp qua danh sách feature để kiểm tra
        for (String feature : features) {
            if(!featureFlagClient.isEnabled(feature)) {
                log.warn("Tính năng [{}] đang bị tắt. Chặn gọi method: {}", feature, joinPoint.getSignature().toShortString());

                // ném exception để dừng method lập tức
                throw new BadRequestException(HttpStatus.BAD_REQUEST,requireFeature.message());
            }
        }


    }

}
