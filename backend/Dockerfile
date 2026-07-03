FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --production

# Copy source — no cache layer
COPY . .

# Verify critical route file exists at build time
RUN test -f src/routes/api.routes.js && echo "Routes OK" || (echo "Routes MISSING" && exit 1)

EXPOSE 3000

CMD ["node", "src/server.js"]
