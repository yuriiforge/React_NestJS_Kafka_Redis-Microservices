FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci


FROM deps AS dev

COPY . .
EXPOSE 3004
CMD ["npm", "run", "start:dev"]


FROM deps AS builder

COPY . .
RUN npm run build


FROM node:22-alpine AS prod

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3003
CMD ["node", "dist/main"]