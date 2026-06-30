package com.example.backend.validation;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class ApplicantValidator {

    /**
     * Validate Resume / Marksheet document
     */
    public boolean isValidDocument(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return true;
        }

        String type = file.getContentType();

        return "application/pdf".equals(type)
                || "application/msword".equals(type)
                || "application/vnd.openxmlformats-officedocument.wordprocessingml.document".equals(type);
    }

    /**
     * Validate uploaded image
     */
    public boolean isValidImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return true;
        }

        String type = file.getContentType();

        return type != null && type.startsWith("image/");
    }

    /**
     * Validate all uploaded photos
     */
    public boolean areValidPhotos(MultipartFile[] photos) {

        if (photos == null) {
            return true;
        }

        for (MultipartFile photo : photos) {

            if (!isValidImage(photo)) {
                return false;
            }

        }

        return true;
    }

    /**
     * Maximum 3 photos
     */
    public boolean hasValidPhotoCount(MultipartFile[] photos) {

        return photos == null || photos.length <= 3;
    }

    /**
     * Required text
     */
    public boolean hasText(String value) {

        return value != null && !value.trim().isEmpty();
    }

    /**
     * Email validation
     */
    public boolean isValidEmail(String email) {

        if (!hasText(email)) {
            return false;
        }

        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }

    /**
     * Phone validation
     */
    public boolean isValidPhone(String phone) {

        if (!hasText(phone)) {
            return false;
        }

        return phone.matches("\\d{10}");
    }

    /**
     * Qualification validation
     */
    public boolean isValidQualification(String qualification) {

        return hasText(qualification);
    }

    /**
     * Gender validation
     */
    public boolean isValidGender(String gender) {

        return hasText(gender);
    }

    /**
     * Languages validation
     */
    public boolean isValidLanguages(String languages) {

        return hasText(languages);
    }

    /**
     * Companies validation
     */
    public boolean isValidCompanies(String companies) {

        return companies == null || !companies.trim().isEmpty();
    }

}
