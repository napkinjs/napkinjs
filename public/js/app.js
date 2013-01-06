var socket = io.connect();

var tablet = document.getElementById("tablet"),
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

var current_line = [],
    last_position = null;

var on_mousedown = function on_mousedown(ev) {
  if (tablet.penAPI.pressure !== 0) {
    current_line.push([ev.x, ev.y, tablet.penAPI.pressure]);
  }

  canvas.addEventListener("mousemove", on_mousemove);
  canvas.addEventListener("mouseup", on_mouseup);
};

var on_mouseup = function on_mouseup() {
  if (current_line.length > 1) {
    socket.emit("draw", {type: "line", points: current_line});
  } else if (current_line.length === 1) {
    socket.emit("draw", {type: "point", point: current_line[0]});
  }

  current_line = [];
  last_position = null;

  canvas.removeEventListener("mousemove", on_mousemove);
  canvas.removeEventListener("mouseup", on_mouseup);
};

var last_position = null;
var on_mousemove = function on_mousemove(ev) {
  if (last_position) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0," + tablet.penAPI.pressure + ")";
    ctx.moveTo(last_position[0], last_position[1]);
    ctx.lineTo(ev.x, ev.y);
    ctx.stroke();
  }

  if (tablet.penAPI.pressure !== 0) {
    current_line.push([ev.x, ev.y, tablet.penAPI.pressure]);
    last_position = [ev.x, ev.y];
  }
};

var on_draw = function on_draw(data) {
  console.log("Drawing object of type: " + data.type);

  if (data.type === "line") {
    draw_line(data);
  } else if (data.type === "point") {
    draw_point(data);
  }
};

var draw_line = function draw_line(data) {
  for (var i=0;i<data.points.length-1;++i) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0," + data.points[i+1][2] + ")";
    ctx.moveTo(data.points[i][0], data.points[i][1]);
    ctx.lineTo(data.points[i+1][0], data.points[i+1][1]);
    ctx.stroke();
  }
};
    
var draw_point = function draw_point(data) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0,0,0," + data[2] + ")";
  ctx.moveTo(data[0], data[1]);
  ctx.lineTo(data[0], data[1]);
  ctx.stroke();
};

socket.on("connect", canvas.addEventListener.bind(canvas, "mousedown", on_mousedown));
socket.on("draw", on_draw);
