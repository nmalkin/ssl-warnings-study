FROM node:5

COPY . /usr/src/app
WORKDIR /usr/src/app

# Install NPM modules
RUN npm install
# Retrieve typings for Typescript
RUN ./node_modules/.bin/tsd install
# Compile source code
RUN ./node_modules/.bin/tsc --module commonjs *.ts
RUN ./node_modules/.bin/tsc --outDir static/js src/client/*.ts

EXPOSE 8080
CMD ["node", "index.js"]
