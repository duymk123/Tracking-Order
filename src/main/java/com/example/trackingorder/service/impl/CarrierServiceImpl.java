package com.example.trackingorder.service.impl;

import com.example.trackingorder.configmapper.CarrierMapper;
import com.example.trackingorder.dto.request.CreateCarrierReq;
import com.example.trackingorder.dto.request.UpdateCarrierReq;
import com.example.trackingorder.dto.response.CarrierRes;
import com.example.trackingorder.dto.response.CreateCarrierRes;
import com.example.trackingorder.entity.Carrier;
import com.example.trackingorder.exception.BadRequestException;
import com.example.trackingorder.exception.NotFoundException;
import com.example.trackingorder.repository.CarrierRepo;
import com.example.trackingorder.service.CarrierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CarrierServiceImpl implements CarrierService {
    private final CarrierRepo carrierRepo;
    private final CarrierMapper carrierMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CarrierRes> getAll() {
        List<Carrier> carriers = carrierRepo.findAll();
        log.info("carriers size {}", carriers.size());
        return carrierMapper.toCarrierResList(carriers);
    }

    @Override
    @Transactional(readOnly = true)
    public CarrierRes getById(String id) {
        Carrier carrier = carrierRepo.findById(id)
                .orElseThrow(() ->
                        new NotFoundException(HttpStatus.NOT_FOUND, "Carrier not found"));

        return carrierMapper.toCarrierRes(carrier);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CreateCarrierRes createCarrier(CreateCarrierReq req) {
        if (carrierRepo.findByName(req.getName()).isPresent()) {
            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Carrier already exists");
        }

        Carrier carrier = carrierMapper.toCarrier(req);

        carrier.setActive(true);

        carrierRepo.save(carrier);

        log.info("Carrier {} created successfully", carrier.getName());

        return CreateCarrierRes.builder()
                .id(carrier.getId())
                .message("Carrier created successfully")
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CarrierRes updateCarrier(String id, UpdateCarrierReq req) {
        Carrier carrier = carrierRepo.findById(id)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Carrier not found"));

        Optional<Carrier> existedCarrier = carrierRepo.findByName(req.getName());

        if (existedCarrier.isPresent()
                && !existedCarrier.get().getId().equals(id)) {

            throw new BadRequestException(
                    HttpStatus.BAD_REQUEST,
                    "Carrier already exists");
        }

        carrier.setName(req.getName());
        carrier.setApiEndpoint(req.getApiEndpoint());
        carrier.setSupportRegions(req.getSupportRegions());


        carrierRepo.save(carrier);

        log.info("Carrier {} updated successfully", carrier.getName());

        return carrierMapper.toCarrierRes(carrier);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void active(String id) {
        Carrier carrier = carrierRepo.findById(id)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Carrier not found"));

        carrier.setActive(true);

        carrierRepo.save(carrier);

        log.info("Carrier {} activated", carrier.getName());

    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void inactive(String id) {
        Carrier carrier = carrierRepo.findById(id)
                .orElseThrow(() ->
                        new NotFoundException(
                                HttpStatus.NOT_FOUND,
                                "Carrier not found"));

        carrier.setActive(false);

        carrierRepo.save(carrier);

        log.info("Carrier {} deactivated", carrier.getName());
    }

}

