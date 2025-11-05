const EnergyPanel = (() => {
  let sketchInstance;

  // valori passati dal listener Timeline
  let data = {
    U: 0,     // energia interna istantanea
    Qpos: 0,   // calore positivo accumulato (assorbito)
    Qneg: 0,   // calore negativo accumulato (ceduto, abs value)
    Wtot: 0,  // lavoro totale accumulato
    Qdot: 0,  // calore istantaneo (delta)
    Wdot: 0   // lavoro istantaneo (delta)
  };

  function init() {
    if (sketchInstance) sketchInstance.remove();
    sketchInstance = new p5(energySketch, "energyCanvas");
  }

  function update(newData) {
    data = { ...data, ...newData };
    if (sketchInstance && sketchInstance.setValues) {
      sketchInstance.setValues(data);
    }
  }

  function reset() {
    data = { U: 0, Qpos: 0, Qneg: 0, Wtot: 0, Qdot: 0, Wdot: 0 };
    if (sketchInstance && sketchInstance.reset) sketchInstance.reset();
  }

  // === p5.js SKETCH ===
  const energySketch = (p) => {
    let curData = { ...data };

    p.setup = function() {
      const canvas = p.createCanvas(600, 300);
      canvas.parent("energyCanvas");
      p.textAlign(p.CENTER, p.CENTER);
      p.rectMode(p.CENTER);
      p.noStroke();
    };

    p.windowResized = function() {
      p.resizeCanvas(600, 300);
    };

    p.setValues = function(d) {
      curData = { ...d };
    };

    p.reset = function() {
      curData = { U: 0, Qpos: 0, Qneg: 0, Wtot: 0, Qdot: 0, Wdot: 0 };
    };

    p.draw = function() {
      p.background(245);

      const cx = p.width / 2;
      const cy = p.height / 2;
      const boxW = 120;
      const boxH = 80;
      const offset = 200;

      // Box
      p.fill(240);
      p.stroke(180);
      p.rect(cx - offset, cy, boxW, boxH, 12); // Calore Q
      p.rect(cx, cy, boxW, boxH, 12);          // Energia interna U
      p.rect(cx + offset, cy, boxW, boxH, 12); // Lavoro W
      p.noStroke();

      // Titoli
      p.fill(0);
      p.textSize(14);
      p.text("Calore Q", cx - offset, cy - 40);
      p.text("Energia interna U", cx, cy - 40);
      p.text("Lavoro W", cx + offset, cy - 40);

      // Valori numerici
      p.textSize(16);
      //p.text(`${curData.Qtot.toFixed(1)} J`, cx - offset, cy + 10);
      p.text(`+${curData.Qpos.toFixed(1)} J`, cx - offset, cy - 6);
      p.text(`-${curData.Qneg.toFixed(1)} J`, cx - offset, cy + 18);
      p.text(`${curData.U.toFixed(1)} J`, cx, cy + 10);
      p.text(`${curData.Wtot.toFixed(1)} J`, cx + offset, cy + 10);

      // frecce animate
      const pulse = Math.sin(p.millis() / 300) * 0.5 + 0.5;
      const arrowSize = 15 + 5 * pulse;

      // Freccia Q ↔ U
      if (Math.abs(curData.Qdot) > AppState.tolerance) {
        p.stroke(curData.Qdot > 0 ? "red" : "blue");
        p.strokeWeight(3);
        if (curData.Qdot > 0) {
          drawArrow(p, cx - offset + boxW / 2, cy, cx - boxW / 2, cy, arrowSize);
        } else {
          drawArrow(p, cx - boxW / 2, cy, cx - offset + boxW / 2, cy, arrowSize);
        }
      }

      // Freccia U ↔ W
      if (Math.abs(curData.Wdot) > AppState.tolerance) {
        p.stroke(curData.Wdot > 0 ? "green" : "orange");
        p.strokeWeight(3);
        if (curData.Wdot > 0) {
          drawArrow(p, cx + boxW / 2, cy, cx + offset - boxW / 2, cy, arrowSize);
        } else {
          drawArrow(p, cx + offset - boxW / 2, cy, cx + boxW / 2, cy, arrowSize);
        }
      }

      p.noStroke();
    };

    function drawArrow(p, x1, y1, x2, y2, size) {
      p.line(x1, y1, x2, y2);
      const angle = Math.atan2(y2 - y1, x2 - x1);
      p.push();
      p.translate(x2, y2);
      p.rotate(angle);
      p.triangle(0, 0, -size, size / 2, -size, -size / 2);
      p.pop();
    }
  };

  return { init, update, reset };
})();
