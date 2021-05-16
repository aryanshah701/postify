FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .
COPY .env.production .env

# TS -> JS
RUN npm run build

ENV NODE_ENV production 

EXPOSE 8080
CMD [ "node", "dist/index.js" ]

# Run as non root user
USER node
