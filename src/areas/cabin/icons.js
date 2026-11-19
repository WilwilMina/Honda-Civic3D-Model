// Cabin warning-light symbols, drawn on 128x128 canvases (white on transparent) so they can be tinted when lit.
// iconCanvas(draw) makes a canvas from one of the ICONS drawing functions; cluster.js turns them into textures
// for the gauge-cluster lights, and controls.js reuses the fuel pump for the fuel-door release decal.

// Draw `draw(g)` on a fresh square canvas in a 128-unit coordinate space, white strokes and fills.
export function iconCanvas(draw, size = 128) {
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const g = cv.getContext("2d");
  g.clearRect(0, 0, size, size);
  g.save();
  g.scale(size / 128, size / 128);
  g.strokeStyle = g.fillStyle = "#fff";
  g.lineWidth = 7;
  g.lineCap = g.lineJoin = "round";
  draw(g);
  g.restore();
  return cv;
}

// centred bold label (BRAKE, ABS, H/C...)
const text = (g, t, x, y, px) => {
  g.font = `bold ${px}px Arial, Helvetica, sans-serif`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(t, x, y);
};
// the two "( )" brackets either side of the brake/ABS circle
const arcs = (g, r) => {
  g.lineWidth = 6;
  g.beginPath();
  g.arc(64, 64, r, Math.PI * 0.62, Math.PI * 1.38);
  g.stroke();
  g.beginPath();
  g.arc(64, 64, r, -Math.PI * 0.38, Math.PI * 0.38);
  g.stroke();
};

