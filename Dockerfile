FROM node:22-alpine

WORKDIR /app

COPY . .
COPY package.json ./

RUN npm install --verbose

EXPOSE 7788
ENTRYPOINT "./docker-entrypoint.sh"
