package com.braindribbler.games.controllers.games;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/games")
public class RummyController {

    @GetMapping("/rummy")
    public String showScorekeeper(Model model) {
        // You can pass dynamic data here if you ever decide to 
        // pre-load existing player names or game settings
        model.addAttribute("pageTitle", "Live Scorekeeper");
        return "games/rummy"; // This looks for scorekeeper.html in /templates
	}

	@GetMapping
	public String games(Model model) {
        model.addAttribute("pageTitle", "Available Scorekeepers");
		return "games/index";
    }
}
