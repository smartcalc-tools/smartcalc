console.log("BACKGROUND SYSTEM LOADED");

(function () {

document.addEventListener("DOMContentLoaded", () => {

  /* ================= CREATE CANVAS ================= */
  const canvas = document.createElement("canvas");
  canvas.id = "bgCanvas";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");

  let w, h;
  const dpr = window.devicePixelRatio || 1;

  function resize() {
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  /* ================= NOISE ================= */
  function noise(x, y, t) {
    return Math.sin(x * 1.3 + t) * Math.cos(y * 1.3 + t);
  }

  /* ================= FLOATING LIGHTS ================= */
  const lights = Array.from({ length: 6 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: 180 + Math.random() * 250,
    speed: 0.05 + Math.random() * 0.15
  }));

  /* ================= HERO ELEMENTS (optional safe check) ================= */
  const title = document.querySelector(".hero-title");

  /* ================= DRAW ================= */
  function draw(time) {
    time *= 0.0003;

    ctx.clearRect(0, 0, w, h);

    /* ===== BACKGROUND GRADIENT ===== */
    let bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, "#070a18");
    bg.addColorStop(1, "#140a2e");

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    /* ===== FLOATING ORBS ===== */
    lights.forEach(l => {
      l.y -= l.speed;

      if (l.y < -200) {
        l.y = window.innerHeight + 200;
        l.x = Math.random() * window.innerWidth;
      }

      let g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      g.addColorStop(0, "rgba(120,100,255,0.12)");
      g.addColorStop(1, "transparent");

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fill();
    });

    /* ===== WAVE LAYER (background depth) ===== */
    for (let j = 0; j < 10; j++) {
      ctx.beginPath();

      for (let i = 0; i < 60; i++) {
        let x = (i / 60) * window.innerWidth;

        let y =
          window.innerHeight / 2 +
          noise(i * 0.05, j * 0.08, time) * (40 + j * 5);

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(120,140,255,${0.03 + j * 0.004})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    /* ===== HERO TEXT MESH (only if exists) ===== */
    if (title) {
      const rect = title.getBoundingClientRect();

      const centerY =
        rect.top +
        rect.height / 2 +
        50; // 👈 DOWN SHIFT

      const offsetX = rect.left;
      const textWidth = rect.width;

      const lines = window.innerWidth < 768 ? 18 : 28;

      for (let j = 0; j < lines; j++) {
        ctx.beginPath();

        for (let i = 0; i < 60; i++) {
          let x = (i / 60) * textWidth;

          let y =
            centerY +
            noise(i * 0.05, j * 0.05, time) * 60;

          if (i === 0) ctx.moveTo(offsetX + x, y);
          else ctx.lineTo(offsetX + x, y);
        }

        ctx.strokeStyle = "rgba(120,140,255,0.07)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);

});

})();