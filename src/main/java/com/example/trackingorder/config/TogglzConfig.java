package com.example.trackingorder.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.togglz.core.repository.StateRepository;
import org.togglz.core.repository.file.FileBasedStateRepository;
import org.togglz.core.user.SimpleFeatureUser;
import org.togglz.core.user.UserProvider;

import java.io.File;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
public class TogglzConfig {
    @Bean // lưu trạng thái cũ
    public StateRepository stateRepository() {
        return new FileBasedStateRepository(
                new File("togglz-state.properties")
        );
    }


    @Bean
    public UserProvider userProvider() {
        return () -> {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            // Nếu chưa đăng nhập
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return null;
            }

            // Lấy danh sách Roles từ Spring Security (ROLE_BUYER, ROLE_SELLER...)
            Set<String> roles = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toSet());

            // SELLER = Feature Admin, còn lại thì không
            boolean isFeatureAdmin = roles.contains("ROLE_SELLER");

            // Tạo user cho Togglz và gán thuộc tính "roles"
            SimpleFeatureUser user = new SimpleFeatureUser(auth.getName(), isFeatureAdmin);
            user.setAttribute("roles", roles);

            return user;
        };
    }


}
