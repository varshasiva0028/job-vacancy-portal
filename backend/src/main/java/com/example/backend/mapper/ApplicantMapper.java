package com.example.backend.mapper;

import java.time.LocalDate;

import org.springframework.stereotype.Component;

import com.example.backend.entity.Applicant;

@Component
public class ApplicantMapper {

    public void mapApplicantDetails(
            Applicant applicant,
            String name,
            String email,
            String phone,
            String qualification,
            LocalDate dob,
            String gender,
            String languages,
            String companies) {

        applicant.setName(name.trim());
        applicant.setEmail(email.trim());
        applicant.setPhone(phone.trim());
        applicant.setQualification(qualification.trim());
        applicant.setDob(dob);
        applicant.setGender(gender.trim());
        applicant.setLanguages(languages.trim());

        if (companies != null) {
            applicant.setCompanies(companies.trim());
        }
    }
}
