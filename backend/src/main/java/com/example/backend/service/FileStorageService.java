package com.example.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.io.File;

@Service
public class FileStorageService {

    public String saveFile(
            MultipartFile file,
            String uploadDir,
            String uniqueId,
            String prefix) throws Exception {

        String fileName
                = uniqueId + "_" + prefix + "_" + file.getOriginalFilename();

        Path path = Paths.get(uploadDir, fileName);

        Files.copy(
                file.getInputStream(),
                path,
                StandardCopyOption.REPLACE_EXISTING
        );

        return fileName;
    }

    public String savePhotos(
            MultipartFile[] photos,
            String uploadDir,
            String uniqueId) throws Exception {

        StringBuilder photoNames = new StringBuilder();

        for (MultipartFile img : photos) {

            String photoFileName
                    = uniqueId + "_photo_" + img.getOriginalFilename();

            Path photoPath
                    = Paths.get(uploadDir, photoFileName);

            Files.copy(
                    img.getInputStream(),
                    photoPath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            photoNames.append(photoFileName).append(",");

        }

        return photoNames.toString();
    }

    public void deleteFile(String uploadDir, String fileName) {

        if (fileName == null || fileName.isBlank()) {
            return;
        }

        try {

            Files.deleteIfExists(
                    Paths.get(uploadDir, fileName)
            );

        } catch (Exception e) {

            e.printStackTrace();

        }

    }

    public String getUploadDirectory() {

        String uploadDir
                = System.getProperty("user.dir")
                + File.separator
                + "uploads";

        File dir = new File(uploadDir);

        if (!dir.exists()) {
            dir.mkdirs();
        }

        return uploadDir;
    }

}
