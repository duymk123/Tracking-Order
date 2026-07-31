package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.CreateReturnReq;
import com.example.trackingorder.dto.response.ReturnRes;

import java.util.List;

public interface ReturnService {
    ReturnRes createReturn(String userId, CreateReturnReq req);
    List<ReturnRes> getReturnsByUser(String userId);
    List<ReturnRes> getReturnsByOrder(String orderId);
    ReturnRes updateReturnStatus(String returnId, String status);
}
