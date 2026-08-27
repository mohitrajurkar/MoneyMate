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
 * Robust, Production-Grade DataSource Configuration for MoneyMate.
 *
 * Supports:
 * 1. Neon Serverless PostgreSQL with triple-layer routing:
 *    - Modern TLS SNI via PostgreSQL JDBC 42.7.3
 *    - Startup connection option parameter (`options=endpoint=<id>`)
 *    - Neon proxy authentication payload prefix (`endpoint=<id>;<password>`)
 * 2. Local Docker Compose and localhost development (zero SSL/routing overhead)
 * 3. Authoritative configuration precedence for dedicated DB_* environment variables.
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

        // Attach DataSource properties for robust SSL and Neon proxy routing
        if (StringUtils.hasText(parsed.endpointId())) {
            config.addDataSourceProperty("options", "endpoint=" + parsed.endpointId());
        }
        if (StringUtils.hasText(parsed.sslMode())) {
            config.addDataSourceProperty("sslmode", parsed.sslMode());
            config.addDataSourceProperty("ssl", "true");
        }

        // HikariCP connection pool resilience
        config.setMaximumPoolSize(maxPoolSize);
        config.setMinimumIdle(minIdle);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(20000);
        config.setLeakDetectionThreshold(60000);

        log.info("Initialized PostgreSQL DataSource for host: {}, database: {}, SSL: {}, Neon Endpoint: {}",
                parsed.host(), parsed.database(), parsed.sslMode() != null ? parsed.sslMode() : "disabled",
                parsed.endpointId() != null ? parsed.endpointId() : "none");

        return new HikariDataSource(config);
    }

    public record ParsedDbConfig(
            String jdbcUrl,
            String username,
            String password,
            String host,
            String database,
            String endpointId,
            String sslMode
    ) {}

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
        String rawPassword = pass != null ? pass : "postgres";

        boolean hasExplicitNeonEndpoint = StringUtils.hasText(explicitNeonEndpoint);
        boolean isNeonHost = isNeon(trimmedHost);
        boolean hasCustomHost = !trimmedHost.equalsIgnoreCase("localhost") && !trimmedHost.equalsIgnoreCase("127.0.0.1");

        // PRIMARY PATH: Dedicated environment variables (custom host, Neon endpoint, or default local config)
        if (hasCustomHost || hasExplicitNeonEndpoint || !StringUtils.hasText(fallbackRawUrl)) {
            if (StringUtils.hasText(fallbackRawUrl)) {
                log.info("Dedicated DB_* variables are active (DB_HOST={}); ignoring legacy SPRING_DATASOURCE_URL/DATABASE_URL", trimmedHost);
            }

            String endpoint = resolveEndpointId(trimmedHost, explicitNeonEndpoint);
            String effectiveSsl = (isNeonHost || StringUtils.hasText(explicitSslMode) || StringUtils.hasText(endpoint))
                    ? (StringUtils.hasText(explicitSslMode) ? explicitSslMode.trim() : "require")
                    : null;

            String query = buildQueryParams(null, endpoint, effectiveSsl, isNeonHost);
            String finalPassword = formatNeonPassword(rawPassword, endpoint, isNeonHost);

            String jdbcUrl = "jdbc:postgresql://" + trimmedHost + ":" + trimmedPort + "/" + trimmedDb + query;
            return new ParsedDbConfig(jdbcUrl, username, finalPassword, trimmedHost, trimmedDb, endpoint, effectiveSsl);
        }

        // SECONDARY FALLBACK: Only used if DB_HOST was unset/localhost AND a fallback raw URL is explicitly present
        return parseFallbackUrl(fallbackRawUrl, trimmedDb, username, rawPassword, explicitNeonEndpoint, explicitSslMode);
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
        String rawPassword = defaultPass;
        String host = "localhost";
        String db = defaultDb;

        if (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://")) {
            try {
                URI uri = new URI(rawUrl);
                host = uri.getHost() != null ? uri.getHost() : host;
                int uriPort = uri.getPort() > 0 ? uri.getPort() : 5432;
                String uriPath = uri.getPath();
                db = (uriPath != null && uriPath.length() > 1) ? uriPath.substring(1) : defaultDb;

                if (uri.getUserInfo() != null) {
                    String[] userParts = uri.getUserInfo().split(":", 2);
                    username = userParts[0];
                    if (userParts.length > 1) {
                        rawPassword = userParts[1];
                    }
                }

                boolean isNeonHost = isNeon(host);
                String endpoint = resolveEndpointId(host, explicitNeonEndpoint);
                String effectiveSsl = (isNeonHost || StringUtils.hasText(explicitSslMode) || StringUtils.hasText(endpoint))
                        ? (StringUtils.hasText(explicitSslMode) ? explicitSslMode.trim() : "require")
                        : null;

                String query = buildQueryParams(uri.getQuery(), endpoint, effectiveSsl, isNeonHost);
                String finalPassword = formatNeonPassword(rawPassword, endpoint, isNeonHost);

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + uriPort + "/" + db + query;
                return new ParsedDbConfig(jdbcUrl, username, finalPassword, host, db, endpoint, effectiveSsl);
            } catch (Exception e) {
                log.warn("Failed to parse fallback URL as URI: {}", e.getMessage());
            }
        }

        if (rawUrl.startsWith("jdbc:postgresql://")) {
            host = extractHostFromJdbcUrl(rawUrl);
            boolean isNeonHost = isNeon(host);
            String endpoint = resolveEndpointId(host, explicitNeonEndpoint);
            String effectiveSsl = (isNeonHost || StringUtils.hasText(explicitSslMode) || StringUtils.hasText(endpoint))
                    ? (StringUtils.hasText(explicitSslMode) ? explicitSslMode.trim() : "require")
                    : null;

            String url = appendNeonParamsToJdbcUrl(rawUrl, endpoint, effectiveSsl, isNeonHost);
            String finalPassword = formatNeonPassword(rawPassword, endpoint, isNeonHost);
            return new ParsedDbConfig(url, username, finalPassword, host, defaultDb, endpoint, effectiveSsl);
        }

        return new ParsedDbConfig(rawUrl, username, rawPassword, host, defaultDb, null, null);
    }

    public static boolean isNeon(String host) {
        if (!StringUtils.hasText(host)) return false;
        String lower = host.toLowerCase();
        return lower.contains(".neon.tech") || lower.contains(".neon.build") || lower.startsWith("ep-");
    }

    public static String resolveEndpointId(String host, String explicitEndpoint) {
        if (StringUtils.hasText(explicitEndpoint)) {
            return cleanEndpointId(explicitEndpoint);
        }
        if (StringUtils.hasText(host) && isNeon(host)) {
            String cleanHost = host.trim();
            if (cleanHost.contains("@")) {
                cleanHost = cleanHost.substring(cleanHost.indexOf("@") + 1);
            }
            if (cleanHost.contains(":")) {
                cleanHost = cleanHost.split(":", 2)[0];
            }
            if (cleanHost.startsWith("ep-")) {
                String prefix = cleanHost.split("\\.", 2)[0];
                return cleanEndpointId(prefix);
            }
        }
        return null;
    }

    private static String cleanEndpointId(String endpoint) {
        if (!StringUtils.hasText(endpoint)) return null;
        String cleaned = endpoint.trim();
        if (cleaned.endsWith("-pooler")) {
            cleaned = cleaned.substring(0, cleaned.length() - "-pooler".length());
        }
        return cleaned;
    }

    public static String formatNeonPassword(String password, String endpointId, boolean isNeonHost) {
        if (password == null) return null;
        if ((isNeonHost || StringUtils.hasText(endpointId)) && StringUtils.hasText(endpointId)) {
            if (!password.startsWith("endpoint=")) {
                return "endpoint=" + endpointId + ";" + password;
            }
        }
        return password;
    }

    private static String extractHostFromJdbcUrl(String jdbcUrl) {
        try {
            String withoutPrefix = jdbcUrl.substring("jdbc:postgresql://".length());
            if (withoutPrefix.contains("@")) {
                withoutPrefix = withoutPrefix.substring(withoutPrefix.indexOf("@") + 1);
            }
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

        if ((isNeonHost || StringUtils.hasText(explicitSslMode)) && !result.contains("sslmode=")) {
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
