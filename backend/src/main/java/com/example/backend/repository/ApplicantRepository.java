package com.example.backend.repository;

import com.example.backend.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicantRepository extends JpaRepository<Applicant, Long> {

    Applicant findByEmail(String email);

    Applicant findByUsername(String username);

}
