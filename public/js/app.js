var socket = io.connect("/?id=" + window.location.pathname.split("/").pop());

var tablet = document.getElementById("tablet"),
    canvas_a = document.getElementById("canvas-a"),
    canvas_b = document.getElementById("canvas-b"),
    ctx_a = canvas_a.getContext("2d"),
    ctx_b = canvas_b.getContext("2d"),
    colour = document.getElementById("colour"),
    colour_input = document.getElementById("colour-input"),
    colour_preview = document.getElementById("colour-preview");

canvas_a.height = window.innerHeight;
canvas_a.width = window.innerWidth;
canvas_b.height = window.innerHeight;
canvas_b.width = window.innerWidth;

var current_line = [],
    last_position = null,
    current_colour = "0,0,0";

var on_mousedown = function on_mousedown(ev) {
  if (tablet.penAPI.pressure !== 0) {
    current_line.push([ev.x, ev.y, tablet.penAPI.pressure]);
  }

  canvas_b.addEventListener("mousemove", on_mousemove);
  canvas_b.addEventListener("mouseup", on_mouseup);
};

var on_mouseup = function on_mouseup() {
  var data;

  if (current_line.length > 1) {
    data = {type: "line", points: current_line, colour: current_colour};
  } else if (current_line.length === 1) {
    data = {type: "point", point: current_line[0], colour: current_colour};
  }

  ctx_b.clearRect(0, 0, canvas_b.width, canvas_b.height);

  if (data) {
    on_draw(data);
    socket.emit("draw", data);
  }

  current_line = [];
  last_position = null;

  canvas_b.removeEventListener("mousemove", on_mousemove);
  canvas_b.removeEventListener("mouseup", on_mouseup);
};

var last_position = null;
var on_mousemove = function on_mousemove(ev) {
  if (last_position) {
    ctx_b.beginPath();
    ctx_b.lineWidth = 1;
    ctx_b.strokeStyle = "rgba(" + current_colour + "," + tablet.penAPI.pressure + ")";
    ctx_b.moveTo(last_position[0], last_position[1]);
    ctx_b.lineTo(ev.x, ev.y);
    ctx_b.stroke();
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

var on_keydown = function on_keydown(ev) {
  if (ev.keyCode === 81) {
    if (colour.style.display === "none") {
      colour.style.display = "block";
      colour_input.focus();
    } else {
      colour.style.display = "none";
    }
  }
};
document.addEventListener("keydown", on_keydown);

var on_blur = function on_blur() {
  colour.style.display = "none";
};
colour_input.addEventListener("blur", on_blur);

var on_keyup = function on_keyup() {
  if (!colour_input.value.match(/^[0-9A-F]$/i)) {
    colour_input.value = colour_input.value.replace(/[^0-9A-Fa-f]/g, "");
  }

  colour_preview.style.backgroundColor = "#" + colour_input.value;

  if (colour_input.value.match(/^[0-9A-F]{6}$/i)) {
    current_colour = colour_input.value.match(/(..)/g).map(function(e) { return parseInt(e, 16); }).join(",");
  }
};
colour_input.addEventListener("keyup", on_keyup);

var draw_line = function draw_line(data) {
  for (var i=1;i<data.points.length-1;++i) {
/*
    // All disabled for now. Will revisit later.
    //
    // This is very broken. What we need is a way to calculate the correct
    // points here.
    var cp1x = data.points[i][0],
        cp1y = data.points[i][1],
        cp2x = data.points[i][0],
        cp2y = data.points[i][1];

    // Take a look at http://www.w3schools.com/tags/canvas_beziercurveto.asp
    // and http://www.w3schools.com/tags/canvas_quadraticcurveto.asp for what
    // the bezierCurveTo method does, and a possible alternative in
    // quadraticCurveTo.

    ctx_a.beginPath();
    ctx_a.lineWidth = 1;
    ctx_a.strokeStyle = "rgba(" + (data.colour || "0,0,0") + "," + data.points[i][2] + ")";
    ctx_a.moveTo(data.points[i-1][0], data.points[i-1][1]);
    ctx_a.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, data.points[i][0], data.points[i][1]);
    ctx_a.stroke();
*/

    ctx_a.beginPath();
    ctx_a.lineWidth = 1;
    ctx_a.strokeStyle = "rgba(" + (data.colour || "0,0,0") + "," + data.points[i][2] + ")";
    ctx_a.moveTo(data.points[i-1][0], data.points[i-1][1]);
    ctx_a.lineTo(data.points[i][0], data.points[i][1]);
    ctx_a.stroke();
  }
};

var draw_point = function draw_point(data) {
  ctx_a.beginPath();
  ctx_a.lineWidth = 1;
  ctx_a.strokeStyle = "rgba(" + (data.colour || "0,0,0") + "," + data[2] + ")";
  ctx_a.moveTo(data[0], data[1]);
  ctx_a.lineTo(data[0], data[1]);
  ctx_a.stroke();
};

socket.on("ok", canvas_b.addEventListener.bind(canvas_b, "mousedown", on_mousedown));
socket.on("draw", on_draw);
