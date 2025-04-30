# Usa la imagen oficial de Node.js como la imagen base
FROM node:20.12.0-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

COPY . .

RUN npx prisma generate
RUN npm run build

#prod stage
FROM node:20.12.0-alpine AS prod

# Instala `pg_dump`
RUN apk update && apk add postgresql-client

WORKDIR /usr/src/app


ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/prisma ./prisma
COPY --from=build /usr/src/app/package.json  ./package.json
# COPY package*.json ./

RUN npm install --only=production

# RUN rm package*.json

RUN npm run build

EXPOSE ${PORT}

CMD ["npm run","start:prod" ]