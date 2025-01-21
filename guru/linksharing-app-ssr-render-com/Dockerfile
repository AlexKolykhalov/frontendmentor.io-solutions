FROM node:22

ARG HOST=https://linksharing-app-ssr-render-com.onrender.com

WORKDIR /work

COPY . .

RUN npm install && npm run build

WORKDIR dist

RUN npm init -y

CMD [ "node", "index.js" ]