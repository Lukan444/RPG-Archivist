# Development stage
FROM node:18.19.1-alpine3.19 AS development

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]

# Build stage
FROM node:18.19.1-alpine3.19 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:18.19.1-alpine3.19 AS production

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Copy uploads directory
COPY uploads ./uploads

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/index.js"]
