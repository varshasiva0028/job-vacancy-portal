package com.example.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                // Allow PDFs/images to be displayed inside iframe
                .headers(headers
                        -> headers.frameOptions(
                        frame -> frame.disable()
                )
                )
                .sessionManagement(session
                        -> session.sessionCreationPolicy(
                        SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                // Public APIs
                .requestMatchers(
                        "/api/users/login",
                        "/api/users/register",
                        "/uploads/**"
                ).permitAll()
                // Admin APIs
                .requestMatchers(
                        "/api/admin/**"
                ).hasRole("ADMIN")
                // Everything else requires login
                .anyRequest().authenticated()
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            System.err.println("[DEBUG-SecurityConfig] AuthenticationEntryPoint triggered! Reason: " + authException.getMessage());
                            response.sendError(403, "Forbidden: Unauthenticated");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            System.err.println("[DEBUG-SecurityConfig] AccessDeniedHandler triggered! Reason: " + accessDeniedException.getMessage());
                            response.sendError(403, "Forbidden: Unauthorized");
                        })
                )
                // Execute JwtFilter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(
                        new JwtFilter(),
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration
                = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:4200"));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                ));

        configuration.setAllowedHeaders(
                List.of(
                        "Authorization",
                        "Content-Type"
                ));

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source
                = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration);

        return source;
    }
}
