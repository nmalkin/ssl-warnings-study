FROM node:5

COPY . /usr/src/app

WORKDIR /usr/src//app
RUN npm install
RUN ./node_modules/.bin/tsc --sourcemap --module commonjs *.ts

EXPOSE 8080
CMD ["node", "index.js"]
