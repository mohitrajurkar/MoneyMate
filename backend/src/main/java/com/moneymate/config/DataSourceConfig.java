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
 * Precedence & Features:
 * 1. Dedicated variables (DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, NEON_ENDPOINT_ID, DB_SSLMODE)
 *    are the primary configuration path on Render/Neon as well as Docker Compose and local dev.
 * 2. If a connection URL is passed via SPRING_DATASOURCE_URL or DATABASE_URL:
 *    - Automatically strips any embedded user:pass@ credentials so the JDBC driver doesn't misparse the host and fall back to localhost.
 *    - Extracts username/password from the URI and applies them cleanly to HikariCP.
 * 3. Triple-layer Neon routing:
 *    - Modern TLS SNI via PostgreSQL JDBC 42.7.3
 *    - Startup connection option parameter (`options=endpoint=<id>`)
 *    - Neon proxy authentication payload prefix (`endpoint=<id>;<password>`)
 *    - Automatic stripping of `-pooler` suffix
 * 4. Localhost and Docker Compose compatibility with zero SSL/routing overhead.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${DB_HOST:}")
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

        // Safe diagnostic logging (NEVER logs passwords or JWT secrets)
        log.info("================================================================================");
        log.info("[Database Config] Selected Host:        {}", parsed.host());
        log.info("[Database Config] Selected Port:        {}", parsed.port());
        log.info("[Database Config] Selected Database:    {}", parsed.database());
        log.info("[Database Config] Selected Username:    {}", parsed.username());
        log.info("[Database Config] Neon Mode Detected:   {}", parsed.isNeon());
        log.info("[Database Config] Neon Endpoint ID:     {}", parsed.endpointId() != null ? parsed.endpointId() : "none");
        log.info("[Database Config] Effective SSL Mode:   {}", parsed.sslMode() != null ? parsed.sslMode() : "disabled");
        log.info("[Database Config] Sanitized JDBC URL:   {}", sanitizeUrl(parsed.jdbcUrl()));
        log.info("================================================================================");

        return new HikariDataSource(config);
    }

    public record ParsedDbConfig(
            String jdbcUrl,
            String username,
            String password,
            String host,
            String port,
            String database,
            String endpointId,
            String sslMode,
            boolean isNeon
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
        boolean hasExplicitHost = StringUtils.hasText(host);
        boolean hasExplicitNeonEndpoint = StringUtils.hasText(explicitNeonEndpoint);
        boolean hasFallbackUrl = StringUtils.hasText(fallbackRawUrl);

        // PATH 1: Dedicated DB_HOST is explicitly provided
        if (hasExplicitHost) {
            String trimmedHost = host.trim();
            String trimmedPort = StringUtils.hasText(port) ? port.trim() : "5432";
            String trimmedDb = StringUtils.hasText(database) ? database.trim() : "moneymate";
            String username = StringUtils.hasText(user) ? user.trim() : "postgres";
            String rawPassword = pass != null ? pass : "postgres";

            boolean isNeonHost = isNeon(trimmedHost);
            String endpoint = resolveEndpointId(trimmedHost, explicitNeonEndpoint);
            String effectiveSsl = (isNeonHost || StringUtils.hasText(explicitSslMode) || StringUtils.hasText(endpoint))
                    ? (StringUtils.hasText(explicitSslMode) ? explicitSslMode.trim() : "require")
                    : null;

            String query = buildQueryParams(null, endpoint, effectiveSsl, isNeonHost);
            String finalPassword = formatNeonPassword(rawPassword, endpoint, isNeonHost);

            String jdbcUrl = "jdbc:postgresql://" + trimmedHost + ":" + trimmedPort + "/" + trimmedDb + query;
            return new ParsedDbConfig(jdbcUrl, username, finalPassword, trimmedHost, trimmedPort, trimmedDb, endpoint, effectiveSsl, isNeonHost);
        }

        // PATH 2: Fallback URL (SPRING_DATASOURCE_URL / DATABASE_URL) is present
        if (hasFallbackUrl) {
            return parseFallbackUrl(fallbackRawUrl, database, user, pass, explicitNeonEndpoint, explicitSslMode);
        }

        // PATH 3: Localhost default (no env vars provided)
        String trimmedHost = "localhost";
        String trimmedPort = StringUtils.hasText(port) ? port.trim() : "5432";
        String trimmedDb = StringUtils.hasText(database) ? database.trim() : "moneymate";
        String username = StringUtils.hasText(user) ? user.trim() : "postgres";
        String rawPassword = pass != null ? pass : "postgres";

        String jdbcUrl = "jdbc:postgresql://" + trimmedHost + ":" + trimmedPort + "/" + trimmedDb;
        return new ParsedDbConfig(jdbcUrl, username, rawPassword, trimmedHost, trimmedPort, trimmedDb, null, null, false);
    }

    private static ParsedDbConfig parseFallbackUrl(
            String rawUrl,
            String defaultDb,
            String defaultUser,
            String defaultPass,
            String explicitNeonEndpoint,
            String explicitSslMode
    ) {
        String username = StringUtils.hasText(defaultUser) ? defaultUser.trim() : "postgres";
        String rawPassword = defaultPass != null ? defaultPass : "postgres";
        String host = "localhost";
        String port = "5432";
        String db = StringUtils.hasText(defaultDb) ? defaultDb.trim() : "moneymate";
        String existingQuery = null;

        String cleanUrl = rawUrl.trim();

        // Convert jdbc:postgresql:// with embedded credentials or standard postgresql:// / postgres://
        if (cleanUrl.startsWith("jdbc:postgresql://")) {
            String withoutJdbc = cleanUrl.substring("jdbc:".length());
            // Parse URI structure
            ParsedUriInfo uriInfo = parsePostgresUri(withoutJdbc);
            host = uriInfo.host != null ? uriInfo.host : host;
            port = uriInfo.port != null ? uriInfo.port : port;
            db = uriInfo.db != null ? uriInfo.db : db;
            username = uriInfo.user != null ? uriInfo.user : username;
            rawPassword = uriInfo.pass != null ? uriInfo.pass : rawPassword;
            existingQuery = uriInfo.query;
        } else if (cleanUrl.startsWith("postgres://") || cleanUrl.startsWith("postgresql://")) {
            ParsedUriInfo uriInfo = parsePostgresUri(cleanUrl);
            host = uriInfo.host != null ? uriInfo.host : host;
            port = uriInfo.port != null ? uriInfo.port : port;
            db = uriInfo.db != null ? uriInfo.db : db;
            username = uriInfo.user != null ? uriInfo.user : username;
            rawPassword = uriInfo.pass != null ? uriInfo.pass : rawPassword;
            existingQuery = uriInfo.query;
        }

        boolean isNeonHost = isNeon(host);
        String endpoint = resolveEndpointId(host, explicitNeonEndpoint);
        String effectiveSsl = (isNeonHost || StringUtils.hasText(explicitSslMode) || StringUtils.hasText(endpoint))
                ? (StringUtils.hasText(explicitSslMode) ? explicitSslMode.trim() : "require")
                : null;

        String query = buildQueryParams(existingQuery, endpoint, effectiveSsl, isNeonHost);
        String finalPassword = formatNeonPassword(rawPassword, endpoint, isNeonHost);

        // Always generate a clean JDBC URL WITHOUT user:pass@ embedded in the host string
        String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + "/" + db + query;
        return new ParsedDbConfig(jdbcUrl, username, finalPassword, host, port, db, endpoint, effectiveSsl, isNeonHost);
    }

    private static class ParsedUriInfo {
        String user;
        String pass;
        String host;
        String port = "5432";
        String db;
        String query;
    }

    private static ParsedUriInfo parsePostgresUri(String uriString) {
        ParsedUriInfo info = new ParsedUriInfo();
        try {
            // Strip postgres://, postgresql://, or postgresql://
            String s = uriString;
            if (s.startsWith("postgresql://")) {
                s = s.substring("postgresql://".length());
            } else if (s.startsWith("postgres://")) {
                s = s.substring("postgres://".length());
            }

            // Check for query string
            int questIdx = s.indexOf('?');
            if (questIdx != -1) {
                info.query = s.substring(questIdx + 1);
                s = s.substring(0, questIdx);
            }

            // Check for user:pass@
            int atIdx = s.indexOf('@');
            if (atIdx != -1) {
                String userPass = s.substring(0, atIdx);
                s = s.substring(atIdx + 1);
                if (userPass.contains(":")) {
                    String[] up = userPass.split(":", 2);
                    info.user = up[0];
                    info.pass = up[1];
                } else {
                    info.user = userPass;
                }
            }

            // Check for path /db
            int slashIdx = s.indexOf('/');
            if (slashIdx != -1) {
                String path = s.substring(slashIdx + 1);
                if (StringUtils.hasText(path)) {
                    info.db = path;
                }
                s = s.substring(0, slashIdx);
            }

            // Now s is host:port or host
            if (s.contains(":")) {
                String[] hp = s.split(":", 2);
                info.host = hp[0];
                info.port = hp[1];
            } else if (StringUtils.hasText(s)) {
                info.host = s;
            }
        } catch (Exception e) {
            log.warn("Could not parse URI '{}': {}", uriString, e.getMessage());
        }
        return info;
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
