# Stage 1: Build the React Frontend
FROM node:22-slim AS builder
WORKDIR /app/frontend
# Copy only the frontend package.json first
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend code and build it
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Node.js Backend
FROM node:22-slim
WORKDIR /app/backend
# Copy only the backend package.json first
COPY backend/package*.json ./
RUN npm install

# 🔥 FIX 1: Explicitly install the packages missing from your package.json
RUN npm install @google-cloud/storage better-sqlite3 tsx

# Copy the rest of the backend code
COPY backend/ ./

# 🔥 FIX 2: Put the built frontend EXACTLY where server.ts is looking for it!
RUN mkdir -p /app/frontend/dist
COPY --from=builder /app/frontend/dist /app/frontend/dist

# Expose port and start
EXPOSE 3000
ENV PORT=3000

# Start the server (runs from inside /app/backend)
CMD ["npx", "tsx", "server.ts"]