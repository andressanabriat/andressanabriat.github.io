/**
 * Hero 3D scene (Three.js 0.180.0 via CDN — the only allowed dependency).
 *
 * Shows an emissive icosahedron core with two orbital rings, three
 * selectable nodes (Code / Product / Entrepreneurship) tied back to the
 * core by connector lines, floating ambient stars and star-like glimmers
 * around each node. Users drag to rotate the system and click (or hover)
 * a node to select it; selection updates the caption below the canvas
 * and tells script.js via the 'portfolio-scene-node-change' event.
 *
 * Fallbacks: a "no-webgl" class on the frame when WebGL is unavailable;
 * prefers-reduced-motion freezes idle rotation and keeps glimmers static.
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const frame = document.querySelector(".scene-frame");
const canvas = document.querySelector(".idea-scene");
const title = document.querySelector(".scene-title");
const description = document.querySelector(".scene-description");

const content = {
  es: [
    ["Código", "La lógica que da forma a una idea."],
    ["Producto", "Una experiencia digital pensada para las personas."],
    ["Emprendimiento", "Convertir una oportunidad en algo que aporte valor."]
  ],
  en: [
    ["Code", "The logic that gives an idea its shape."],
    ["Product", "A digital experience designed around people."],
    ["Entrepreneurship", "Turning an opportunity into something valuable."]
  ]
};

// ── Scene setup: camera, lights, orbits, core and nodes ────────────────────

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
camera.position.set(0, 0, 8);

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
} catch (error) {
  frame.classList.add("no-webgl");
}

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  scene.add(new THREE.AmbientLight(0x8ba7ff, 1.8));
  const keyLight = new THREE.PointLight(0x0016de, 24, 20);
  keyLight.position.set(2.5, 3, 4);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x4d8dff, 15, 18);
  fillLight.position.set(-3, -2, 2);
  scene.add(fillLight);

  const system = new THREE.Group();
  scene.add(system);

  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 0x102a41,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.25, 0.012, 8, 120), orbitMaterial);
  orbit.rotation.x = 0.88;
  orbit.rotation.y = -0.35;
  system.add(orbit);
  const secondOrbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.65, 0.01, 8, 120),
    new THREE.MeshBasicMaterial({ color: 0x0016de, transparent: true, opacity: 0.28 })
  );
  secondOrbit.rotation.x = -0.72;
  secondOrbit.rotation.y = 0.5;
  system.add(secondOrbit);

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.72, 1),
    new THREE.MeshStandardMaterial({
      color: 0x102a41,
      emissive: 0x0016de,
      emissiveIntensity: 0.42,
      metalness: 0.5,
      roughness: 0.27,
      flatShading: true
    })
  );
  system.add(core);
  const coreWire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.85, 1),
    new THREE.MeshBasicMaterial({ color: 0x416aff, wireframe: true, transparent: true, opacity: 0.35 })
  );
  system.add(coreWire);

  // Three nodes in accent colors (teal, white, lavender) orbiting the core;
// each also carries a ring halo and star-like glimmer sprites (built after
// the canvas glow texture) that twinkle via additive blending.
const nodePositions = [
    new THREE.Vector3(-1.85, 0.55, 0.15),
    new THREE.Vector3(1.85, 0.5, -0.15),
    new THREE.Vector3(0, -1.9, 0.2)
  ];
  const nodeColors = [0x5ed9c3, 0xffffff, 0xa78bfa];
  const nodes = nodePositions.map((position, nodeIndex) => {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 32, 24),
      new THREE.MeshStandardMaterial({
        color: nodeColors[nodeIndex],
        emissive: nodeColors[nodeIndex],
        emissiveIntensity: 0.2,
        metalness: 0.35,
        roughness: 0.25
      })
    );
    node.position.copy(position);
    node.userData.nodeIndex = nodeIndex;
    system.add(node);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.34, 0.012, 8, 48),
      new THREE.MeshBasicMaterial({ color: nodeColors[nodeIndex], transparent: true, opacity: 0.7 })
    );
    halo.position.copy(position);
    halo.userData.nodeIndex = nodeIndex;
    system.add(halo);
    return node;
  });

  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 32;
  glowCanvas.height = 32;
  const glowContext = glowCanvas.getContext("2d");
  const glowGradient = glowContext.createRadialGradient(16, 16, 0, 16, 16, 16);
  glowGradient.addColorStop(0, "rgba(255,255,255,1)");
  glowGradient.addColorStop(0.18, "rgba(255,255,255,0.8)");
  glowGradient.addColorStop(1, "rgba(255,255,255,0)");
  glowContext.fillStyle = glowGradient;
  glowContext.fillRect(0, 0, 32, 32);
  const glowTexture = new THREE.CanvasTexture(glowCanvas);
  const nodeGlimmers = nodes.map((node, nodeIndex) => Array.from({ length: 8 }, () => {
    const glimmer = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture,
      color: nodeColors[nodeIndex],
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
    const direction = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    glimmer.position.copy(direction.multiplyScalar(0.27 + Math.random() * 0.12));
    const size = 0.018 + Math.random() * 0.018;
    glimmer.scale.set(size, size, 1);
    glimmer.userData = {
      phase: Math.random() * Math.PI * 2,
      speed: 1.5 + Math.random() * 3,
      size,
      basePosition: glimmer.position.clone()
    };
    node.add(glimmer);
    return glimmer;
  }));

  const connectorMaterial = new THREE.LineBasicMaterial({ color: 0x3158c7, transparent: true, opacity: 0.42 });
  nodePositions.forEach((position) => {
    const connector = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), position]),
      connectorMaterial
    );
    system.add(connector);
  });

  const starPositions = [];
  for (let star = 0; star < 90; star += 1) {
    starPositions.push((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 2 - 1);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starPositions, 3));
  scene.add(new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({ color: 0x687c93, size: 0.018, transparent: true, opacity: 0.65 })
  ));

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const clock = new THREE.Clock();
  let selectedNode = 0;
  let hoveredNode = -1;
  let activePointer = null;
  let dragOrigin = null;
  let didDrag = false;
  // Canvas width at the start of a drag; touch sensitivity is normalized
  // against it so the feel matches desktop regardless of screen size.
  let dragCanvasWidth = 0;
  let targetRotationX = -0.12;
  let targetRotationY = 0.2;
  // Drag sensitivity (rotation gain per CSS pixel), commented per Andrés:
  // - mouse keeps the historical 0.012 so desktop feels exactly as before;
  // - touch is scaled up because narrow mobile canvases cover fewer CSS
  //   pixels per swipe than the ~480px desktop hero canvas (measured at
  //   1440x900), which made dragging feel slow. A full-width swipe now
  //   rotates like a desktop full drag; capped so very narrow screens
  //   never snap.
  const DRAG_SENSITIVITY = 0.012;
  const TOUCH_REFERENCE_WIDTH = 480;
  const TOUCH_SENSITIVITY_CAP = 1.7;

  function selectNode(nodeIndex) {
    // Updates the caption under the canvas and notifies script.js (which
    // refreshes the same labels again on language changes).
    selectedNode = nodeIndex;
    const language = document.documentElement.lang === "en" ? "en" : "es";
    const [nodeTitle, nodeDescription] = content[language][nodeIndex];
    title.textContent = nodeTitle;
    description.textContent = nodeDescription;
    document.dispatchEvent(new CustomEvent("portfolio-scene-node-change", { detail: { nodeIndex } }));
  }

  /**
   * Fits the camera and renderer to the canvas box; pulls the camera
   * back slightly on narrow screens so the system stays inside view.
   */
  function resizeScene() {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    camera.aspect = bounds.width / bounds.height;
    camera.position.z = bounds.width < 420 ? 9 : 8;
    camera.updateProjectionMatrix();
    renderer.setSize(bounds.width, bounds.height, false);
  }

  // ── Pointer handling: drag to rotate, click to select, hover to hint ─────
  // setRayFromEvent converts a pointer position into a normalized ray used
  // for both hover highlighting and click picking.

  function setRayFromEvent(event) {
    const bounds = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
  }

  function onPointerDown(event) {
    activePointer = event.pointerId;
    dragOrigin = { x: event.clientX, y: event.clientY };
    didDrag = false;
    dragCanvasWidth = canvas.getBoundingClientRect().width || TOUCH_REFERENCE_WIDTH;
    canvas.setPointerCapture(event.pointerId);
  }

  /**
   * Rotates only when a drag is confirmed (movement > 5px), so plain
   * clicks keep selecting nodes instead of wobbling the scene. Mouse
   * keeps the historical sensitivity; touch/pen get the width-normalized
   * gain described by the constants above.
   */
  function onPointerMove(event) {
    if (activePointer === event.pointerId && dragOrigin) {
      const deltaX = event.clientX - dragOrigin.x;
      const deltaY = event.clientY - dragOrigin.y;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 5) didDrag = true;
      if (didDrag) {
        const isTouch = event.pointerType === "touch" || event.pointerType === "pen";
        const touchScale = isTouch
          ? Math.min(TOUCH_SENSITIVITY_CAP, Math.max(1, TOUCH_REFERENCE_WIDTH / dragCanvasWidth))
          : 1;
        targetRotationY += deltaX * DRAG_SENSITIVITY * touchScale;
        targetRotationX += deltaY * DRAG_SENSITIVITY * touchScale;
        dragOrigin = { x: event.clientX, y: event.clientY };
      }
      return;
    }

    setRayFromEvent(event);
    const hit = raycaster.intersectObjects(nodes, false)[0];
    hoveredNode = hit ? hit.object.userData.nodeIndex : -1;
    canvas.style.cursor = hoveredNode >= 0 ? "pointer" : "grab";
  }

  function onPointerUp(event) {
    if (activePointer !== event.pointerId) return;
    if (!didDrag) {
      setRayFromEvent(event);
      const hit = raycaster.intersectObjects(nodes, false)[0];
      if (hit) selectNode(hit.object.userData.nodeIndex);
    }
    activePointer = null;
    dragOrigin = null;
  }

  /**
   * Per-frame update: eased system rotation toward its target, eased node
   * scaling for selected/hovered nodes, and glimmer twinkle driven by a
   * sharp sine power curve (frozen at a subtle constant when reduced
   * motion is active).
   */
  function animate() {
    const elapsed = clock.getElapsedTime();
    if (!reducedMotion.matches) {
      targetRotationY += 0.0015;
      core.rotation.y = elapsed * 0.16;
      core.rotation.x = elapsed * 0.1;
      coreWire.rotation.copy(core.rotation);
    }
    system.rotation.y += (targetRotationY - system.rotation.y) * 0.045;
    system.rotation.x += (targetRotationX - system.rotation.x) * 0.045;
    nodes.forEach((node, nodeIndex) => {
      const isHighlighted = nodeIndex === selectedNode || nodeIndex === hoveredNode;
      const targetScale = isHighlighted ? 1.35 : 1;
      node.scale.setScalar(node.scale.x + (targetScale - node.scale.x) * 0.12);
    });
    nodeGlimmers.forEach((glimmers) => {
      glimmers.forEach((glimmer) => {
        const { phase, speed, size, basePosition } = glimmer.userData;
        const shimmer = reducedMotion.matches
          ? 0.2
          : Math.pow(Math.max(0, Math.sin(elapsed * speed + phase)), 7);
        glimmer.material.opacity = reducedMotion.matches ? 0.22 : shimmer * 0.9;
        const scale = size * (reducedMotion.matches ? 1 : 0.4 + shimmer * 1.6);
        glimmer.scale.set(scale, scale, 1);
        if (!reducedMotion.matches) {
          glimmer.position.set(
            basePosition.x + Math.sin(elapsed * 0.8 + phase) * 0.012,
            basePosition.y + Math.cos(elapsed * 0.7 + phase) * 0.012,
            basePosition.z + Math.sin(elapsed * 0.6 + phase) * 0.012
          );
        }
      });
    });
    renderer.render(scene, camera);
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);
  canvas.addEventListener("pointerleave", () => {
    if (activePointer === null) hoveredNode = -1;
  });
  window.addEventListener("resize", resizeScene);
  document.addEventListener("portfolio-language-change", () => selectNode(selectedNode));
  resizeScene();
  selectNode(0);
  renderer.setAnimationLoop(animate);
}
