package com.example.trackingorder.service.impl;

import com.example.trackingorder.common.StatusReturnEnum;
import com.example.trackingorder.config.basicauthconfig.AuthenticationFacade;
import com.example.trackingorder.configmapper.ReturnMapper;
import com.example.trackingorder.dto.request.CreateReturnReq;
import com.example.trackingorder.dto.response.ReturnRes;
import com.example.trackingorder.entity.Order;
import com.example.trackingorder.entity.Return;
import com.example.trackingorder.entity.User;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.OrderRepo;
import com.example.trackingorder.repository.ReturnRepo;
import com.example.trackingorder.repository.UserRepo;
import com.example.trackingorder.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReturnServiceImpl implements ReturnService {

    private final ReturnRepo returnRepo;
    private final OrderRepo orderRepo;
    private final UserRepo userRepo;
    private final ReturnMapper mapper;
    private final AuthenticationFacade authenticationFacade;

    @Override
    public ReturnRes createReturn(CreateReturnReq req) {
        User user = authenticationFacade.getCurrentUser();

        Order order = orderRepo.findById(req.getOrderId())
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Order not found"));

        Return returnEntity = new Return();
        returnEntity.setUser(user);
        returnEntity.setOrder(order);
        returnEntity.setReason(req.getReason());
        returnEntity.setOriginType(req.getOriginType());
        returnEntity.setStatus(StatusReturnEnum.PENDING);
        // Assuming refundAmount is order's grand total for simplicity. Should be calculated based on business logic.
        returnEntity.setRefundAmount(order.getGrandTotal());
        returnEntity.setNotes(req.getNotes());
        
        returnEntity = returnRepo.save(returnEntity);
        return mapper.toReturnRes(returnEntity);
    }

    @Override
    public List<ReturnRes> getReturnsByUser(String userId) {
        return returnRepo.findByUserId(userId)
                .stream()
                .map(mapper::toReturnRes)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReturnRes> getReturnsByOrder(String orderId) {
        return returnRepo.findByOrderId(orderId)
                .stream()
                .map(mapper::toReturnRes)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReturnRes> getAllReturns() {
        return returnRepo.findAll()
                .stream()
                .map(mapper::toReturnRes)
                .collect(Collectors.toList());
    }

    @Override
    public ReturnRes updateReturnStatus(String returnId, String status) {
        Return returnEntity = returnRepo.findById(returnId)
                .orElseThrow(() -> new NotFoundException(HttpStatus.NOT_FOUND, "Return not found"));
        
        returnEntity.setStatus(StatusReturnEnum.valueOf(status.toUpperCase()));
        returnEntity = returnRepo.save(returnEntity);
        return mapper.toReturnRes(returnEntity);
    }
}
