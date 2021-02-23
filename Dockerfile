FROM node:12-alpine3.9 as build

RUN apk --no-cache add git

COPY package*.json /

RUN npm ci

COPY . .

RUN npm install -g typescript

RUN npm run build

FROM node:12-alpine3.9

COPY package*.json /

RUN npm ci --production

COPY --from=build lib lib

COPY run.js run.js
COPY entrypoint.sh entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
