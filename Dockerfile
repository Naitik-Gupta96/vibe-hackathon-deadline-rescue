FROM node:20-alpine AS server-builder
WORKDIR /app
COPY package.json tsconfig.server.json ./
COPY server/ ./server/
COPY server.ts ./
RUN npm install
RUN npx tsc --project tsconfig.server.json

FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=server-builder /app/dist-server ./dist-server
COPY --from=server-builder /app/node_modules ./node_modules
COPY --from=server-builder /app/package.json ./
COPY --from=frontend-builder /app/dist ./frontend/dist
COPY .env ./
EXPOSE 3000
CMD ["node", "dist-server/server.js"]