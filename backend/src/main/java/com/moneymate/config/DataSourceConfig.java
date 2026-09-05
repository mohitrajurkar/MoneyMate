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
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

/**
 * Robust, Production-Grade DataSource Configuration for MoneyMate.
 *
 * Precedence & Features:
 * 1. Dedicated variables (DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD, NEON_ENDPOINT_ID, DB_SSLMODE)
 *    are the primary configuration path on Supabase, Neon, Render, Docker Compose, and local dev.
 * 2. If a connection URL is passed via SPRING_DATASOURCE_URL or DATABASE_URL:
 *    - Automatically strips any embedded user:pass@ credentials so the JDBC driver doesn't misparse the host.
 *    - Supports query-parameter credentials (?user=...&password=...) used by Supabase JDBC URLs.
 *    - Properly decodes percent-encoded special characters in passwords.
 *    - Extracts username/password cleanly and applies them to HikariCP.
 * 3. Automatic SSL detection for cloud providers (Supabase, Neon, Render, Railway, AWS RDS, etc.).
 * 4. Triple-layer Neon routing:
 *    - Modern TLS SNI via PostgreSQL JDBC 42.7.3
 *    - Startup connection option parameter (`options=endpoint=<id>`)
 *    - Neon proxy authentication payload prefix (`endpoint=<id>;<password>`)
 *    - Automatic stripping of `-pooler` suffix
 * 5. Localhost and Docker Compose compatibility with zero SSL/routing overhead.
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

    @Value("${DB_AUTO_CREATE:true}")
    private boolean autoCreateDatabase;

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

            if (autoCreateDatabase && !isManagedDatabase(parsed)) {
                createDatabaseIfMissing(parsed);
            } else if (autoCreateDatabase) {
                log.info("[Database Config] Skipping database creation for managed PostgreSQL host: {}", parsed.host());
            }

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

    private void createDatabaseIfMissing(ParsedDbConfig parsed) {
        if (!isValidDatabaseName(parsed.database())) {
            throw new IllegalStateException("Invalid database name: " + parsed.database());
        }

        String maintenanceUrl = "jdbc:postgresql://" + parsed.host() + ":" + parsed.port() + "/postgres"
                + queryPart(parsed.jdbcUrl());
        Properties properties = new Properties();
        properties.setProperty("user", parsed.username());
        properties.setProperty("password", parsed.password());
        if (StringUtils.hasText(parsed.sslMode())) {
            properties.setProperty("sslmode", parsed.sslMode());
        }

        try (Connection connection = DriverManager.getConnection(maintenanceUrl, properties);
             Statement statement = connection.createStatement()) {
            statement.executeUpdate("CREATE DATABASE " + quoteIdentifier(parsed.database()));
            log.info("[Database Config] Created missing database: {}", parsed.database());
        } catch (SQLException exception) {
            if ("42P04".equals(exception.getSQLState())) {
                log.debug("[Database Config] Database already exists: {}", parsed.database());
                return;
            }
            throw new IllegalStateException(
                    "Could not create database '" + parsed.database()
                            + "'. Ensure the PostgreSQL user has CREATEDB permission, or set DB_AUTO_CREATE=false.",
                    exception
            );
        }
    }

    private static boolean isManagedDatabase(ParsedDbConfig parsed) {
        return isCloudHost(parsed.host());
    }

    private static String queryPart(String jdbcUrl) {
        int queryIndex = jdbcUrl.indexOf('?');
        return queryIndex >= 0 ? jdbcUrl.substring(queryIndex) : "";
    }

    private static boolean isValidDatabaseName(String database) {
        return StringUtils.hasText(database) && database.length() <= 63 && database.matches("[A-Za-z_][A-Za-z0-9_]*");
    }

    private static String quoteIdentifier(String identifier) {
        return "\"" + identifier.replace("\"", "\"\"") + "\"";
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
            boolean isCloud = isCloudHost(trimmedHost);
            String endpoint = resolveEndpointId(trimmedHost, explicitNeonEndpoint);
            String effectiveSsl = (isNeonHost || isCloud || StringUtils.hasText(explicitSslMode) || StringUtils.hasText(endpoint))
                    ? (StringUtils.hasText(explicitSslMode) ? normalizeSslMode(explicitSslMode) : "require")
                    : null;

            String query = buildQueryParams(null, endpoint, effectiveSsl, isNeonHost || isCloud);
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
        String host = "localhost";
        String port = "5432";
        String db = StringUtils.hasText(defaultDb) ? defaultDb.trim() : "moneymate";
        String cleanUrl = rawUrl.trim();
        ParsedUriInfo uriInfo = new ParsedUriInfo();

        if (cleanUrl.startsWith("jdbc:postgresql://")) {
            String withoutJdbc = cleanUrl.substring("jdbc:".length());
            uriInfo = parsePostgresUri(withoutJdbc);
        } else if (cleanUrl.startsWith("postgres://") || cleanUrl.startsWith("postgresql://")) {
            uriInfo = parsePostgresUri(cleanUrl);
        }

        host = uriInfo.host != null ? uriInfo.host : host;
        port = uriInfo.port != null ? uriInfo.port : port;
        db = uriInfo.db != null ? uriInfo.db : db;

        String username = uriInfo.user != null ? uriInfo.user : (StringUtils.hasText(defaultUser) ? defaultUser.trim() : "postgres");
        String rawPassword = uriInfo.pass != null ? uriInfo.pass : (defaultPass != null ? defaultPass : "postgres");

        boolean isNeonHost = isNeon(host);
        boolean isCloud = isCloudHost(host);
        String endpoint = resolveEndpointId(host, explicitNeonEndpoint);
        String effectiveSsl = (isNeonHost || isCloud || StringUtils.hasText(explicitSslMode) || StringUtils.hasText(endpoint))
            ? (StringUtils.hasText(explicitSslMode) ? normalizeSslMode(explicitSslMode) : "require")
                : null;

        String query = buildQueryParams(uriInfo.query, endpoint, effectiveSsl, isNeonHost || isCloud);
        String finalPassword = formatNeonPassword(rawPassword, endpoint, isNeonHost);

        // Always generate a clean JDBC URL WITHOUT user:pass@ or ?password= embedded in the URL string
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
                    info.user = decodeUrl(up[0]);
                    info.pass = decodeUrl(up[1]);
                } else {
                    info.user = decodeUrl(userPass);
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

            // Also check query string for user, username, and password parameters (e.g. Supabase connection strings)
            if (StringUtils.hasText(info.query)) {
                Map<String, String> qParams = parseQueryString(info.query);
                if (info.user == null && qParams.containsKey("user")) {
                    info.user = decodeUrl(qParams.get("user"));
                }
                if (info.user == null && qParams.containsKey("username")) {
                    info.user = decodeUrl(qParams.get("username"));
                }
                if (info.pass == null && qParams.containsKey("password")) {
                    info.pass = decodeUrl(qParams.get("password"));
                }
                // Strip credentials from the JDBC query string so Hikari handles them cleanly
                qParams.remove("user");
                qParams.remove("username");
                qParams.remove("password");
                info.query = qParams.entrySet().stream()
                        .map(e -> StringUtils.hasText(e.getValue()) ? e.getKey() + "=" + e.getValue() : e.getKey())
                        .collect(Collectors.joining("&"));
                if (info.query.isEmpty()) {
                    info.query = null;
                }
            }
        } catch (Exception e) {
            log.warn("Could not parse URI '{}': {}", uriString, e.getMessage());
        }
        return info;
    }

    private static String decodeUrl(String val) {
        if (val == null) return null;
        try {
            return URLDecoder.decode(val, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return val;
        }
    }

    private static Map<String, String> parseQueryString(String query) {
        Map<String, String> params = new LinkedHashMap<>();
        if (!StringUtils.hasText(query)) return params;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                params.put(pair.substring(0, idx), pair.substring(idx + 1));
            } else if (StringUtils.hasText(pair)) {
                params.put(pair, "");
            }
        }
        return params;
    }

    public static boolean isNeon(String host) {
        if (!StringUtils.hasText(host)) return false;
        String lower = host.toLowerCase();
        return lower.contains(".neon.tech") || lower.contains(".neon.build") || lower.startsWith("ep-");
    }

    public static boolean isCloudHost(String host) {
        if (!StringUtils.hasText(host)) return false;
        String lower = host.toLowerCase();
        return lower.contains(".supabase.co")
                || lower.contains(".supabase.com")
                || lower.contains(".neon.tech")
                || lower.contains(".neon.build")
                || lower.contains(".render.com")
                || lower.contains(".railway.app")
                || lower.contains(".rds.amazonaws.com")
                || lower.contains(".aivencloud.com")
                || lower.contains(".cockroachlabs.cloud");
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

    private static String buildQueryParams(String existingQuery, String endpoint, String explicitSslMode, boolean requireSslDefault) {
        Map<String, String> params = new LinkedHashMap<>();

        if (StringUtils.hasText(existingQuery)) {
            params.putAll(parseQueryString(existingQuery));
            if (params.containsKey("sslmode")) {
                params.put("sslmode", normalizeSslMode(params.get("sslmode")));
            }
        }

        if (requireSslDefault || StringUtils.hasText(explicitSslMode)) {
            if (!params.containsKey("sslmode")) {
                params.put("sslmode", StringUtils.hasText(explicitSslMode) ? normalizeSslMode(explicitSslMode) : "require");
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

    private static String normalizeSslMode(String sslMode) {
        String normalized = sslMode.trim().toLowerCase();
        return "required".equals(normalized) ? "require" : normalized;
    }

    public static String sanitizeUrl(String url) {
        if (!StringUtils.hasText(url)) return "";
        return url.replaceAll("(?i)(password=)[^&]*", "$1****")
                .replaceAll("(?i)(:[^/@:]+@)", ":****@");
    }
}
