FROM oven/bun:1-debian
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install
COPY . .
RUN ./node_modules/.bin/playwright-core install --with-deps chromium
EXPOSE 3000
CMD ["bun", "index.ts"]
