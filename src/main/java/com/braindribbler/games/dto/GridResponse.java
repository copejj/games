package com.braindribbler.games.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

public record GridResponse(Meta meta, Data data) {
    public record Meta(
        boolean success,
        @JsonInclude(JsonInclude.Include.NON_NULL) Integer cardCount,
        @JsonInclude(JsonInclude.Include.NON_NULL) Integer uniqueCardCount,
        @JsonInclude(JsonInclude.Include.NON_NULL) List<String> uniqueCards,
        @JsonInclude(JsonInclude.Include.NON_NULL) String message
    ) {}

    public record Data(
        @JsonInclude(JsonInclude.Include.NON_EMPTY) List<List<String>> cards
    ) {}
}