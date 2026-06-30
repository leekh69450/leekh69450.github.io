const canvas = document.querySelector("#research-map");
const ctx = canvas.getContext("2d");
const year = document.querySelector("#year");

year.textContent = new Date().getFullYear();

let width = 0;
let height = 0;
let dpr = 1;
let nodes = [];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.clientWidth;
  height = canvas.clientHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  nodes = Array.from({ length: 34 }, (_, index) => {
    const band = index % 4;
    return {
      x: width * (0.16 + ((index * 37) % 73) / 100),
      y: height * (0.14 + ((index * 53) % 71) / 100),
      radius: 2.4 + band * 0.9,
      speed: 0.35 + band * 0.08,
      phase: index * 0.62,
      hue: band,
    };
  });
}

function drawGrid(time) {
  const spacing = Math.max(54, Math.min(width, height) / 11);
  ctx.save();
  ctx.translate(width * 0.56, height * 0.46);
  ctx.rotate(-0.28);
  ctx.translate(-width * 0.56, -height * 0.46);
  ctx.lineWidth = 1;

  for (let x = -spacing; x < width + spacing * 2; x += spacing) {
    const alpha = 0.08 + Math.sin(time * 0.0004 + x * 0.02) * 0.025;
    ctx.strokeStyle = `rgba(248,250,247,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(x, -height * 0.2);
    ctx.lineTo(x, height * 1.2);
    ctx.stroke();
  }

  for (let y = -spacing; y < height + spacing * 2; y += spacing) {
    const alpha = 0.07 + Math.cos(time * 0.0003 + y * 0.018) * 0.025;
    ctx.strokeStyle = `rgba(248,250,247,${alpha})`;
    ctx.beginPath();
    ctx.moveTo(-width * 0.1, y);
    ctx.lineTo(width * 1.1, y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTrajectory(time) {
  const points = [];
  const count = 12;
  for (let i = 0; i < count; i += 1) {
    const progress = i / (count - 1);
    const x = width * (0.18 + progress * 0.62);
    const y =
      height * (0.72 - Math.sin(progress * Math.PI * 1.35 + time * 0.00045) * 0.18) -
      progress * height * 0.18;
    points.push({ x, y });
  }

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(214,159,36,0.72)";
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point, index) => {
    const pulse = Math.sin(time * 0.004 + index) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(248,250,247,${0.72 + pulse * 0.22})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3.5 + pulse * 2.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawCorrespondence(time) {
  const colors = [
    "rgba(248,250,247,0.68)",
    "rgba(214,159,36,0.62)",
    "rgba(85,177,154,0.58)",
    "rgba(226,112,78,0.54)",
  ];

  nodes.forEach((node, index) => {
    const driftX = Math.sin(time * 0.0005 * node.speed + node.phase) * 16;
    const driftY = Math.cos(time * 0.00042 * node.speed + node.phase) * 14;
    const x = node.x + driftX;
    const y = node.y + driftY;

    if (index % 3 === 0) {
      const target = nodes[(index + 9) % nodes.length];
      const tx = target.x + Math.sin(time * 0.0005 * target.speed + target.phase) * 16;
      const ty = target.y + Math.cos(time * 0.00042 * target.speed + target.phase) * 14;
      ctx.strokeStyle = `rgba(248,250,247,${0.06 + (index % 5) * 0.012})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }

    ctx.fillStyle = colors[node.hue];
    ctx.beginPath();
    ctx.arc(x, y, node.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function animate(time) {
  ctx.clearRect(0, 0, width, height);
  drawGrid(time);
  drawCorrespondence(time);
  drawTrajectory(time);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
resize();
requestAnimationFrame(animate);
