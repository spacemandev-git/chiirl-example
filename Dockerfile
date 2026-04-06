FROM oven/bun:1-debian
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --production
RUN bunx playwright install --with-deps chromium
COPY . .
EXPOSE 3000
CMD ["bun", "index.ts"]
