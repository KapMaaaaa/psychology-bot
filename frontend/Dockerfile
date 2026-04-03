FROM node:20
WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости с явной установкой опциональных зависимостей rollup
RUN rm -f package-lock.json && \
    npm install && \
    npm install @rollup/rollup-linux-x64-gnu --save-optional --force || true

COPY . .

EXPOSE 3000

# Том frontend_node_modules перекрывает node_modules из образа — при старте подтягиваем зависимости из package.json
ENTRYPOINT ["sh", "-c", "npm install && npm install @rollup/rollup-linux-x64-gnu --save-optional --force || true && exec npm run dev -- --host 0.0.0.0 --port 3000"]
