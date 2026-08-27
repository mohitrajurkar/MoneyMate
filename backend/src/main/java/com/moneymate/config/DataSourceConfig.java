package com.moneymate.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

import javax.sql.DataSource;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Authoritative DataSource Configuration for MoneyMate.
 *
 * Precedence Rule:
 * 1. Dedicated variables (DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, NEON_ENDPOINT_ID, DB_SSLMODE)
 *    are the PRIMARY production configuration path on Render/Neon as well as Docker Compose and local dev.
 * 2. Any leftover SPRING_DATASOURCE_URL or DATABASE_URL is ignored when DB_HOST / dedicated variables are configured,
 *    preventing stale URLs from bypassing the Neon SNI / endpoint routing fix.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${DB_HOST:localhost}")
    private String dbHost;

    @Value("${DB_PORT:5432}")
    private String dbPort;

    @Value("${DB_NAME:moneymate}")
    private String dbName;

    @Value("${DB_USERNAME:postgres}")
    private String dbUsername;

    @Value("${DB_PASSWORD:postgres}")
    private String dbPassword;

    @Value("${NEON_ENDPOINT_ID:}")
    private String neonEndpointId;

    @Value("${DB_SSLMODE:}")
    private String dbSslMode;

    @Value("${SPRING_DATASOURCE_URL:${DATABASE_URL:}}")
    private String rawDatabaseUrl;

    @Value("${DB_MAX_POOL_SIZE:10}")
    private int maxPoolSize;

    @Value("${DB_MIN_IDLE:2}")
    private int minIdle;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        ParsedDbConfig parsed = resolveDatabaseConfig(
                dbHost,
                dbPort,
                dbName,
                dbUsername,
                dbPassword,
                neonEndpointId,
                dbSslMode,
                rawDatabaseUrl
        );

        config.setJdbcUrl(parsed.jdbcUrl());
        config.setUsername(parsed.username());
        config.setPassword(parsed.password());
        config.setDriverClassName("org.postgresql.Driver");

        // HikariCP connection pool resilience
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(20000);
        config.setLeakDetectionThreshold(60000);

        log.info("Initialized PostgreSQL DataSource with URL: {}", sanitizeUrl(parsed.jdbcUrl()));

        return new HikariDataSource(config);
    }

    public record ParsedDbConfig(String jdbcUrl, String username, String password) {}

    public static ParsedDbConfig resolveDatabaseConfig(
            String host,
            String port,
            String database,
            String user,
            String pass,
            String explicitNeonEndpoint,
            String explicitSslMode,
            String fallbackRawUrl
    ) {
        String trimmedHost = StringUtils.hasText(host) ? host.trim() : "localhost";
        String trimmedPort = StringUtils.hasText(port) ? port.trim() : "5432";
        String trimmedDb = StringUtils.hasText(database) ? database.trim() : "moneymate";
        String username = StringUtils.hasText(user) ? user.trim() : "postgres";
        String password = pass != null ? pass : "postgres";

        boolean hasExplicitNeonEndpoint = StringUtils.hasText(explicitNeonEndpoint);
        boolean isNeonHost = isNeon(trimmedHost);
        boolean hasCustomHost = !trimmedHost.equalsIgnoreCase("localhost") && !trimmedHost.equalsIgnoreCase("127.0.0.1");

        // PRIMARY PATH: If dedicated variables are active (custom host, Neon endpoint, or standard local/compose defaults)
        if (hasCustomHost || hasExplicitNeonEndpoint || !StringUtils.hasText(fallbackRawUrl)) {
            if (StringUtils.hasText(fallbackRawUrl)) {
                log.info("Dedicated DB_* variables are active (DB_HOST={}); ignoring legacy SPRING_DATASOURCE_URL/DATABASE_URL", trimmedHost);
            }

            String endpoint = resolveEndpointId(trimmedHost, explicitNeonEndpoint);
            String query = buildQueryParams(null, endpoint, explicitSslMode, isNeonHost);

            String jdbcUrl = "jdbc:postgresql://" + trimmedHost + ":" + trimmedPort + "/" + trimmedDb + query;
            return new ParsedDbConfig(jdbcUrl, username, password);
        }

        // SECONDARY FALLBACK: Only used if DB_HOST was unset/localhost AND a fallback raw URL is explicitly present
        return parseFallbackUrl(fallbackRawUrl, trimmedDb, username, password, explicitNeonEndpoint, explicitSslMode);
    }

    private static ParsedDbConfig parseFallbackUrl(
            String rawUrl,
            String defaultDb,
            String defaultUser,
            String defaultPass,
            String explicitNeonEndpoint,
            String explicitSslMode
    ) {
        String username = defaultUser;
        String password = defaultPass;

        if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(rawUrl);
                String uriHost = uri.getHost();
                int uriPort = uri.getPort() > 0 ? uri.getPort() : 5432;
                String uriPath = uri.getPath();
                String uriDb = (uriPath != null && uriPath.length() > 1) ? uriPath.substring(1) : defaultDb;

                if (uri.getUserInfo() != null) {
                    String[] userParts = uri.getUserInfo().split(":", 2);
                    username = userParts[0];
                    if (userParts.length > 1) {
                        password = userParts[1];
                    }
                }

                String endpoint = resolveEndpointId(uriHost, explicitNeonEndpoint);
                String query = buildQueryParams(uri.getQuery(), endpoint, explicitSslMode, isNeon(uriHost));

                String jdbcUrl = "jdbc:postgresql://" + uriHost + ":" + uriPort + "/" + uriDb + query;
                return new ParsedDbConfig(jdbcUrl, username, password);
            } catch (Exception e) {
                log.warn("Failed to parse fallback URL as URI: {}", e.getMessage());
            }
        }

        if (rawUrl.startsWith("jdbc:postgresql://")) {
            String extractedHost = extractHostFromJdbcUrl(rawUrl);
            String endpoint = resolveEndpointId(extractedHost, explicitNeonEndpoint);
            String url = appendNeonParamsToJdbcUrl(rawUrl, endpoint, explicitSslMode, isNeon(extractedHost));
            return new ParsedDbConfig(url, username, password);
        }

        return new ParsedDbConfig(rawUrl, username, password);
    }

    public static boolean isNeon(String host) {
        if (!StringUtils.hasText(host)) return false;
        String lower = host.toLowerCase();
        return lower.contains(".neon.tech") || lower.contains(".neon.build") || lower.startsWith("ep-");
    }

    public static String resolveEndpointId(String host, String explicitEndpoint) {
        if (StringUtils.hasText(explicitEndpoint)) {
            return explicitEndpoint.trim();
        }
        if (StringUtils.hasText(host) && host.contains(".neon.tech") && host.startsWith("ep-")) {
            return host.split("\\.", 2)[0];
        }
        return null;
    }

    private static String extractHostFromJdbcUrl(String jdbcUrl) {
        try {
            String withoutPrefix = jdbcUrl.substring("jdbc:postgresql://".length());
            int slashIdx = withoutPrefix.indexOf('/');
            int questIdx = withoutPrefix.indexOf('?');
            int endIdx = withoutPrefix.length();
            if (slashIdx != -1) endIdx = Math.min(endIdx, slashIdx);
            if (questIdx != -1) endIdx = Math.min(endIdx, questIdx);

            String hostPort = withoutPrefix.substring(0, endIdx);
            if (hostPort.contains(":")) {
                return hostPort.split(":", 2)[0];
            }
            return hostPort;
        } catch (Exception e) {
            return "";
        }
    }

    private static String appendNeonParamsToJdbcUrl(String jdbcUrl, String endpoint, String explicitSslMode, boolean isNeonHost) {
        String result = jdbcUrl;

        if ((isNeonHost || "require".equalsIgnoreCase(explicitSslMode)) && !result.contains("sslmode=")) {
            String sslParam = "sslmode=" + (StringUtils.hasText(explicitSslMode) ? explicitSslMode : "require");
            result += (result.contains("?") ? "&" : "?") + sslParam;
        }

        if (StringUtils.hasText(endpoint) && !result.contains("options=endpoint")) {
            result += (result.contains("?") ? "&" : "?") + "options=endpoint%3D" + endpoint;
        }

        return result;
    }

    private static String buildQueryParams(String existingQuery, String endpoint, String explicitSslMode, boolean isNeonHost) {
        Map<String, String> params = new LinkedHashMap<>();

        if (StringUtils.hasText(existingQuery)) {
            String[] pairs = existingQuery.split("&");
            for (String pair : pairs) {
                int idx = pair.indexOf("=");
                if (idx > 0) {
                    params.put(pair.substring(0, idx), pair.substring(idx + 1));
                } else if (StringUtils.hasText(pair)) {
                    params.put(pair, "");
                }
            }
        }

        if (isNeonHost || StringUtils.hasText(explicitSslMode)) {
            if (!params.containsKey("sslmode")) {
                params.put("sslmode", StringUtils.hasText(explicitSslMode) ? explicitSslMode : "require");
            }
        }

        if (StringUtils.hasText(endpoint)) {
            if (!params.containsKey("options")) {
                params.put("options", "endpoint%3D" + endpoint);
            }
        }

        if (params.isEmpty()) {
            return "";
        }

        return "?" + params.entrySet().stream()
                .map(e -> StringUtils.hasText(e.getValue()) ? e.getKey() + "=" + e.getValue() : e.getKey())
                .collect(Collectors.joining("&"));
    }

    public static String sanitizeUrl(String url) {
        if (!StringUtils.hasText(url)) return "";
        return url.replaceAll("(?i)(password=)[^&]*", "$1****")
                .replaceAll("(?i)(:[^/@:]+@)", ":****@");
    }
}
