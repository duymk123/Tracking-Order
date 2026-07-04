package com.example.trackingorder.config.basicauthconfig;

import com.example.trackingorder.entity.User;
import com.example.trackingorder.repository.UserRepo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailService implements UserDetailsService {
    private final UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Basic Auth loading user by username='{}'", username);

        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Basic Auth user not found: username='{}'", username);
                    return new UsernameNotFoundException(username);
                });

        Enum role = user.getRole();
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
        String password = user.getPassword();
        // GrantedAuthority la mot cach phan quyen
        // - ROLE (ADMIN/CUSTOMER) => ROLE_ADMIN, ROLE_CUSTOMER
        return new org.springframework.security.core.userdetails.User(username, password, List.of(authority));

    }
}
