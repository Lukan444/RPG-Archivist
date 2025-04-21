# Development stage
FROM node:18.19.1-alpine3.19 AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# Build stage
FROM node:18.19.1-alpine3.19 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Set environment variables for production build
ARG REACT_APP_API_URL=/api
ARG REACT_APP_SOCKET_URL=
ARG REACT_APP_ENV=production

ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_SOCKET_URL=$REACT_APP_SOCKET_URL
ENV REACT_APP_ENV=$REACT_APP_ENV
ENV NODE_ENV=production

RUN npm run build

# Production stage
FROM nginx:1.25.4-alpine AS production

# Add non-root user for security
RUN addgroup -g 101 -S nginx && \
    adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx nginx

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a directory for health check
RUN mkdir -p /usr/share/nginx/html/health

# Set proper permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Switch to non-root user
USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD [ "wget", "-q", "--spider", "http://localhost:80/health" ]

CMD ["nginx", "-g", "daemon off;"]
