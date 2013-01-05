#!/usr/bin/env node

var express = require("express"),
    http = require("http"),
    path = require("path");

var app = express();

app.configure(function() {
  app.use(express.logger());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, "public")));
});

var server = http.createServer(app);

server.listen(8080, function() {
  console.log("Server is listening...");
});