// One drawing function per `icon` name used in cluster.js LIGHTS (plus `temp`, the shared thermometer).
export const ICONS = {
  brake(g) {
    text(g, "BRAKE", 64, 66, 34);
  },
  abs(g) {
    g.lineWidth = 6;
    g.beginPath();
    g.arc(64, 64, 36, 0, Math.PI * 2);
    g.stroke();
    arcs(g, 48);
    text(g, "ABS", 64, 66, 27);
  },
  oil(g) {
    // oil can with a drip
    g.beginPath();
    g.moveTo(20, 54);
    g.lineTo(34, 54);
    g.lineTo(40, 48);
    g.lineTo(66, 48);
    g.lineTo(100, 38);
    g.lineTo(84, 82);
    g.lineTo(34, 82);
    g.lineTo(34, 62);
    g.lineTo(20, 60);
    g.closePath();
    g.stroke();
    g.beginPath();
    g.moveTo(52, 48);
    g.lineTo(52, 40);
    g.moveTo(44, 40);
    g.lineTo(60, 40);
    g.stroke();
    g.beginPath();
    g.moveTo(108, 52);
    g.quadraticCurveTo(102, 64, 108, 68);
    g.quadraticCurveTo(114, 64, 108, 52);
    g.fill();
  },
  battery(g) {
    g.strokeRect(18, 42, 92, 52);
    g.fillRect(30, 32, 16, 10);
    g.fillRect(82, 32, 16, 10);
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(32, 68);
    g.lineTo(48, 68);
    g.moveTo(40, 60);
    g.lineTo(40, 76);
    g.moveTo(80, 68);
    g.lineTo(96, 68);
    g.stroke();
  },
  cel(g) {
    // engine outline
    g.beginPath();
    g.moveTo(26, 52);
    g.lineTo(26, 84);
    g.moveTo(26, 68);
    g.lineTo(36, 68);
    g.lineTo(36, 50);
    g.lineTo(48, 50);
    g.lineTo(48, 42);
    g.lineTo(78, 42);
    g.lineTo(78, 50);
    g.lineTo(90, 50);
    g.lineTo(98, 58);
    g.lineTo(108, 52);
    g.lineTo(108, 88);
    g.lineTo(98, 82);
    g.lineTo(92, 92);
    g.lineTo(46, 92);
    g.lineTo(36, 84);
    g.lineTo(36, 68);
    g.stroke();
    g.beginPath();
    g.moveTo(54, 42);
    g.lineTo(54, 32);
    g.moveTo(46, 32);
    g.lineTo(72, 32);
    g.moveTo(64, 32);
    g.lineTo(64, 42);
    g.stroke();
  },
  srs(g) {
    // seated person with an airbag in front
    g.beginPath();
    g.arc(46, 30, 10, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 9;
    g.beginPath();
    g.moveTo(44, 46);
    g.lineTo(52, 74);
    g.lineTo(80, 74);
    g.lineTo(86, 100);
    g.stroke();
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(48, 56);
    g.lineTo(66, 62);
    g.stroke();
    g.beginPath();
    g.arc(86, 46, 18, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(30, 44);
    g.lineTo(40, 86);
    g.lineTo(60, 92);
    g.stroke();
  },
  belt(g) {
    // person with a diagonal belt
    g.beginPath();
    g.arc(64, 26, 11, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.moveTo(40, 112);
    g.lineTo(42, 58);
    g.quadraticCurveTo(44, 42, 64, 42);
    g.quadraticCurveTo(84, 42, 86, 58);
    g.lineTo(88, 112);
    g.closePath();
    g.fill();
    g.strokeStyle = "#000";
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(80, 46);
    g.lineTo(48, 100);
    g.stroke();
  },
  temp(g) {
    // thermometer over waves
    g.beginPath();
    g.moveTo(64, 20);
    g.lineTo(64, 68);
    g.stroke();
    g.beginPath();
    g.arc(64, 74, 9, 0, Math.PI * 2);
    g.fill();
    g.lineWidth = 5;
    for (const y of [30, 42, 54]) {
      g.beginPath();
      g.moveTo(68, y);
      g.lineTo(82, y);
      g.stroke();
    }
    g.lineWidth = 6;
    for (const y of [96, 110]) {
      g.beginPath();
      g.moveTo(22, y);
      for (let x = 22; x <= 106; x += 14)
        (g.quadraticCurveTo(x + 3.5, y - 7, x + 7, y), g.quadraticCurveTo(x + 10.5, y + 7, x + 14, y));
      g.stroke();
    }
  },
  tempH(g) {
    ICONS.temp(g);
    text(g, "H", 100, 30, 30);
  },
  tempC(g) {
    ICONS.temp(g);
    text(g, "C", 100, 30, 30);
  },
  door(g) {
    // car seen from above with a door open
    g.beginPath();
    g.moveTo(44, 18);
    g.lineTo(84, 18);
    g.quadraticCurveTo(94, 20, 94, 34);
    g.lineTo(94, 98);
    g.quadraticCurveTo(94, 112, 84, 112);
    g.lineTo(44, 112);
    g.quadraticCurveTo(34, 112, 34, 98);
    g.lineTo(34, 34);
    g.quadraticCurveTo(34, 20, 44, 18);
    g.stroke();
    g.beginPath();
    g.moveTo(34, 50);
    g.lineTo(12, 70);
    g.stroke();
    g.fillRect(44, 40, 40, 12);
  },
  key(g) {
    g.lineWidth = 8;
    g.beginPath();
    g.arc(38, 64, 20, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(58, 64);
    g.lineTo(112, 64);
    g.moveTo(96, 64);
    g.lineTo(96, 82);
    g.moveTo(108, 64);
    g.lineTo(108, 78);
    g.stroke();
  },
  info(g) {
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(64, 16);
    g.lineTo(114, 106);
    g.lineTo(14, 106);
    g.closePath();
    g.stroke();
    g.fillRect(59, 44, 10, 36);
    g.fillRect(59, 88, 10, 10);
  },
  eps(g) {
    // steering wheel with "!"
    g.beginPath();
    g.arc(58, 64, 36, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.arc(58, 64, 10, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.moveTo(22, 64);
    g.lineTo(48, 64);
    g.moveTo(68, 64);
    g.lineTo(94, 64);
    g.moveTo(58, 74);
    g.lineTo(58, 100);
    g.stroke();
    g.fillRect(104, 34, 9, 36);
    g.fillRect(104, 78, 9, 9);
  },
  tpms(g) {
    // tire cross-section with "!"
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(30, 96);
    g.quadraticCurveTo(14, 64, 32, 30);
    g.lineTo(96, 30);
    g.quadraticCurveTo(114, 64, 98, 96);
    g.stroke();
    g.beginPath();
    for (let x = 30; x <= 98; x += 11.3) {
      g.lineTo(x, 102);
      g.lineTo(x + 5.6, 96);
    }
    g.stroke();
    g.fillRect(59, 42, 10, 30);
    g.fillRect(59, 78, 10, 10);
  },
  vsa(g) {
    // car with skid lines
    g.beginPath();
    g.moveTo(34, 62);
    g.lineTo(44, 34);
    g.lineTo(84, 34);
    g.lineTo(94, 62);
    g.lineTo(94, 76);
    g.lineTo(34, 76);
    g.closePath();
    g.stroke();
    g.fillRect(38, 76, 12, 9);
    g.fillRect(78, 76, 12, 9);
    g.lineWidth = 6;
    for (const x of [40, 88]) {
      g.beginPath();
      g.moveTo(x, 92);
      g.bezierCurveTo(x - 12, 100, x + 12, 108, x, 120);
      g.stroke();
    }
  },
  fuel(g) {
    // fuel pump
    g.strokeRect(30, 26, 46, 80);
    g.fillRect(36, 34, 34, 22);
    g.beginPath();
    g.moveTo(76, 60);
    g.lineTo(90, 60);
    g.lineTo(90, 90);
    g.quadraticCurveTo(90, 98, 98, 98);
    g.quadraticCurveTo(106, 98, 106, 90);
    g.lineTo(106, 44);
    g.lineTo(94, 30);
    g.stroke();
    g.fillRect(22, 104, 62, 8);
  },
  wrench(g) {
    g.save();
    g.translate(64, 64);
    g.rotate(-Math.PI / 4);
    g.fillRect(-7, -30, 14, 64);
    g.beginPath();
    g.arc(0, -38, 20, Math.PI * 0.32, Math.PI * 2.68, false);
    g.lineTo(-7, -46);
    g.lineTo(-7, -60);
    g.lineTo(7, -60);
    g.lineTo(7, -46);
    g.closePath();
    g.fill();
    g.beginPath();
    g.arc(0, 40, 14, 0, Math.PI * 2);
    g.fill();
    g.restore();
  },
};
