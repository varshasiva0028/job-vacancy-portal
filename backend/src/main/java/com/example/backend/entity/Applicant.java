package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Applicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String email;

    private String phone;

    private String qualification;

    private String resumePath;

    private String photoPath;

    private String marksheetPath;

    private LocalDateTime createdAt = LocalDateTime.now();
}