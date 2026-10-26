FROM node:14.17.2-buster-slim AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:16.20.2-bullseye-slim AS build
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN ./node_modules/.bin/react-scripts build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80