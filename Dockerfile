FROM node:5

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Each component of the app is copied separately so that when it changes, only
# its layer is rebuilt, and its dependencies are not affected.

# Install NPM modules
COPY package.json .
RUN npm install

# Use an init system to properly handle signals
ENV TINI_VERSION v0.8.4
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Retrieve typings for Typescript
COPY tsd.json .
RUN ./node_modules/.bin/tsd install
COPY typings/local typings/local

# Compile server
COPY src/server src/server
RUN ./node_modules/.bin/tsc --module commonjs --outdir build src/server/*.ts

# Compile client
COPY src/client src/client
RUN ./node_modules/.bin/tsc --outDir static/js --removeComments src/client/*.ts

# Bring in static files
COPY certs certs
COPY views views
COPY static static
COPY decoy decoy

EXPOSE 80 443
CMD ["node", "build/server.js"]
