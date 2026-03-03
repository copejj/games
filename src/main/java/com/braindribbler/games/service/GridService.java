package com.braindribbler.games.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.braindribbler.games.dto.GridResponse;

@Service
public class GridService {
    private final String[] ALL_CARDS = {"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R"};

    public GridResponse createGrid(int rows, int columns) {
        int total = rows * columns;
        int uniqueCount = total / 2;

        // 1. Pick unique cards and double them
        List<String> deck = new ArrayList<>(Arrays.asList(ALL_CARDS).subList(0, uniqueCount));
        List<String> uniqueList = new ArrayList<>(deck);
        deck.addAll(uniqueList);
        
        // 2. Shuffle
        Collections.shuffle(deck);

        // 3. Chunk into 2D array (rows x columns)
        List<List<String>> grid = new ArrayList<>();
        for (int i = 0; i < rows; i++) {
            grid.add(deck.subList(i * columns, (i + 1) * columns));
        }

        return new GridResponse(
            new GridResponse.Meta(true, total, uniqueCount, uniqueList, null),
            new GridResponse.Data(grid)
        );
    }
}
