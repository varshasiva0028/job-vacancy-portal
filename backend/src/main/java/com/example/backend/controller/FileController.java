package com.example.backend.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
public class FileController {

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> getFile(
            @PathVariable String filename) {

        try {

            Path path = Paths.get("uploads")
                    .resolve(filename)
                    .normalize();

            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .body(resource);
            }

            return ResponseEntity.notFound().build();

        } catch (Exception e) {

            return ResponseEntity.badRequest().build();

        }
    }
}
