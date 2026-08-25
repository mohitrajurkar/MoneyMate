package com.moneymate.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneymate.dto.ApiResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ObjectMapper objectMapper;

    // Sliding window request timestamps per key
    private final Map<String, ConcurrentLinkedQueue<Long>> requestLogs = new ConcurrentHashMap<>();

    private static final int AUTH_LIMIT_PER_MINUTE = 20;
    private static final int SCREENSHOT_LIMIT_PER_MINUTE = 10;
    private static final long WINDOW_MS = 60_000L; // 1 minute

    public RateLimitingFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        boolean isAuthEndpoint = path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register");
        boolean isScreenshotEndpoint = path.startsWith("/api/parse-screenshot");

        if (isAuthEndpoint) {
            String key = "auth:" + clientIp;
            if (!isAllowed(key, AUTH_LIMIT_PER_MINUTE)) {
                sendRateLimitResponse(response, "Too many authentication attempts. Please try again in a minute.");
                return;
            }
        } else if (isScreenshotEndpoint) {
            String key = "screenshot:" + clientIp;
            if (!isAllowed(key, SCREENSHOT_LIMIT_PER_MINUTE)) {
                sendRateLimitResponse(response, "Screenshot parsing rate limit reached. Please try again in a minute.");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowed(String key, int maxRequests) {
        long now = System.currentTimeMillis();
        long windowStart = now - WINDOW_MS;

        ConcurrentLinkedQueue<Long> timestamps = requestLogs.computeIfAbsent(key, k -> new ConcurrentLinkedQueue<>());

        // Evict expired timestamps
        while (!timestamps.isEmpty()) {
            Long oldest = timestamps.peek();
            if (oldest != null && oldest < windowStart) {
                timestamps.poll();
            } else {
                break;
            }
        }

        synchronized (timestamps) {
            if (timestamps.size() >= maxRequests) {
                return false;
            }
            timestamps.add(now);
            return true;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.trim().isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.trim().isEmpty()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    private void sendRateLimitResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiResponse<Object> apiResponse = ApiResponse.error(message);
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}
