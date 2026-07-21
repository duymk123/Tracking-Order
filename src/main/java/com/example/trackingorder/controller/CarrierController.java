package com.example.trackingorder.controller;

import com.example.trackingorder.dto.request.CreateCarrierReq;
import com.example.trackingorder.dto.request.UpdateCarrierReq;
import com.example.trackingorder.dto.response.CarrierRes;
import com.example.trackingorder.dto.response.CreateCarrierRes;
import com.example.trackingorder.service.CarrierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/ap1/v1/carriers")
@Validated
public class CarrierController {
    private final CarrierService carrierService;

    @GetMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<CarrierRes>> getAll() {
        return ResponseEntity.ok(carrierService.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<CarrierRes> getById(@PathVariable String id) {
        return ResponseEntity.ok(carrierService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<CreateCarrierRes> createCarrier(
            @RequestBody @Valid CreateCarrierReq req) {

        CreateCarrierRes createCarrierRes = carrierService.createCarrier(req);

        return ResponseEntity.ok(createCarrierRes);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<CarrierRes> updateCarrier(
            @PathVariable String id,
            @RequestBody @Valid UpdateCarrierReq req) {

        return ResponseEntity.ok(carrierService.updateCarrier(id, req));
    }

    @PatchMapping("/{id}/active")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> active(@PathVariable String id) {

        carrierService.active(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/inactive")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> inactive(@PathVariable String id) {

        carrierService.inactive(id);
        return ResponseEntity.noContent().build();
    }
}
