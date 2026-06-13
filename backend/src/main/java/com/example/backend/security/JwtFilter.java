package com.example.backend.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

public class JwtFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // Read Authorization header
        String authHeader = request.getHeader("Authorization");

        // Check whether it starts with Bearer
        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            // Remove "Bearer "
            String token = authHeader.substring(7);

            // Extract claims
            Claims claims = JwtUtil.extractClaims(token);

            // Get username from token
            String username = claims.getSubject();

            System.out.println("===== JWT FILTER =====");
            System.out.println("Username : " + username);

            // Create Authentication object
            UsernamePasswordAuthenticationToken authentication
                    = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            Collections.emptyList()
                    );

            // Attach request details
            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            // Store authentication inside SecurityContext
            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);
        }

        // Continue request
        filterChain.doFilter(request, response);
    }
}
