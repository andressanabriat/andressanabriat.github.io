/**
 * "About me" decorative art: generative network on Canvas 2D.
 *
 * Renders 16 drifting nodes connected by structured edges (blue primary
 * links, teal/lavender accents) with glowing pulses traveling along a
 * few chosen edges. Nodes drift with a slow sine motion and are gently
 * attracted toward the pointer. Purely decorative: screen readers never
 * read it, and it carries no data.
 *
 * Accessibility and efficiency: prefers-reduced-motion freezes drift and
 * pulse motion (subtle manual redraws on pointer events); the loop skips
 * once, and only restarts when the section is visible again.
 */
const networkCanvas = document.querySelector(".about-network");
const networkFrame = document.querySelector(".about-art");

if (networkCanvas && networkFrame) {
  const context = networkCanvas.getContext("2d");
  // Layout data: normalized node positions/sizes, the structured edge
  // list, and a few edges that carry traveling pulses. Accent colors
  // mark nodes aligned with the site's public features/interests.
  const nodes = [
    { x: 0.12, y: 0.2, size: 1.1, phase: 0.2 },
    { x: 0.29, y: 0.12, size: 0.65, phase: 1.1 },
    { x: 0.48, y: 0.22, size: 1.55, phase: 2.2 },
    { x: 0.73, y: 0.13, size: 0.7, phase: 0.8 },
    { x: 0.88, y: 0.29, size: 1.15, phase: 2.8 },
    { x: 0.67, y: 0.38, size: 0.65, phase: 1.8 },
    { x: 0.44, y: 0.43, size: 0.9, phase: 0.4 },
    { x: 0.23, y: 0.41, size: 1.2, phase: 2.4 },
    { x: 0.1, y: 0.63, size: 0.7, phase: 1.6 },
    { x: 0.31, y: 0.69, size: 0.9, phase: 0.1 },
    { x: 0.55, y: 0.64, size: 1.45, phase: 2.9 },
    { x: 0.78, y: 0.65, size: 0.8, phase: 1.3 },
    { x: 0.91, y: 0.83, size: 1.1, phase: 0.6 },
    { x: 0.66, y: 0.87, size: 0.9, phase: 2.1 },
    { x: 0.43, y: 0.88, size: 0.62, phase: 1.5 },
    { x: 0.2, y: 0.85, size: 1.2, phase: 2.6 }
  ];

  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 7], [7, 6], [6, 5], [5, 4],
    [7, 8], [8, 9], [9, 6], [6, 10], [10, 5], [10, 11], [11, 12],
    [10, 13], [13, 14], [14, 15], [15, 8], [1, 7], [2, 6], [2, 5],
    [9, 10], [11, 13], [12, 13]
  ];

  const pulses = [
    { edge: 2, period: 7.5, offset: 0.4 },
    { edge: 8, period: 9, offset: 3.1 },
    { edge: 13, period: 8.8, offset: 6.2 },
    { edge: 16, period: 8.2, offset: 5.4 },
    { edge: 21, period: 10.5, offset: 1.9 },
    { edge: 23, period: 9.6, offset: 7.3 }
  ];
  const nodeColors = nodes.map((node, nodeIndex) => {
    if (nodeIndex === 2 || nodeIndex === 10) return "94, 217, 195";
    if (nodeIndex === 5 || nodeIndex === 13) return "167, 139, 250";
    return "165, 184, 214";
  });

  const pointer = { x: -1, y: -1, active: false };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const points = nodes.map(() => ({ x: 0, y: 0 }));
  let width = 0;
  let height = 0;
  let frameRequest = 0;
  let isVisible = true;

  /**
   * Right-sizes the canvas backing store to the frame box (HiDPI aware,
   * capped at 2x) and repaints one frame immediately.
   */
  function resizeCanvas() {
    const bounds = networkFrame.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    networkCanvas.width = Math.round(width * pixelRatio);
    networkCanvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    draw(performance.now() / 1000);
  }

  /**
   * Computes each node's current position: normalized base, sine drift,
   * and an inverse-square attractor toward the pointer when present.
   */
  function updatePoints(time) {
    const influenceRadius = Math.min(width, height) * 0.31;

    nodes.forEach((node, nodeIndex) => {
      const baseX = node.x * width;
      const baseY = node.y * height;
      const driftX = reducedMotion.matches ? 0 : Math.sin(time * 0.24 + node.phase) * 4.2;
      const driftY = reducedMotion.matches ? 0 : Math.cos(time * 0.2 + node.phase * 1.3) * 3.4;
      let cursorX = 0;
      let cursorY = 0;

      if (pointer.active && !reducedMotion.matches) {
        const deltaX = pointer.x - baseX;
        const deltaY = pointer.y - baseY;
        const distance = Math.hypot(deltaX, deltaY);
        const influence = Math.max(0, 1 - distance / influenceRadius);
        const attraction = influence * influence * 14;
        cursorX = deltaX * (attraction / Math.max(distance, 1));
        cursorY = deltaY * (attraction / Math.max(distance, 1));
      }

      points[nodeIndex].x = baseX + driftX + cursorX;
      points[nodeIndex].y = baseY + driftY + cursorY;
    });
  }

  /**
   * Paints one frame: edges (with primary/accent styles first), then
   * pulses (glowing dots along ~26% of their period), then nodes from
   * the smallest up — halos and rings for the larger ones.
   */
  function draw(time) {
    if (!width || !height) return;
    updatePoints(time);
    context.clearRect(0, 0, width, height);

    connections.forEach(([fromIndex, toIndex], edgeIndex) => {
      const from = points[fromIndex];
      const to = points[toIndex];
      const isPrimary = [1, 5, 11, 18, 21].includes(edgeIndex);
      const isAccent = [2, 13, 23].includes(edgeIndex);

      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.strokeStyle = isPrimary
        ? "rgba(0, 22, 222, 0.52)"
        : isAccent
          ? "rgba(94, 217, 195, 0.34)"
          : "rgba(104, 124, 147, 0.31)";
      context.lineWidth = isPrimary ? 1.35 : isAccent ? 1.05 : 0.85;
      context.stroke();
    });

    pulses.forEach(({ edge, period, offset }) => {
      const progress = ((time + offset) % period) / period;
      if (progress > 0.26) return;

      const [fromIndex, toIndex] = connections[edge];
      const from = points[fromIndex];
      const to = points[toIndex];
      const position = progress / 0.26;
      const x = from.x + (to.x - from.x) * position;
      const y = from.y + (to.y - from.y) * position;

      context.beginPath();
      context.arc(x, y, 2.2, 0, Math.PI * 2);
      context.shadowColor = "rgba(94, 217, 195, 0.85)";
      context.shadowBlur = 8;
      context.fillStyle = "rgba(170, 255, 238, 0.96)";
      context.fill();
      context.shadowBlur = 0;
    });

    nodes.forEach((node, nodeIndex) => {
      const point = points[nodeIndex];
      const radius = 1.2 + node.size * 1.05;
      const color = nodeColors[nodeIndex];
      const isAccent = nodeIndex === 2 || nodeIndex === 10 || nodeIndex === 5 || nodeIndex === 13;

      if (node.size > 1.05) {
        context.beginPath();
        context.arc(point.x, point.y, radius * 4.2, 0, Math.PI * 2);
        context.fillStyle = `rgba(${color}, ${isAccent ? 0.07 : 0.035})`;
        context.fill();
      }

      if (node.size > 1.35) {
        context.beginPath();
        context.arc(point.x, point.y, radius + 5, 0, Math.PI * 2);
        context.strokeStyle = `rgba(${color}, ${isAccent ? 0.48 : 0.3})`;
        context.lineWidth = 1;
        context.stroke();
      }

      context.beginPath();
      context.arc(point.x, point.y, radius, 0, Math.PI * 2);
      context.shadowColor = `rgba(${color}, ${isAccent ? 0.7 : 0.35})`;
      context.shadowBlur = isAccent ? 10 : 4;
      context.fillStyle = `rgba(${color}, ${isAccent ? 0.96 : 0.86})`;
      context.fill();
      context.shadowBlur = 0;
    });
  }

  /**
   * Single animation pass; keeps chaining frames unless reduced motion
   * is active (then requestDraw() drives manual redraws).
   */
  function animate(timestamp) {
    if (!isVisible) return;
    draw(timestamp / 1000);
    if (!reducedMotion.matches) frameRequest = window.requestAnimationFrame(animate);
  }

  /**
   * (Re)starts the loop, dropping any pending request first.
   */
  function requestDraw() {
    if (frameRequest) window.cancelAnimationFrame(frameRequest);
    frameRequest = window.requestAnimationFrame(animate);
  }

  networkFrame.addEventListener("pointermove", (event) => {
    const bounds = networkFrame.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    pointer.active = true;
    if (reducedMotion.matches) requestDraw();
  });
  networkFrame.addEventListener("pointerleave", () => {
    pointer.active = false;
    if (reducedMotion.matches) requestDraw();
  });

  // Listeners: pointer redraws only matter to parity with reduced motion;
  // IntersectionObserver pauses the loop while the art is off-screen.

  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeCanvas).observe(networkFrame);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !reducedMotion.matches) requestDraw();
      else if (frameRequest) window.cancelAnimationFrame(frameRequest);
    }).observe(networkFrame);
  }

  reducedMotion.addEventListener?.("change", () => {
    if (frameRequest) window.cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    if (isVisible && !reducedMotion.matches) requestDraw();
    else draw(performance.now() / 1000);
  });

  resizeCanvas();
  if (!reducedMotion.matches) requestDraw();
}
