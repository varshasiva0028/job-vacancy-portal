package com.example.backend.controller;

import com.example.backend.entity.Applicant;
import com.example.backend.repository.ApplicantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    @Autowired
    private ApplicantRepository applicantRepository;

    @GetMapping
    public ResponseEntity<?> getHomeDetails(
            Authentication authentication) {

        Applicant applicant
                = applicantRepository.findByUsername(
                        authentication.getName()
                );

        Map<String, Object> response
                = new HashMap<>();

        response.put("name", applicant.getName());
        response.put("dob", applicant.getDob());
        response.put("companies", applicant.getCompanies());
        response.put("languages", applicant.getLanguages());

        return ResponseEntity.ok(response);
    }
}
