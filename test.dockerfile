FROM node:current-slim

RUN apt update && apt upgrade -y 

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["./init.sh"]


