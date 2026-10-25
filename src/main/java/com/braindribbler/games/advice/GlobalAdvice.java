package com.braindribbler.games.advice;

import com.braindribbler.games.config.EnvironmentConfig;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.info.GitProperties;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
public class GlobalAdvice {

    @Value("${app.config.environment}")
    private EnvironmentConfig currentEnv;

    private final GitProperties gitProperties;

    GlobalAdvice(GitProperties gitProperties) {
        this.gitProperties = gitProperties;
    }

    @ModelAttribute
    public void addSiteInfo(Model model) {
        model.addAttribute("siteName", "Brain Dribbler Games");

        if (gitProperties != null) {
            String tag = gitProperties.get("closest.tag.name");
            String branch = gitProperties.getBranch();
            String fullHash = gitProperties.get("commit.id");
            String shortHash = gitProperties.getShortCommitId();
            String describe = gitProperties.get("commit.id.describe");

            String displayVersion = "Unknown";

            // 1. Separate environments cleanly at the top level
            if (currentEnv == EnvironmentConfig.DEV) {
                // --- LOCAL DEV SUITE ROUTING ---
                if (branch != null && !branch.isEmpty() && !branch.equals(fullHash)) {
                    displayVersion = branch; // Force your branch name (e.g., version-info)
                } else if (shortHash != null && !shortHash.isEmpty()) {
                    displayVersion = shortHash; // Fallback to short hash if detached
                }
            } else {
                // --- NON DEV SUITE ROUTING ---
                if (tag != null && !tag.isEmpty()) {
                    displayVersion = tag; // Always prioritize the release tag (e.g., v1.1.86)
                } else if (describe != null && !describe.isEmpty()) {
                    displayVersion = describe; // Fall back to the full describe pattern
                } else {
                    displayVersion = shortHash; // Ultimate production safety fallback
                }
            }

            model.addAttribute("gitBranch", displayVersion);
            model.addAttribute("gitHash", shortHash);
            model.addAttribute("showGitInfo", true);
        } else {
            model.addAttribute("showGitInfo", false);
        }
    }
}
