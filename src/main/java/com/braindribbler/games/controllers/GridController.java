package com.braindribbler.games.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.braindribbler.games.dto.GridResponse;
import com.braindribbler.games.service.GridService;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@RestController
public class GridController {
    private final GridService gridService;

    public GridController(GridService gridService) {
        this.gridService = gridService;
    }

    @GetMapping("/code-challenge/card-grid")
    public GridResponse getCardGrid(
            @RequestParam @Min(1) @Max(5) int rows, 
            @RequestParam @Min(1) @Max(5) int columns) {
        
        // Custom Business Rule: Total cards must be even for a matching game
        if (rows % 2 != 0 && columns % 2 != 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                "Either rows or columns value must be even to be valid."
            );
        }

        return gridService.createGrid(rows, columns);
    }
}
