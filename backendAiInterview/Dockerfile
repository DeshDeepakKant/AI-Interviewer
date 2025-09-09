FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
CMD [ "npm", "start"]