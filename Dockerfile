FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

RUN echo "inet4_only = on" >> /etc/wgetrc
ENV MAVEN_OPTS="-Djava.net.preferIPv4Stack=true"

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN chmod +x mvnw
# Install local in-house libraries
COPY libs/ libs/
RUN ./mvnw install:install-file \
    -Dfile=libs/feature-flag-lib-1.0.0.jar \
    -DgroupId=com.example \
    -DartifactId=feature-flag-lib \
    -Dversion=1.0.0 \
    -Dpackaging=jar

# Download dependencies
RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
