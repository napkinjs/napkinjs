var socket = io.connect();

var tablet = document.getElementById("tablet"),
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

var last_position = null;
var on_mousemove = function on_mousemove(ev) {
  if (last_position) {
    var data = {
      from_x: last_position.x,
      from_y: last_position.y,
      to_x: ev.x,
      to_y: ev.y,
      pressure: tablet.penAPI.pressure,
    };

    on_draw(data);
    socket.emit("draw", data);
  }

  if (tablet.penAPI.pressure === 0) {
    last_position = null;
  } else {
    last_position = {
      x: ev.x,
      y: ev.y,
    };
  }
};

var on_draw = function on_draw(data) {
  ctx.beginPath();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0,0,0," + data.pressure + ")";
  ctx.moveTo(data.from_x, data.from_y);
  ctx.lineTo(data.to_x, data.to_y);
  ctx.stroke();
};

socket.on("connect", canvas.addEventListener.bind(canvas, "mousemove", on_mousemove));
socket.on("draw", on_draw);
