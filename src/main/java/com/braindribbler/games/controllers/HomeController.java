package com.braindribbler.games.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {
	@GetMapping
	public String home(Model model) {
		model.addAttribute("message", "Welcome to Brain Dribbling Games");
		return "index";
	}

}
