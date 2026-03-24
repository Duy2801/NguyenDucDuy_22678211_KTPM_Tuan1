# Stage 1: Build
FROM node:18 AS builder

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

# Stage 2: Run
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["npm", "start"]