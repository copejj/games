package com.braindribbler.games.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.server.ResponseStatusException;

import com.braindribbler.games.dto.GridResponse;

import jakarta.validation.ConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {
	
	@ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<GridResponse> handleValidationErrors(ConstraintViolationException ex) {
		return getResponse("Rows and columns must be between 1 and 5 inclusive.", HttpStatus.BAD_REQUEST);
    }

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<GridResponse> handleResponseStatusException(ResponseStatusException ex) {
		return getResponse(ex.getReason() != null ? ex.getReason(): "An unexpected error occurred", ex.getStatusCode());
	}

	private ResponseEntity<GridResponse> getResponse(String message, HttpStatusCode statusCode) {
		GridResponse.Meta meta = new GridResponse.Meta(false, null, null, null, message);
		GridResponse response = new GridResponse(meta, new GridResponse.Data(null));

		return new ResponseEntity<>(response, statusCode);
	}
}
