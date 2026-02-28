package com.braindribbler.games.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class WebConfig {

    @Value("${app.api.base-url}")
    private String gamesBaseUrl;

    @Bean
    public RestClient gamesClient() {
        return RestClient.builder()
                .baseUrl(gamesBaseUrl)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
