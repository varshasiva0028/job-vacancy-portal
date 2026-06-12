package com.example.backend.controller;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.entity.Applicant;
import com.example.backend.security.JwtUtil;
import com.example.backend.service.ApplicantService;

import io.jsonwebtoken.Claims;

@RestController
@RequestMapping("/api/applicants")
@CrossOrigin(origins = "http://localhost:4200")
public class ApplicantController {

    @Autowired
    private ApplicantService service;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<String> createApplicant(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("qualification") String qualification,
            @RequestParam("gender") String gender,
            @RequestParam("languages") String languages,
            @RequestParam("companies") String companies,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "marksheet", required = false) MultipartFile marksheet) {
        String token = authHeader.replace("Bearer ", "");

        Claims claims = JwtUtil.extractClaims(token);

        String username = claims.getSubject();

        try {

            if (name == null || email == null || phone == null || qualification == null
                    || name.trim().isEmpty() || email.trim().isEmpty()
                    || phone.trim().isEmpty() || qualification.trim().isEmpty()) {

                return ResponseEntity.badRequest().body("All fields are required");
            }

            if (resume == null || resume.isEmpty()) {
                return ResponseEntity.badRequest().body("Resume file is missing");
            }

            if (photo == null || photo.isEmpty()) {
                return ResponseEntity.badRequest().body("Photo file is missing");
            }

            if (marksheet == null || marksheet.isEmpty()) {
                return ResponseEntity.badRequest().body("Marksheet file is missing");
            }
            Applicant existingApplicant = service.getApplicantByEmail(email.trim());

            if (existingApplicant != null) {
                return ResponseEntity
                        .badRequest()
                        .body("Email ID already exists. Application already submitted.");
            }

            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";

            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String uniqueId = UUID.randomUUID().toString();

            String resumeFileName = uniqueId + "_resume_" + resume.getOriginalFilename();
            String photoFileName = uniqueId + "_photo_" + photo.getOriginalFilename();
            String marksheetFileName = uniqueId + "_marksheet_" + marksheet.getOriginalFilename();

            Path resumePath = Paths.get(uploadDir, resumeFileName);
            Path photoPath = Paths.get(uploadDir, photoFileName);
            Path marksheetPath = Paths.get(uploadDir, marksheetFileName);

            Files.copy(resume.getInputStream(), resumePath, StandardCopyOption.REPLACE_EXISTING);
            Files.copy(photo.getInputStream(), photoPath, StandardCopyOption.REPLACE_EXISTING);
            Files.copy(marksheet.getInputStream(), marksheetPath, StandardCopyOption.REPLACE_EXISTING);

            Applicant applicant = new Applicant();

            applicant.setName(name.trim());
            applicant.setUsername(username);
            applicant.setEmail(email.trim());
            applicant.setPhone(phone.trim());
            applicant.setQualification(qualification.trim());
            applicant.setGender(gender.trim());
            applicant.setLanguages(languages.trim());
            applicant.setCompanies(companies.trim());
            applicant.setResumePath(resumeFileName);
            applicant.setPhotoPath(photoFileName);
            applicant.setMarksheetPath(marksheetFileName);

            service.save(applicant);

            return ResponseEntity.ok("Application Submitted Successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error while uploading: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Applicant>> getAllApplicants(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");

        Claims claims = JwtUtil.extractClaims(token);

        String username = claims.getSubject();

        String role = claims.get("role", String.class);

        if ("ADMIN".equals(role)) {

            return ResponseEntity.ok(
                    service.getAllApplicants()
            );

        }

        Applicant applicant
                = service.getApplicantByUsername(username);

        if (applicant == null) {

            return ResponseEntity.ok(
                    Collections.emptyList()
            );

        }

        return ResponseEntity.ok(
                Collections.singletonList(applicant)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Applicant> getApplicantById(@PathVariable Long id) {

        Applicant applicant = service.getApplicantById(id);

        if (applicant == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(applicant);
    }

    @GetMapping("/my")
    public ResponseEntity<?> myApplication(
            @RequestHeader("Authorization") String authHeader) {

        String token = authHeader.replace("Bearer ", "");

        Claims claims = JwtUtil.extractClaims(token);

        String username = claims.getSubject();

        Applicant applicant
                = service.getApplicantByUsername(username);

        if (applicant == null) {

            return ResponseEntity.notFound().build();

        }

        return ResponseEntity.ok(applicant);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<String> updateApplicant(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("qualification") String qualification,
            @RequestParam("gender") String gender,
            @RequestParam("languages") String languages,
            @RequestParam("companies") String companies,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @RequestParam(value = "photo", required = false) MultipartFile photo,
            @RequestParam(value = "marksheet", required = false) MultipartFile marksheet) {

        try {

            Applicant applicant = service.getApplicantById(id);

            if (applicant == null) {
                return ResponseEntity.notFound().build();
            }

            if (name == null || email == null || phone == null || qualification == null
                    || name.trim().isEmpty() || email.trim().isEmpty()
                    || phone.trim().isEmpty() || qualification.trim().isEmpty()) {

                return ResponseEntity.badRequest().body("All text fields are required");
            }

            applicant.setName(name.trim());
            applicant.setEmail(email.trim());
            applicant.setPhone(phone.trim());
            applicant.setQualification(qualification.trim());
            applicant.setGender(gender.trim());
            applicant.setLanguages(languages.trim());
            applicant.setCompanies(companies.trim());

            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";

            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String uniqueId = UUID.randomUUID().toString();

            if (resume != null && !resume.isEmpty()) {

                try {
                    if (applicant.getResumePath() != null) {
                        Files.deleteIfExists(Paths.get(uploadDir, applicant.getResumePath()));
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }

                String resumeFileName = uniqueId + "_resume_" + resume.getOriginalFilename();
                Path resumePath = Paths.get(uploadDir, resumeFileName);

                Files.copy(resume.getInputStream(),
                        resumePath,
                        StandardCopyOption.REPLACE_EXISTING);

                applicant.setResumePath(resumeFileName);
            }

            if (photo != null && !photo.isEmpty()) {

                try {
                    if (applicant.getPhotoPath() != null) {
                        Files.deleteIfExists(Paths.get(uploadDir, applicant.getPhotoPath()));
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }

                String photoFileName = uniqueId + "_photo_" + photo.getOriginalFilename();
                Path photoPath = Paths.get(uploadDir, photoFileName);

                Files.copy(photo.getInputStream(),
                        photoPath,
                        StandardCopyOption.REPLACE_EXISTING);

                applicant.setPhotoPath(photoFileName);
            }

            if (marksheet != null && !marksheet.isEmpty()) {

                try {
                    if (applicant.getMarksheetPath() != null) {
                        Files.deleteIfExists(Paths.get(uploadDir, applicant.getMarksheetPath()));
                    }
                } catch (Exception ex) {
                    ex.printStackTrace();
                }

                String marksheetFileName = uniqueId + "_marksheet_" + marksheet.getOriginalFilename();
                Path marksheetPath = Paths.get(uploadDir, marksheetFileName);

                Files.copy(marksheet.getInputStream(),
                        marksheetPath,
                        StandardCopyOption.REPLACE_EXISTING);

                applicant.setMarksheetPath(marksheetFileName);
            }

            service.save(applicant);

            return ResponseEntity.ok("Applicant Updated Successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error while updating: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteApplicant(
            @PathVariable Long id) {

        Applicant applicant = service.getApplicantById(id);

        if (applicant == null) {
            return ResponseEntity
                    .badRequest()
                    .body("Applicant not found");
        }

        service.deleteApplicant(id);

        return ResponseEntity.ok(
                "Applicant deleted successfully");
    }
}
