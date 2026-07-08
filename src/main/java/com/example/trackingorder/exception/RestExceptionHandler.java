package com.example.trackingorder.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
@Slf4j
public class RestExceptionHandler extends ResponseEntityExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorRes> handleNotFoundException(NotFoundException exception) {
        ErrorRes errorResponse = new ErrorRes(exception.getStatus().value(), exception.getMessage());

        return new ResponseEntity<>(errorResponse, exception.getStatus());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorRes> handleBadRequestException(BadRequestException exception) {
        ErrorRes errorResponse = new ErrorRes(exception.getStatus().value(), exception.getMessage());

        return new ResponseEntity<>(errorResponse, exception.getStatus());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRes> handleAllExceptions(Exception exception) {

        exception.printStackTrace();   // THÊM DÒNG NÀY

        log.error("Unhandled exception", exception);

        ErrorRes errorResponse =
                new ErrorRes(500, exception.getClass().getName());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorResponse);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(  //Exception Valid
                                                                    MethodArgumentNotValidException ex,
                                                                    HttpHeaders headers,
                                                                    HttpStatusCode status,
                                                                    WebRequest request) {

        String message = ex.getBindingResult().getFieldError().getDefaultMessage();
        int code = 400;

        ErrorRes errorResponse = new ErrorRes(code, message);

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
