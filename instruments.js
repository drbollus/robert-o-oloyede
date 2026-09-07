/* ==========================================================================
   Dr. Robert Oloyede — shared 3D instrument icons
   Reusable Three.js builders for the floating oilfield-instrument motif
   (gauge, valve, seal, tank). One page = one call to mountInstruments().

   Usage:
     <div id="my-canvas" style="height:300px;"></div>
     <script type="importmap">{ "imports": { "three": "https://unpkg.com/three@0.160.0/build/three.module.js" } }</script>
     <script type="module">
       import { mountInstruments } from "./assets/js/instruments.js";
       mountInstruments("my-canvas", {
         objects: [
           { type: "gauge", position: [-1.6, 1.1, 0],  scale: 0.9,  speed: 0.6,  amp: 0.16 },
           { type: "valve", position: [1.7, -0.9, -1], scale: 0.95, speed: 0.45, amp: 0.14 },
         ],
         parallax: true, // camera drifts toward the mouse; set false for a calmer, static page
       });
     </script>
   ========================================================================== */

import * as THREE from "three";

const COLORS = {
  brass: 0xB8863B,
  steel: 0x3A4547,
  dark: 0x1B2426,
  rust: 0xC4571E,
};

function materials() {
  return {
    brass: new THREE.MeshStandardMaterial({ color: COLORS.brass, metalness: 0.85, roughness: 0.32 }),
    steel: new THREE.MeshStandardMaterial({ color: COLORS.steel, metalness: 0.7, roughness: 0.4 }),
    dark: new THREE.MeshStandardMaterial({ color: COLORS.dark, metalness: 0.5, roughness: 0.55 }),
    needle: new THREE.MeshStandardMaterial({ color: COLORS.rust, metalness: 0.6, roughness: 0.3 }),
  };
}

function buildGauge(mat) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.14, 24, 48), mat.brass));
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.86, 48), mat.dark);
  face.position.z = 0.05;
  g.add(face);
  const needle = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.7, 8), mat.needle);
  needle.position.set(0, 0.3, 0.12);
  needle.rotation.z = -0.6;
  g.add(needle);
  return g;
}

function buildValve(mat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.4, 24), mat.steel);
  body.rotation.z = Math.PI / 2;
  g.add(body);
  const flangeGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24);
  const flangeL = new THREE.Mesh(flangeGeo, mat.steel); flangeL.rotation.z = Math.PI / 2; flangeL.position.x = -0.7;
  const flangeR = new THREE.Mesh(flangeGeo, mat.steel); flangeR.rotation.z = Math.PI / 2; flangeR.position.x = 0.7;
  g.add(flangeL, flangeR);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5, 12), mat.brass);
  stem.position.y = 0.4;
  g.add(stem);
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 12, 24), mat.brass);
  wheel.position.y = 0.7;
  g.add(wheel);
  return g;
}

function buildSeal(mat) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.08, 32), mat.brass);
  g.add(disc);
  // engraved ring — a slightly recessed torus to suggest a stamped border
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.02, 8, 40), mat.dark);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.041;
  g.add(ring);
  return g;
}

function buildTank(mat) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.1, 32, 1, true), mat.steel);
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.74, 0.3, 32), mat.brass);
  roof.position.y = 0.7;
  g.add(roof);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.08, 32), mat.dark);
  base.position.y = -0.58;
  g.add(base);
  return g;
}

const BUILDERS = { gauge: buildGauge, valve: buildValve, seal: buildSeal, tank: buildTank };

// Flat SVG line-art fallback, one per instrument type — used for prefers-reduced-motion
const FALLBACK_SVG = {
  gauge: `<circle cx="50" cy="50" r="34"/><line x1="50" y1="50" x2="66" y2="34"/>`,
  valve: `<rect x="20" y="42" width="60" height="16" rx="2"/><circle cx="50" cy="30" r="10"/>`,
  seal: `<circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="20"/>`,
  tank: `<rect x="25" y="35" width="50" height="40"/><polygon points="25,35 50,20 75,35"/>`,
};

/**
 * Mount a small floating-instrument scene into a container element.
 * @param {string} containerId - id of an empty block-level element to render into
 * @param {object} config
 * @param {Array<{type:string, position:number[], scale?:number, speed?:number, amp?:number, rotSpeed?:number}>} config.objects
 * @param {boolean} [config.parallax=false] - if true, camera drifts toward the mouse (use on hero sections only)
 */
export function mountInstruments(containerId, config) {
  const mount = document.getElementById(containerId);
  if (!mount) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    renderFallback(mount, config.objects);
    return;
  }

  const width = mount.clientWidth;
  const height = mount.clientHeight;
  if (width === 0 || height === 0) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  mount.appendChild(renderer.domElement);

  const key = new THREE.DirectionalLight(0xd2a65c, 2.2);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x6fa3a8, 1.1);
  rim.position.set(-4, -2, -3);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0x334040, 0.6));

  const mat = materials();
  const items = (config.objects || []).map((def, i) => {
    const builder = BUILDERS[def.type] || buildGauge;
    const mesh = builder(mat);
    mesh.position.set(...(def.position || [0, 0, 0]));
    mesh.scale.setScalar(def.scale ?? 1);
    scene.add(mesh);
    return {
      mesh,
      base: mesh.position.clone(),
      speed: def.speed ?? 0.5,
      amp: def.amp ?? 0.14,
      rotSpeed: def.rotSpeed ?? 0.1,
      phase: i,
    };
  });

  let mouseX = 0, mouseY = 0;
  function onMouseMove(e) {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  }
  if (config.parallax) window.addEventListener("mousemove", onMouseMove);

  const clock = new THREE.Clock();
  let visible = true;
  const io = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; });
  io.observe(mount);

  let raf;
  function animate() {
    raf = requestAnimationFrame(animate);
    if (!visible) return;
    const t = clock.getElapsedTime();
    items.forEach((o) => {
      o.mesh.position.y = o.base.y + Math.sin(t * o.speed + o.phase) * o.amp;
      o.mesh.rotation.y += o.rotSpeed * 0.01;
    });
    if (config.parallax) {
      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
    }
    renderer.render(scene, camera);
  }
  animate();

  function onResize() {
    const w = mount.clientWidth, h = mount.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener("resize", onResize);
}

function renderFallback(mount, objectDefs) {
  const type = (objectDefs && objectDefs[0] && objectDefs[0].type) || "gauge";
  const svgInner = FALLBACK_SVG[type] || FALLBACK_SVG.gauge;
  mount.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;opacity:0.5;">
    <svg width="140" height="140" viewBox="0 0 100 100" fill="none" stroke="#B8863B" stroke-width="2">${svgInner}</svg>
  </div>`;
}
