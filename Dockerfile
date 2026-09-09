# ----------------------------------------------------
# MAHALEELA FASHION — Multi-Stage Production Dockerfile
# ----------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build frontend bundle into /dist
COPY . .
RUN npm run build

# ----------------------------------------------------
# Production Runtime Container
# ----------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled frontend and backend assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/public ./public
RUN mkdir -p uploads

EXPOSE 5000

CMD ["npm", "start"]
