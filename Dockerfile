FROM node:12-alpine3.9 as build

RUN apk --no-cache add git

COPY package*.json /

RUN npm ci

COPY . .

RUN npm install -g typescript

RUN npm run build

FROM node:12-alpine3.9

COPY package*.json /

COPY --from=build node_modules node_modules
COPY --from=build lib lib

COPY run.js run.js
COPY entrypoint.sh entrypoint.sh

ENV INPUT_HELP_URL "https://www.conventionalcommits.org/en/v1.0.0/"
ENV INPUT_CHECK_TITLE "true"
ENV INPUT_CHECK_COMMITS "true"

ENTRYPOINT ["/entrypoint.sh"]
