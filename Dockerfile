FROM node:22

# install postgres tools (pg_restore, psql, etc.)
RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# IMPORTANT: keep runtime clean (no restore here by default)
CMD ["node"]