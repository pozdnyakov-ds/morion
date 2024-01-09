FROM node:18.17.1

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

RUN apt -y update
RUN apt install -y mc

CMD ["node", ".output/server/index.mjs"]