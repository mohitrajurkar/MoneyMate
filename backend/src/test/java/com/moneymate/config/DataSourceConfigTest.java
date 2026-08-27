package com.moneymate.config;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class DataSourceConfigTest {

    @Test
    void testLocalhostDefaultConfiguration() {
        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                null,
                "5432",
                "moneymate",
                "postgres",
                "postgres",
                null,
                null,
                null
        );

        assertEquals("jdbc:postgresql://localhost:5432/moneymate", config.jdbcUrl());
        assertEquals("localhost", config.host());
        assertEquals("5432", config.port());
        assertEquals("postgres", config.username());
        assertEquals("postgres", config.password());
        assertFalse(config.isNeon());
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
        assertEquals("postgres", config.host());
        assertEquals("postgres", config.username());
        assertEquals("secret123", config.password());
        assertFalse(config.isNeon());
    }

    @Test
    void testDedicatedNeonVariables() {
        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                "ep-patient-mode-a76n14s1.ap-southeast-2.aws.neon.tech",
                "5432",
                "neondb",
                "neondb_owner",
                "npg_mypassword",
                "ep-patient-mode-a76n14s1",
                "require",
                null
        );

        assertEquals(
                "jdbc:postgresql://ep-patient-mode-a76n14s1.ap-southeast-2.aws.neon.tech:5432/neondb?sslmode=require&options=endpoint%3Dep-patient-mode-a76n14s1",
                config.jdbcUrl()
        );
        assertEquals("ep-patient-mode-a76n14s1.ap-southeast-2.aws.neon.tech", config.host());
        assertEquals("5432", config.port());
        assertEquals("neondb_owner", config.username());
        assertEquals("endpoint=ep-patient-mode-a76n14s1;npg_mypassword", config.password());
        assertEquals("ep-patient-mode-a76n14s1", config.endpointId());
        assertEquals("require", config.sslMode());
        assertTrue(config.isNeon());
    }

    @Test
    void testSpringDatasourceUrlWithEmbeddedCredentials() {
        // Exactly what was configured in Render's SPRING_DATASOURCE_URL
        String renderUrl = "jdbc:postgresql://neondb_owner:npg_eC3dpPYKim6g@ep-patient-mode-a76n14s1.ap-southeast-2.aws.neon.tech:5432/neondb?sslmode=require";

        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                renderUrl
        );

        // Host MUST be cleanly extracted without user:pass@
        assertEquals("ep-patient-mode-a76n14s1.ap-southeast-2.aws.neon.tech", config.host());
        assertEquals("5432", config.port());
        assertEquals("neondb", config.database());
        assertEquals("neondb_owner", config.username());
        assertEquals("endpoint=ep-patient-mode-a76n14s1;npg_eC3dpPYKim6g", config.password());
        assertEquals("ep-patient-mode-a76n14s1", config.endpointId());
        assertEquals(
                "jdbc:postgresql://ep-patient-mode-a76n14s1.ap-southeast-2.aws.neon.tech:5432/neondb?sslmode=require&options=endpoint%3Dep-patient-mode-a76n14s1",
                config.jdbcUrl()
        );
        assertTrue(config.isNeon());
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
    void testDedicatedVariablesOverrideFallbackUrl() {
        String staleUrl = "jdbc:postgresql://old-host:5432/olddb";

        DataSourceConfig.ParsedDbConfig config = DataSourceConfig.resolveDatabaseConfig(
                "ep-patient-mode-a76n14s1.ap-southeast-2.aws.neon.tech",
                "5432",
                "neondb",
                "neondb_owner",
                "mypassword",
                "ep-patient-mode-a76n14s1",
                "require",
                staleUrl
        );

        assertEquals("ep-patient-mode-a76n14s1.ap-southeast-2.aws.neon.tech", config.host());
        assertEquals("neondb", config.database());
    }

    @Test
    void testSanitizeUrlRemovesCredentials() {
        String raw = "jdbc:postgresql://myuser:secretpassword123@ep-test.neon.tech/db?sslmode=require";
        String sanitized = DataSourceConfig.sanitizeUrl(raw);
        assertFalse(sanitized.contains("secretpassword123"));
        assertTrue(sanitized.contains(":****@"));
    }
}
