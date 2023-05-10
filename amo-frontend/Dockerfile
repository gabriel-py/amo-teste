FROM node:12-alpine as builder

WORKDIR /app

COPY package.json /app

RUN npm install --silent

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]