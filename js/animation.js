const Animation = (() => {
  let instance = null;
  let state = { P: 0, V: 0, T: 300 };
  let energy = { Q: 0 };
  let scales = { maxV: 1, maxT: 500, maxP: 100 };

  function drawIndicator(s, value, max, x, y, label, unit, color) {
    const width = 30;
    const height = 160;
    
    // Draw background
    s.fill(220);
    s.rect(x, y, width, height, 5);
    
    // Draw level
    s.fill(color);
    const level = s.map(value, 0, max, 0, height - 10);
    s.rect(x + 5, y + height - 5 - level, width - 10, level, 3);
    
    // Draw label
    s.fill(0);
    s.textSize(12);
    s.textAlign(s.CENTER);
    s.text(label, x + width/2, y - 10);
    s.text(Math.round(value) + unit, x + width/2, y + height + 15);
  }

  function drawFlames(s, Q, x, y) {
    const intensity = 1;
    for(let i = 0; i < 5; i++) {
      const flameHeight = 30 * intensity * (1 + 0.2 * Math.sin(s.frameCount/10 + i));
      s.fill(255, 80 + 120 * intensity, 0, 200);
      s.beginShape();
      s.vertex(x - 40 + i*20, y);
      s.bezierVertex(
        x - 40 + i*20 - 10, y - flameHeight/2,
        x - 40 + i*20 + 10, y - flameHeight/2,
        x - 40 + i*20, y - flameHeight
      );
      s.endShape();
    }
  }

  function drawIce(s, Q, x, y) {
    // intensity basata su Q (Q negativo -> raffreddamento)
    const intensity = 1;
    s.push();
    s.translate(x, y);

    // disegna 3 cubetti sovrapposti, leggermente oscillanti
    for (let i = 0; i < 3; i++) {
      s.push();
      const dx = (i - 1) * 34 + 6 * Math.sin(s.frameCount / 14 + i);
      const dy = -6 * i + 4 * Math.cos(s.frameCount / 18 + i);
      s.translate(dx, dy);

      const size = 34 - i * 6;
      const w = size;
      const h = size * 0.7;
      const skew = 10; // prospettiva

      // colori per top/front/right con trasparenze legate all'intensità
      const topCol = s.color(200, 245, 255, 220 * intensity + 35);
      const frontCol = s.color(150, 215, 245, 200 * intensity + 30);
      const rightCol = s.color(120, 195, 230, 180 * intensity + 25);

      // angoli del rettangolo base (centro origine)
      const Ax = -w / 2, Ay = -h / 2;
      const Bx = w / 2, By = -h / 2;
      const Cx = w / 2, Cy = h / 2;
      const Dx = -w / 2, Dy = h / 2;

      // faccia superiore (leggermente spostata verso l'alto per lo "skew")
      s.noStroke();
      s.fill(topCol);
      s.beginShape();
      s.vertex(Ax, Ay - skew);
      s.vertex(Bx, By - skew);
      s.vertex(Bx - skew, By);
      s.vertex(Ax - skew, Ay);
      s.endShape(s.CLOSE);

      // faccia frontale
      s.fill(frontCol);
      s.beginShape();
      s.vertex(Ax - skew, Ay);
      s.vertex(Bx - skew, By);
      s.vertex(Bx - skew, By + h);
      s.vertex(Ax - skew, Ay + h);
      s.endShape(s.CLOSE);

      // faccia destra
      s.fill(rightCol);
      s.beginShape();
      s.vertex(Bx - skew, By);
      s.vertex(Bx, By - skew);
      s.vertex(Bx, By - skew + h);
      s.vertex(Bx - skew, By + h);
      s.endShape(s.CLOSE);

      // contorni lucidi/traslucidi
      s.stroke(200, 235, 255, 200 * intensity + 30);
      s.strokeWeight(1);
      s.noFill();
      s.beginShape();
      s.vertex(Ax, Ay - skew);
      s.vertex(Bx, By - skew);
      s.vertex(Bx - skew, By);
      s.vertex(Bx - skew, By + h);
      s.vertex(Ax - skew, Ay + h);
      s.vertex(Ax - skew, Ay);
      s.endShape(s.CLOSE);
      s.noStroke();

      // piccoli riflessi / crepe
      s.fill(255, 255, 255, 180 * intensity + 30);
      s.triangle(Ax - w * 0.12, Ay - skew + 2, Ax + w * 0.08, Ay - skew + 6, Ax - w * 0.02, Ay - skew - 6);
      s.fill(240, 250, 255, 120 * intensity);
      s.beginShape();
      s.vertex(Bx - skew * 0.2, By + h * 0.1);
      s.vertex(Bx - skew * 0.05, By + h * 0.35);
      s.vertex(Bx - skew * 0.35, By + h * 0.45);
      s.endShape();

      s.pop();
    }

    // fiocchi/splinters attorno ai cubetti
    s.fill(230, 250, 255, 160 * intensity + 20);
    for (let k = 0; k < 6; k++) {
      s.push();
      const sx = -36 + k * 14 + 2 * Math.sin(s.frameCount / 12 + k);
      const sy = 48 + 3 * Math.cos(s.frameCount / 9 + k);
      s.translate(sx, sy);
      s.rotate(s.frameCount / 60 + k);
      s.rect(-1, -5, 2, 10, 1);
      s.rect(-5, -1, 10, 2, 1);
      s.pop();
    }

    s.pop();
  }

  function start() {
    const sketch = (s) => {
      s.setup = () => {
        const c = s.createCanvas(600, 400);
        c.parent("simulator-holder");
      };

      s.draw = () => {
        s.background(245);
        const { V, T, P } = state;
        const { Q } = energy;

        const yBase = 340, hRange = 220;
        const pistY = yBase - s.map(V, 0.2, scales.V, 0, hRange);

        const tempCol = s.lerpColor(
          s.color(80, 180, 255),
          s.color(255, 140, 0),
          s.constrain(T / (scales.T || 1), 0, 1)
        );

        // Indicators
        drawIndicator(s, T, scales.T, 50, 100, "TEMP", "K", tempCol);
        drawIndicator(s, P, scales.P, 100, 100, "PRESS", "kPa", s.color(100, 100, 100));

        // Cilindro
        s.noStroke();
        s.fill(220);
        s.rect(210, 100, 180, 240, 10);

        // Gas
        s.fill(tempCol);
        s.rect(220, pistY + 10, 160, yBase - pistY - 10);

        // Pistone
        s.fill(200);
        s.rect(200, pistY, 200, 20, 6);

        // Volume indicator
        s.fill(0);
        s.textSize(12);
        s.textAlign(s.CENTER);
        s.text("VOLUME: " + V.toFixed(2) + " L", 300, 80);

        // Heat transfer visualization
        if (Q > 1e-9) {
          drawFlames(s, Q, 300, 360);
        } else if (Q < -1e-9) {
          drawIce(s, Q, 300, 360);
        } else {
          s.fill(180);
          s.ellipse(300, 360, 100, 25);
        }
      };
    };
    instance = new p5(sketch);
  }

  function update(s, e, {V, T, P}) {
    state = s;
    energy = e;
    scales = { V, T, P };
  }

  return { start, update };
})();
