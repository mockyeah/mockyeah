FROM node:12

WORKDIR /app

COPY package*.json .mockyeah.json ./

RUN yarn --prod

EXPOSE 4001 4777

CMD ["./node_modules/.bin/mockyeah", "playAll"]
