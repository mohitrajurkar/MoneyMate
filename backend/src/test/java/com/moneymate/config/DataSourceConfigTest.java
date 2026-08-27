package com.moneymate.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DataSourceConfigTest {

    @Test
    void testLocalhostDefaultConfiguration() {
        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                "localhost",
                "5432",
                "moneymate",
                "postgres",
                "postgres",
                null,
                null,
                null
        );

        assertEquals("jdbc:postgresql://localhost:5432/moneymate", config.jdbcUrl());
        assertEquals("postgres", config.username());
        assertEquals("postgres", config.password());
        assertNull(config.endpointId());
        assertNull(config.sslMode());
    }

    @Test
    void testDockerComposeServiceConfiguration() {
        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                "postgres",
                "5432",
                "moneymate",
                "postgres",
                "secret123",
                null,
                null,
                null
        );

        assertEquals("jdbc:postgresql://postgres:5432/moneymate", config.jdbcUrl());
        assertEquals("postgres", config.username());
        assertEquals("secret123", config.password());
        assertNull(config.endpointId());
        assertNull(config.sslMode());
    }

    @Test
    void testNeonHostWithDedicatedVariablesAndTripleLayerRouting() {
        String staleRenderUrl = "jdbc:postgresql://old-broken-host:5432/db";

        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                "ep-cool-fog-123456.us-east-2.aws.neon.tech",
                "5432",
                "neondb",
                "neondb_owner",
                "mypassword",
                "ep-cool-fog-123456",
                "require",
                staleRenderUrl
        );

        assertEquals(
                "jdbc:postgresql://ep-cool-fog-123456.us-east-2.aws.neon.tech:5432/neondb?sslmode=require&options=endpoint%3Dep-cool-fog-123456",
                config.jdbcUrl()
        );
        assertEquals("neondb_owner", config.username());
        // Triple-layer authentication prefix ensures Neon routes correctly even without SNI
        assertEquals("endpoint=ep-cool-fog-123456;mypassword", config.password());
        assertEquals("ep-cool-fog-123456", config.endpointId());
        assertEquals("require", config.sslMode());
    }

    @Test
    void testNeonPoolerHostStripsPoolerSuffix() {
        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                "ep-cool-fog-123456-pooler.us-east-2.aws.neon.tech",
                "5432",
                "neondb",
                "neondb_owner",
                "mypassword",
                null,
                null,
                null
        );

        assertEquals(
                "jdbc:postgresql://ep-cool-fog-123456-pooler.us-east-2.aws.neon.tech:5432/neondb?sslmode=require&options=endpoint%3Dep-cool-fog-123456",
                config.jdbcUrl()
        );
        assertEquals("endpoint=ep-cool-fog-123456;mypassword", config.password());
        assertEquals("ep-cool-fog-123456", config.endpointId());
    }

    @Test
    void testNeonHostAutoDetectionWithoutExplicitNeonEndpoint() {
        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                "ep-silent-star-789.us-east-2.aws.neon.tech",
                "5432",
                "neondb",
                "owner_user",
                "secret_pass",
                null,
                null,
                null
        );

        assertEquals(
                "jdbc:postgresql://ep-silent-star-789.us-east-2.aws.neon.tech:5432/neondb?sslmode=require&options=endpoint%3Dep-silent-star-789",
                config.jdbcUrl()
        );
        assertEquals("endpoint=ep-silent-star-789;secret_pass", config.password());
    }

    @Test
    void testFallbackRawUrlWithEmbeddedCredentials() {
        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                "localhost",
                "5432",
                "moneymate",
                "postgres",
                "postgres",
                null,
                null,
                "postgres://user:pass@ep-remote-host.neon.tech/customdb?sslmode=require"
        );

        assertEquals(
                "jdbc:postgresql://ep-remote-host.neon.tech:5432/customdb?sslmode=require&options=endpoint%3Dep-remote-host",
                config.jdbcUrl()
        );
        assertEquals("user", config.username());
        assertEquals("endpoint=ep-remote-host;pass", config.password());
    }

    @Test
    void testSanitizeUrlRemovesCredentials() {
        String raw = "jdbc:postgresql://myuser:secretpassword123@ep-test.neon.tech/db?sslmode=require";
        String sanitized = DataSourceConfig.sanitizeUrl(raw);
        assertFalse(sanitized.contains("secretpassword123"));
        assertTrue(sanitized.contains(":****@"));
    }
}
