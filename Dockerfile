FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . /app
RUN npm run build

VOLUME /data

EXPOSE 8080

ENV LIBRARY_DIR=/data \
    PORT=8080

CMD ["npm", "start"]