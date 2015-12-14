FROM node:5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Each component of the app is copied separately so that when it changes, only
# its layer is rebuilt, and its dependencies are not affected.

# Install NPM modules
COPY package.json .
RUN npm install

# Retrieve typings for Typescript
COPY tsd.json .
RUN ./node_modules/.bin/tsd install
COPY typings/local typings/local

# Compile server
COPY src/server src/server
RUN ./node_modules/.bin/tsc --module commonjs --outdir build src/server/*.ts

# Compile client
COPY src/client src/client
RUN ./node_modules/.bin/tsc --outDir static/js src/client/*.ts

# Bring in static files
COPY views views
COPY static static
COPY certs certs

EXPOSE 8080
CMD ["node", "build/server.js"]
