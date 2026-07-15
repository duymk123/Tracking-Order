package com.example.trackingorder.service.impl;

import com.example.trackingorder.config.basicauthconfig.AuthenticationFacade;
import com.example.trackingorder.configmapper.TrackingLogMapper;
import com.example.trackingorder.dto.response.TrackingHistoryRes;
import com.example.trackingorder.entity.TrackingLog;
import com.example.trackingorder.entity.User;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.OrderRepo;
import com.example.trackingorder.repository.TrackingLogRepo;
import com.example.trackingorder.repository.UserRepo;
import com.example.trackingorder.service.TrackingLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackingLogServiceImpl implements TrackingLogService {
    private final UserRepo userRepo;
    private final TrackingLogRepo trackingLogRepo;
    private final AuthenticationFacade authenticationFacade;
    private final OrderRepo orderRepo;
    private final TrackingLogMapper trackingLogMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TrackingHistoryRes> getTrackingHistory(String orderId) {
        User user = authenticationFacade.getCurrentUser();

        // check don hang co thuoc user
        orderRepo.findByIdAndUser(orderId, user)
                .orElseThrow(() ->
                        new NotFoundException(HttpStatus.NOT_FOUND, "Order Not Found"));

        // Lay ra tracking history
        List<TrackingLog> trackingLogs = trackingLogRepo.findByOrderId(orderId);
        log.info("Found {} tracking logs for user {}", trackingLogs.size(), user);

        return trackingLogMapper.toTrackingHistoryResList(trackingLogs);
    }
}
