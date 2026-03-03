package com.braindribbler.games.controllers;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DebugController {
    // Inject the context path property
    @Value("${server.servlet.context-path:NOT_SET}")
    private String contextPath;

    @GetMapping("/test-path")
    public String showPath() {
        return "The loaded context path is: " + contextPath;
    }
}
