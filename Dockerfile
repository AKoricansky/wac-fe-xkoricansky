### Build stage
FROM node:18-alpine AS build

WORKDIR /build

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

### Production stage
FROM ghcr.io/polyfea/spa-base

# Copy built files from build stage
COPY --from=build /build/www /spa/public

# Configure container
ENV OTEL_SERVICE_NAME=wac-fe-xkoricansky
ENV SPA_BASE_PORT=8080
EXPOSE 8080