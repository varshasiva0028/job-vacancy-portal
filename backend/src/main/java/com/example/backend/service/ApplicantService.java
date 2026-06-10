package com.example.backend.service;

import com.example.backend.entity.Applicant;
import com.example.backend.repository.ApplicantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicantService {

    @Autowired
    private ApplicantRepository repo;

    public Applicant getApplicantByEmail(String email) {
        return repo.findByEmail(email);
    }

    public Applicant save(Applicant applicant) {

        return repo.save(applicant);
    }

    public List<Applicant> getAllApplicants() {
        return repo.findAll();
    }

    public Applicant getApplicantById(Long id) {
        return repo.findById(id).orElse(null);
    }

    public Applicant updateApplicant(Long id, Applicant updatedApplicant) {

        Applicant existingApplicant = repo.findById(id).orElse(null);

        if (existingApplicant == null) {
            return null;
        }

        existingApplicant.setName(updatedApplicant.getName());
        existingApplicant.setEmail(updatedApplicant.getEmail());
        existingApplicant.setPhone(updatedApplicant.getPhone());
        existingApplicant.setQualification(updatedApplicant.getQualification());

        return repo.save(existingApplicant);
    }
}