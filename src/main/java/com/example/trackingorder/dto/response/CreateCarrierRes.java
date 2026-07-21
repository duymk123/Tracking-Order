package com.example.trackingorder.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CreateCarrierRes {
    private String id;

    private String message;
}
