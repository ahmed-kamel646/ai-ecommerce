package com.ahmed.ecommerce.common;

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
