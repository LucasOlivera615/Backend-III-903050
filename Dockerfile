FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node src ./src

RUN mkdir -p uploads logs && chown -R node:node uploads logs

ENV NODE_ENV=production

ENV PORT=8080

EXPOSE 8080

USER node

CMD ["node", "src/server.js"]
