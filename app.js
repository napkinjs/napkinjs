#!/usr/bin/env node

var express = require("express"),
    http = require("http"),
    path = require("path"),
    socket_io = require("socket.io");

var app = express(),
    server = http.createServer(app),
    io = socket_io.listen(server, {"log level": 0});

app.configure(function() {
  app.use(express.logger());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, "public")));
});

io.sockets.on("connection", function(socket) {
  socket.on("draw", function(data) {
    socket.broadcast.emit("draw", data);
  });
});

server.listen(8080, function() {
  console.log("Server is listening...");
});
