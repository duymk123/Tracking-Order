package com.example.trackingorder.config.basicauthconfig;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity // bat de @PreAuthorize trong controller hoat dong
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Cho phép frontend dev (Vite :5173) và production origin gọi API
        config.setAllowedOriginPatterns(List.of("http://localhost:5173", "http://localhost:*"));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Phải cho phép Authorization header để Basic Auth hoạt động
        config.setAllowedHeaders(List.of("*"));

        // Cho phép gửi credentials (Authorization header) từ browser
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    /**
     * Filter chain cho Togglz Console — dùng Form Login (có trang đăng nhập đẹp)
     * Chỉ cho phép SELLER truy cập
     */
    @Bean
    @org.springframework.core.annotation.Order(1)
    public SecurityFilterChain togglzFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/togglz-console/**", "/login", "/logout")
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login").permitAll()
                        .requestMatchers("/togglz-console/**").hasRole("SELLER")
                        .anyRequest().authenticated())
                .formLogin(form -> form
                        .loginPage("/login.html")                          // Trang login tự tạo
                        .loginProcessingUrl("/login")                       // Spring Security xử lý POST này
                        .defaultSuccessUrl("/togglz-console/index", true)  // Sau login → vào Console
                        .failureUrl("/login.html?error")                    // Sai pass → hiện lỗi
                        .permitAll())
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login.html?logout")
                        .permitAll());
        return http.build();
    }

    /**
     * Filter chain cho REST API — dùng Basic Auth như cũ
     */
    @Bean
    @org.springframework.core.annotation.Order(2)
    public SecurityFilterChain apiFilterChain(HttpSecurity http) throws Exception {
        http
                .securityMatcher("/api/**")
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/v1/users/register").permitAll()
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults());
        return http.build();
    }
}
