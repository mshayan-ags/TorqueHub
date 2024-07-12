# Use Microsoft-maintained image for small footprint and security patches
FROM node:20-alpine AS base
WORKDIR /usr/src/app

FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS release
ENV NODE_ENV=production \
    PORT=5000

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
