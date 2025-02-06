FROM node:latest AS builder

WORKDIR /app
COPY ./ ./

RUN npm install && \
    npm run build

FROM node:latest AS runner

WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/dist ./dist

RUN npm install --omit=dev

CMD ["npm", "start"]