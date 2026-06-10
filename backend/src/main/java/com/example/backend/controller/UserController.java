package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")
public class UserController {

    @Autowired
    private UserService service;

    // Receives Request
    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestParam String username,
            @RequestParam String password) {

        User existingUser = service.findByUsername(username);
        // return if already exists
        if (existingUser != null) {
            return ResponseEntity
                    .badRequest()
                    .body("User already exists");
        }
        // create user
        User user = new User();
        user.setUsername(username);
        user.setPassword(password);
        // save User
        service.save(user);
        // Backend sends response to frontend
        return ResponseEntity.ok("Registration Successful");
    }

    // Receives Request
    @PostMapping("/login")
    public ResponseEntity<String> login(
            @RequestParam String username,
            @RequestParam String password) {
        // Controller calls
        User user = service.findByUsername(username);
        // return if user not found
        if (user == null) {
            return ResponseEntity
                    .badRequest()
                    .body("User not found");
        }
        // checks
        if (!user.getPassword().equals(password)) {
            return ResponseEntity
                    .badRequest()
                    .body("Invalid Password");
        }

        return ResponseEntity.ok("Login Successful");
    }
}