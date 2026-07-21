package com.example.trackingorder.service;

import com.example.trackingorder.dto.request.CreateCarrierReq;
import com.example.trackingorder.dto.request.UpdateCarrierReq;
import com.example.trackingorder.dto.response.CarrierRes;
import com.example.trackingorder.dto.response.CreateCarrierRes;
import com.example.trackingorder.entity.Carrier;

import java.util.List;

public interface CarrierService {
    List<CarrierRes> getAll();

    CarrierRes getById(String id);

    CreateCarrierRes createCarrier(CreateCarrierReq req);

    CarrierRes updateCarrier(String id,UpdateCarrierReq req);

    void active(String id);
    void inactive(String id);

}
