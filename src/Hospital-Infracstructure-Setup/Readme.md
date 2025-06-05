# Multi-stage Dockerfile for NestJS Hospital Management System
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/package*.json ./
USER nestjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js
CMD ["node", "dist/main.js"]
