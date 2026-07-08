package com.example.trackingorder.config;

import com.example.trackingorder.config.basicauthconfig.AuthenticationFacade;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class JpaAuditingConfig {

    private final AuthenticationFacade authenticationFacade;

    public JpaAuditingConfig(AuthenticationFacade authenticationFacade) {
        this.authenticationFacade = authenticationFacade;
    }

    @Bean
    public AuditorAware<String> auditorProvider() {

        return () -> {

            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null
                    || !authentication.isAuthenticated()
                    || authentication instanceof AnonymousAuthenticationToken) {
                return Optional.empty();
            }

            // Chỉ lấy username, KHÔNG query database
            return Optional.of(authentication.getName());
        };
    }
}
