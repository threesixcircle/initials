FROM node:alpine

RUN apk add --update graphicsmagick

WORKDIR /app

COPY . .

RUN yarn install

EXPOSE 3000

ENTRYPOINT [ "node", "src/index.js" ]
