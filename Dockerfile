FROM node:22-alpine

WORKDIR /app

COPY . .
COPY package.json ./

RUN npm install --verbose

ENTRYPOINT "./docker-entrypoint.sh"
