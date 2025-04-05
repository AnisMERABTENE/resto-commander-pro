FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/server.ts"]
