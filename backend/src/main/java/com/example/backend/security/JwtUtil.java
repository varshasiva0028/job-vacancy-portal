package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.util.Date;

public class JwtUtil {
// Secret key for signing the JWT token

    private static final String SECRET
            = "mySecretKeyForJobPortalApplication123456789";
// Create a SecretKey object from the secret string
    private static final SecretKey KEY
            = Keys.hmacShaKeyFor(SECRET.getBytes());
// Generate a JWT token with username and role as claims

    public static String generateToken(String username, String role) {

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .issuedAt(new Date())
                // Set the token expiration time to 24 hours
                .expiration(
                        new Date(System.currentTimeMillis()
                                + 1000 * 60 * 60 * 24))
                .signWith(KEY)
                .compact();
    }

    public static Claims extractClaims(String token) {

        return Jwts.parser()
                // Verify the token with the secret key
                .verifyWith(KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

}
