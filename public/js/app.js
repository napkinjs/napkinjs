var tablet = document.getElementById("tablet"),
    canvas = document.getElementById("canvas"),
    ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

var last_position = null;
canvas.addEventListener("mousemove", function on_mousemove(ev) {
  if (last_position) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0,0,0," + tablet.penAPI.pressure + ")";
    ctx.moveTo(last_position.x, last_position.y);
    ctx.lineTo(ev.x, ev.y);
    ctx.stroke();
  }

  if (tablet.penAPI.pressure === 0) {
    last_position = null;
  } else {
    last_position = {
      x: ev.x,
      y: ev.y,
    };
  }
});
