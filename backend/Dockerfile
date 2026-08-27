# ==============================================================================
# MoneyMate Backend — Production Multi-Stage Dockerfile for Render
# Stage 1: Build JAR using Maven & Eclipse Temurin JDK 17
# Stage 2: Minimal, Secure Eclipse Temurin JRE 17 Alpine Runtime
# ==============================================================================

# --- Stage 1: Maven Build ---
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy Maven descriptor and source code
COPY pom.xml .
COPY src ./src

# Build production JAR (clean package guarantees fresh dependency resolution)
RUN mvn clean package -DskipTests -B

# --- Stage 2: Lightweight Production Runtime ---
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install curl for container health check and tzdata for timezone accuracy
RUN apk add --no-cache curl tzdata

# Create dedicated non-root user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled production JAR from builder stage
COPY --from=builder /app/target/moneymate-backend-*.jar app.jar

# Set ownership to non-root user
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Render dynamically injects $PORT (defaults to 8080 for local/standard runs)
ENV PORT=8080
EXPOSE 8080

# Container healthcheck: probes Spring Boot /api/health endpoint using the dynamic PORT
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://127.0.0.1:${PORT:-8080}/api/health || exit 1

# Production JVM flags with container memory awareness, 0.0.0.0 bind, and dynamic port
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-8080} -Dserver.address=0.0.0.0 -jar app.jar"]
