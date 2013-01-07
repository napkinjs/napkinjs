#!/usr/bin/env node

var express = require("express"),
    fs = require("fs"),
    hat = require("hat"),
    http = require("http"),
    nconf = require("nconf"),
    optimist = require("optimist"),
    package = require("./package.json"),
    path = require("path"),
    redis = require("redis"),
    seaport = require("seaport"),
    socket_io = require("socket.io");

nconf.argv().env();
optimist.argv._.reverse().concat(["config.json"]).filter(function(e) { return e.match(/\.json$/); }).forEach(function(file) { nconf.file(file.toLowerCase().replace(/[^a-z0-9]+/g, "_"), path.join(process.cwd(), file)); });
nconf.defaults({
  http: {
    host: "127.0.0.1",
  },
  redis: {
    host: "127.0.0.1",
    port: 6379,
    db: 0,
    prefix: "napkinjs-",
  },
  seaport: {
    host: "127.0.0.1",
    port: 9999,
  },
});

var app = express(),
    server = http.createServer(app),
    io = socket_io.listen(server, {"log level": 0}),
    rack = hat.rack(20, 36),
    db = redis.createClient(nconf.get("redis:port"), nconf.get("redis:host"), {parser: "javascript"});

app.configure(function() {
  app.use(express.logger());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, "public")));
});

app.get("/", function(req, res, next) {
  return res.redirect("/" + rack());
});

app.get("/:session([a-z0-9]{4})", function(req, res, next) {
  fs.readFile(path.join(__dirname, "public", "index.html"), function(err, data) {
    if (err) {
      return next(err);
    }

    res.type("html");

    return res.send(data);
  });
});

app.get("/:session([a-z0-9]{4}).json", function(req, res, next) {
  db.lrange(nconf.get("redis:prefix") + req.param("session"), 0, -1, function(err, actions) {
    if (err) {
      return res.send(500);
    }

    res.type("json");
    res.write(actions.join("\n"));
    res.end();
  });
});

var sessions = {};
var get_session = function get_session(id, done) {
  if (typeof sessions[id] === "undefined") {
    sessions[id] = {
      clients: [],
    };
  }

  return done(null, sessions[id]);
};

io.sockets.on("connection", function(socket) {
  get_session(socket.handshake.query.id, function(err, session) {
    if (err) {
      return socket.emit("error", new Error("error getting session"));
    }

    if (!session) {
      return socket.emit("error", new Error("session not found"));
    }

    session.clients.push(socket);

    socket.on("disconnect", function() {
      var pos = session.clients.indexOf(socket);

      if (pos !== -1) {
        session.clients.splice(pos, 1);
      }
    });

    var key = nconf.get("redis:prefix") + socket.handshake.query.id;

    db.llen(key, function(err, len) {
      if (err) {
        return socket.emit("error", new Error("couldn't get length of action list"));
      }

      socket.emit("loading", len);

      db.lrange(key, 0, len, function(err, actions) {
        if (err) {
          return socket.emit("error", new Error("couldn't get action list data"));
        }

        actions.forEach(function(action) {
          socket.emit("draw", JSON.parse(action));
        });

        socket.on("draw", function(data) {
          session.clients.forEach(function(client) {
            if (client === socket) {
              return;
            }

            client.emit("draw", data);
          });

          db.rpush(key, JSON.stringify(data));
        });

        socket.emit("ok");
      });
    });
  });
});

var ports = seaport.connect(nconf.get("seaport:host"), nconf.get("seaport:port"));

server.listen(ports.register([package.name, package.version].join("@")), nconf.get("http:host"), function() {
  console.log("Server is listening on " + JSON.stringify(this.address()));
});
