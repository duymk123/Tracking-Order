package com.example.trackingorder.client;

import com.example.trackingorder.dto.FeatureContext;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class FeatureContextBuilder {

    private final Environment environment;

    // Whitelist headers and query params
    private static final Set<String> ALLOWED_HEADERS = Set.of(
            "x-app-version", "x-region", "x-device-type", "user-agent"
    );

    private static final Set<String> ALLOWED_QUERY_PARAMS = Set.of(
            "country", "lang", "campaign"
    );

    public FeatureContextBuilder(Environment environment) {
        this.environment = environment;
    }

    public FeatureContext build() {
        FeatureContext.FeatureContextBuilder builder = FeatureContext.builder()
                .requestTime(Instant.now().toString());

        // Extract from SecurityContext
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            builder.username(auth.getName());
            List<String> roles = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.toList());
            builder.roles(roles);
        }

        // Extract from Spring Environment
        if (environment != null) {
            builder.springProfiles(Arrays.asList(environment.getActiveProfiles()));
        }

        // Extract from HttpServletRequest
//        Lấy IP Address, Headers, Query Params từ HttpServletRequest (thông qua RequestContextHolder)
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            HttpServletRequest request = servletAttrs.getRequest();
            
            builder.clientIp(getClientIp(request));
            builder.serverIp(request.getLocalAddr());
            builder.host(request.getServerName());
            
            Map<String, String> headers = new HashMap<>();
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames != null && headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                if (ALLOWED_HEADERS.contains(headerName.toLowerCase())) {
                    headers.put(headerName, request.getHeader(headerName));
                }
            }
            builder.headers(headers);

            Map<String, String> queryParams = new HashMap<>();
            Enumeration<String> paramNames = request.getParameterNames();
            while (paramNames != null && paramNames.hasMoreElements()) {
                String paramName = paramNames.nextElement();
                if (ALLOWED_QUERY_PARAMS.contains(paramName.toLowerCase())) {
                    queryParams.put(paramName, request.getParameter(paramName));
                }
            }
            builder.queryParameters(queryParams);
        }

        return builder.build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}
