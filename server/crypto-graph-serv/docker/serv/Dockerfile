FROM node:14.17.2-buster-slim
WORKDIR /var/www/http/server
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 7100
CMD ["npm", "run", "start:prod"]