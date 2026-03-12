package com.braindribbler.games.advice;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.info.GitProperties;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
public class GlobalControllerAdvice {

    // Spring Boot automatically creates this bean if git.properties exists
    @Autowired(required = false)
    private GitProperties gitProperties;

    @ModelAttribute("showGitInfo")
    public boolean showGitInfo() {
        return gitProperties != null;
    }

    @ModelAttribute("gitBranch")
    public String gitBranch() {
        return (gitProperties != null) ? gitProperties.getBranch() : "unknown";
    }

    @ModelAttribute("gitHash")
    public String gitHash() {
        return (gitProperties != null) ? gitProperties.getShortCommitId() : "0000000";
    }
}
