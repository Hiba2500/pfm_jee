package com.lias.lab.security;

import com.lias.lab.entity.MemberStatus;
import com.lias.lab.entity.Role;
import com.lias.lab.entity.User;
import com.lias.lab.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            userEmail = jwtService.extractUsername(jwt);
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Optional<User> userOpt = userRepository.findByEmailIgnoreCase(userEmail);
                // Section 8 : un compte gelé (retraité) ou désactivé (ancien membre) n'a plus aucun accès actif,
                // même avec un jeton encore valide.
                if (userOpt.isPresent() && !userOpt.get().isFrozen() && !userOpt.get().isDisabled()
                        && jwtService.isTokenValid(jwt, userEmail)) {
                    User user = userOpt.get();
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user,
                            null,
                            authoritiesOf(user)
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ignored) {
            // Invalid token
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Séparation statut / rôle (section 21). Les doctorants et les associés reçoivent un profil d'accès limité
     * (ROLE_PHD_STUDENT / ROLE_ASSOCIATED) et ne portent pas le rôle interne : ils ne voient donc pas les modules internes.
     */
    private List<SimpleGrantedAuthority> authoritiesOf(User user) {
        if (user.getRole() != Role.ADMIN) {
            if (user.getStatus() == MemberStatus.PHD_STUDENT) {
                return List.of(new SimpleGrantedAuthority("ROLE_PHD_STUDENT"));
            }
            if (user.getStatus() == MemberStatus.ASSOCIATED) {
                return List.of(new SimpleGrantedAuthority("ROLE_ASSOCIATED"));
            }
        }
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
    }
}
