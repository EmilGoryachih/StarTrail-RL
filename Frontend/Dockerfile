# Frontend/Dockerfile
FROM node:18-alpine

# Рабочая директория внутри контейнера
WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm

# Копируем только манифесты и ставим зависимости
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install

# Копируем всё приложение
COPY . .

# Собираем Next.js-приложение
RUN pnpm run build

# В проде запускаем Next.js сервер
CMD ["pnpm", "run", "start"]
