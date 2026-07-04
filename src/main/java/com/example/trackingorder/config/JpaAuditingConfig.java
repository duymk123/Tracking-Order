package com.example.trackingorder.config;

import com.example.trackingorder.config.basicauthconfig.AuthenticationFacade;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;
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
        return new AuditorAware<String>() {
            @Override
            public Optional<String> getCurrentAuditor() {
                return Optional.of(authenticationFacade.getCurrentUser().getUsername());
            }
        };
    }
}
