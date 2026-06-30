package com.example.backend.controller;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.mapper.ApplicantMapper;
import com.example.backend.validation.ApplicantValidator;
import com.example.backend.service.FileStorageService;
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

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ApplicantValidator applicantValidator;
    @Autowired
    private ApplicantMapper applicantMapper;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<String> createApplicant(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("qualification") String qualification,
            @RequestParam("dob") LocalDate dob,
            @RequestParam("gender") String gender,
            @RequestParam("languages") String languages,
            @RequestParam(value = "companies", required = false) String companies,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @RequestParam("photos") MultipartFile[] photos,
            @RequestParam(value = "marksheet", required = false) MultipartFile marksheet) {
        // Extract the JWT token from the Authorization header
        String token = authHeader.replace("Bearer ", "");
        // Extract claims from the token to get the username
        Claims claims = JwtUtil.extractClaims(token);
        // Get the username from the claims
        String username = claims.getSubject();
        // Check if the user has already submitted an application using the email
        try {

            if (name == null || email == null || phone == null || qualification == null
                    || name.trim().isEmpty() || email.trim().isEmpty()
                    || phone.trim().isEmpty() || qualification.trim().isEmpty()) {

                return ResponseEntity.badRequest().body("All fields are required");
            }
            if (!applicantValidator.isValidDocument(resume)) {

                return ResponseEntity.badRequest()
                        .body("Resume must be a PDF or Word document");

            }

            if (!applicantValidator.isValidDocument(marksheet)) {

                return ResponseEntity.badRequest()
                        .body("Marksheet must be a PDF or Word document");

            }

            if (resume == null || resume.isEmpty()) {
                return ResponseEntity.badRequest().body("Resume file is missing");
            }

            if (photos == null || photos.length == 0) {
                return ResponseEntity.badRequest().body("Atleast one Photo is Required");
            }

            if (!applicantValidator.hasValidPhotoCount(photos)) {
                return ResponseEntity.badRequest().body("Maximum 3 Photos");
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

            String uploadDir = fileStorageService.getUploadDirectory();
            String uniqueId = UUID.randomUUID().toString();
            String resumeFileName = fileStorageService.saveFile(resume, uploadDir, uniqueId, "resume");
            String marksheetFileName = fileStorageService.saveFile(marksheet, uploadDir, uniqueId, "marksheet");
            String photoNames = fileStorageService.savePhotos(photos, uploadDir, uniqueId);
            System.out.println("Photos received = " + photos.length);
            Applicant applicant = new Applicant();
            applicantMapper.mapApplicantDetails(
                    applicant,
                    name,
                    email,
                    phone,
                    qualification,
                    dob,
                    gender,
                    languages,
                    companies
            );
            applicant.setResumePath(resumeFileName);
            applicant.setPhotoPaths(photoNames);
            String[] uploadedPhotos = photoNames.split(",");
            if (uploadedPhotos.length > 0) {
                applicant.setProfilePhoto(uploadedPhotos[0]);
            }
            applicant.setMarksheetPath(marksheetFileName);
            applicant.setUpdatedAt(LocalDateTime.now());
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
// If the user has ADMIN role, return all applicants, otherwise return only the applicant's own application
        if ("ADMIN".equals(role)) {
            return ResponseEntity.ok(
                    service.getAllApplicants()
            );
        }
        Applicant applicant = service.getApplicantByUsername(username);
        if (applicant == null) {
            return ResponseEntity.ok(
                    Collections.emptyList()
            );
        }
        return ResponseEntity.ok(
                Collections.singletonList(applicant)
        );
    }
// Get applicant by ID (only for admin or the applicant themselves)

    @GetMapping("/{id}")
    public ResponseEntity<Applicant> getApplicantById(@PathVariable Long id) {
        Applicant applicant = service.getApplicantById(id);
        if (applicant == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(applicant);
    }
// Get the logged-in applicant's own application details

    @GetMapping("/my")
    public ResponseEntity<?> getMyApplication(
            Authentication authentication) {
        String username = authentication.getName();
        Applicant applicant = service.getApplicantByUsername(username);
        if (applicant == null) {
            applicant = service.getApplicantByEmail(username);
        }
        if (applicant == null) {
            return ResponseEntity
                    .notFound()
                    .build();
        }
        return ResponseEntity.ok(applicant);
    }
// Update applicant details (only for admin or the applicant themselves)

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<String> updateApplicant(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("phone") String phone,
            @RequestParam("qualification") String qualification,
            @RequestParam("dob") LocalDate dob,
            @RequestParam("gender") String gender,
            @RequestParam("languages") String languages,
            @RequestParam(value = "companies", required = false) String companies,
            @RequestParam(value = "resume", required = false) MultipartFile resume,
            @RequestParam(value = "photos", required = false) MultipartFile[] photos,
            @RequestParam(value = "marksheet", required = false) MultipartFile marksheet) {

        System.out.println("[DEBUG-Controller] reached updateApplicant for ID: " + id);
        try {
            Applicant applicant = service.getApplicantById(id);
            if (applicant == null) {
                return ResponseEntity.notFound().build();
            }
            // Resume validation
            if (!applicantValidator.isValidDocument(resume)) {

                return ResponseEntity.badRequest()
                        .body("Resume must be a PDF or Word document");

            }
            // Marksheet validation
            if (!applicantValidator.isValidDocument(marksheet)) {

                return ResponseEntity.badRequest()
                        .body("Marksheet must be a PDF or Word document");
            }
            if (name == null || email == null || phone == null || qualification == null
                    || name.trim().isEmpty() || email.trim().isEmpty()
                    || phone.trim().isEmpty() || qualification.trim().isEmpty()) {

                return ResponseEntity.badRequest().body("All text fields are required");
            }
            applicantMapper.mapApplicantDetails(
                    applicant,
                    name,
                    email,
                    phone,
                    qualification,
                    dob,
                    gender,
                    languages,
                    companies
            );
            // Handle file uploads and updates
            String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String uniqueId = UUID.randomUUID().toString();
            if (resume != null && !resume.isEmpty()) {
                fileStorageService.deleteFile(uploadDir, applicant.getResumePath());
                String resumeFileName = fileStorageService.saveFile(resume, uploadDir, uniqueId, "resume");
                applicant.setResumePath(resumeFileName);
            }

            if (photos != null && photos.length > 0) {
                if (applicant.getPhotoPaths() != null) {
                    String[] oldPhotos = applicant.getPhotoPaths().split(",");
                    for (String oldPhoto : oldPhotos) {
                        fileStorageService.deleteFile(uploadDir, oldPhoto);
                    }
                }
                String photoNames = fileStorageService.savePhotos(photos, uploadDir, uniqueId);
                applicant.setPhotoPaths(photoNames);
                String[] uploadedPhotos = photoNames.split(",");
                if (uploadedPhotos.length > 0) {
                    applicant.setProfilePhoto(uploadedPhotos[0]);
                }
            }

            if (marksheet != null && !marksheet.isEmpty()) {
                fileStorageService.deleteFile(uploadDir, applicant.getMarksheetPath());
                String marksheetFileName = fileStorageService.saveFile(marksheet, uploadDir, uniqueId, "marksheet");
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

    @PutMapping("/{id}/profile-photo")
    public ResponseEntity<String> updateProfilePhoto(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> request) {

        Applicant applicant = service.getApplicantById(id);
        if (applicant == null) {
            return ResponseEntity.notFound().build();
        }
        applicant.setProfilePhoto(request.get("profilePhoto"));
        service.save(applicant);
        return ResponseEntity.ok("Profile photo updated successfully");
    }
}
