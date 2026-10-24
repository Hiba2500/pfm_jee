package com.lias.lab.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // --- Authenticated auth endpoints (change password)
                .requestMatchers("/api/auth/mot-de-passe").authenticated()
                // --- Public (visiteurs, section 2.1) : présentation, équipes, activités, publications
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/applications").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/events/*/participate").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/lab-info", "/api/teams/**", "/api/publications/**",
                        "/api/events/**", "/api/members", "/api/search", "/api/search/**", "/api/calendar", "/api/calendar/**", "/api/stats").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                // --- Modules internes : doctorants (ROLE_PHD_STUDENT) exclus, associés en consultation seule
                .requestMatchers(HttpMethod.GET, "/api/documents/**", "/api/messages/**", "/api/equipment/**",
                        "/api/equipment-requests/**", "/api/meetings/**", "/api/conventions/**", "/api/inventory/**")
                    .hasAnyRole("ADMIN", "DIRECTOR", "VICE_DIRECTOR", "TEAM_LEADER", "MEMBER", "ASSOCIATED")
                .requestMatchers("/api/documents/**", "/api/messages/**", "/api/equipment-requests/**", "/api/inventory/**",
                        "/api/meetings/**", "/api/conventions/**")
                    .hasAnyRole("DIRECTOR", "VICE_DIRECTOR", "TEAM_LEADER", "MEMBER", "ADMIN")
                // --- User-specific authenticated routes
                .requestMatchers("/api/members/me", "/api/profile/**", "/api/notifications/**").authenticated()
                // --- Administration technique et direction (le détail "directeur en mandat" est dans @PreAuthorize)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/audit/**").hasAnyRole("ADMIN", "DIRECTOR")
                .requestMatchers("/api/mandates/**").hasAnyRole("ADMIN", "DIRECTOR")
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "DIRECTOR", "VICE_DIRECTOR")
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable())) // For H2 console
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
