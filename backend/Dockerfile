# ==============================================================================
# MoneyMate Backend — Production Multi-Stage Dockerfile
# Stage 1: Build JAR using Maven & JDK 17
# Stage 2: Minimal, Secure JRE 17 Alpine Runtime
# ==============================================================================

# --- Stage 1: Maven Build ---
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production package
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Lightweight Production Runtime ---
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for container healthcheck
RUN apk add --no-cache curl tzdata

# Create dedicated non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled JAR from build stage
COPY --from=builder /app/target/moneymate-backend-*.jar app.jar
RUN chown -R appuser:appgroup /app

USER appuser

# Expose backend port
EXPOSE 8080

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Optimized JVM memory and security flags for containerized environment
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+ExitOnOutOfMemoryError", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
