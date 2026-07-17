package com.example.trackingorder.exception;

import org.springframework.http.HttpStatus;

public class ForbiddenException extends RuntimeException {
    private final HttpStatus status;

    public ForbiddenException(HttpStatus status, String message) {

        super(message);
        this.status = status;
    }
}
