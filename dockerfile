FROM node:20-slim AS builder

WORKDIR /app
COPY package.json ./package.json
COPY tsconfig.json ./tsconfig.json
COPY src ./src

RUN npm install && \
    npm run build

FROM node:20-slim

WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

RUN npm install --omit=dev

CMD ["npm", "start"]