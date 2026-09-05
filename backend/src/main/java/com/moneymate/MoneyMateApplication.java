package com.moneymate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
public class MoneyMateApplication {

    private static final Logger log = LoggerFactory.getLogger(MoneyMateApplication.class);

    public static void main(String[] args) {
        loadDotEnvIfPresent();
        SpringApplication.run(MoneyMateApplication.class, args);
    }

    private static void loadDotEnvIfPresent() {
        Path[] paths = new Path[]{
                Path.of(".env"),
                Path.of("../.env")
        };

        for (Path path : paths) {
            File file = path.toFile();
            if (file.exists() && file.isFile()) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = trimmed.indexOf('=');
                        if (eqIdx > 0) {
                            String key = trimmed.substring(0, eqIdx).trim();
                            String value = trimmed.substring(eqIdx + 1).trim();
                            if (value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'") && value.length() >= 2) {
                                value = value.substring(1, value.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    log.info("Loaded environment variables from {}", file.getAbsolutePath());
                    return;
                } catch (Exception e) {
                    log.warn("Could not load .env file from {}: {}", file.getAbsolutePath(), e.getMessage());
                }
            }
        }
    }
}
