/*
 * EasternNova Living Resume — integration layer
 * Place this folder beside resume.html and add the one script tag from README.md.
 * Existing resume content, nav, theme control and layout are not rewritten.
 */
const FEATURE_KEY = "EasternNovaLivingResume3D";
const STYLE_ID = "enova-living-resume-3d-css";
const root = document.documentElement;
let cleanup = () => {};

function addStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement("link");
  link.id = STYLE_ID;
  link.rel = "stylesheet";
  link.href = new URL("./living-resume-3d.css", import.meta.url).href;
  document.head.appendChild(link);
}
function currentTheme() {
  return root.dataset.resumeTheme === "light" ? "light" : "dark";
}
function findSections() {
  const known = [
    "#resume-home", "#resume-about", "#resume-experience",
    "#resume-skills", "#resume-projects", "#resume-contact",
    ".resume-home", ".resume-about", ".resume-experience",
    ".resume-skills", ".resume-projects", ".resume-contact"
  ];
  const found = [];
  for (const selector of known) {
    const el = document.querySelector(selector);
    if (el && !found.includes(el)) found.push(el);
  }
  return found;
}
function initFallbackLayer(hero) {
  if (!hero) return;
  let layer = hero.querySelector(":scope > .living-resume-floral");
  if (!layer) {
    layer = document.createElement("div");
    layer.className = "living-resume-floral";
    layer.setAttribute("aria-hidden", "true");
    hero.prepend(layer);
  }
  const apply = () => {
    const image = currentTheme() === "dark" ? "floral-dark.png" : "floral-light.png";
    layer.style.backgroundImage = `url("${new URL(`./assets/${image}`, import.meta.url).href}")`;
  };
  apply();
  return { layer, apply };
}
async function init() {
  addStyles();
  const hero = document.querySelector("#resume-home.resume-home, .resume-home, #resume-home");
  const sections = findSections();
  const fallback = initFallbackLayer(hero);
  let observer;
  let renderer;
  let scene;
  let camera;
  let raf = 0;
  let disposed = false;
  let themeObserver;
  let scrollHandler = () => {};
  let resizeHandler = () => {};
  let pointerHandler = () => {};
  let themeHandler = () => {};
  let revealObserver;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const smallScreen = matchMedia("(max-width: 800px)").matches;

  // Reveal only; no dimensions, position or layout measurements are changed.
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("enova-depth-visible");
          revealObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.08 });
    sections.forEach(section => {
      section.classList.add("enova-depth-section");
      revealObserver.observe(section);
    });
  }

  const canvas = document.createElement("canvas");
  canvas.className = "enova-underwater-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");
  document.body.prepend(canvas);

  try {
    // CDN import is isolated: if it fails, the original floral layer still works.
    const THREE = await import("https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js");
    if (disposed) return;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071421, 0.035);
    camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 80);
    camera.position.set(0, 0.4, 11);

    renderer = new THREE.WebGLRenderer({
      canvas, alpha: true, antialias: !smallScreen, powerPreference: "low-power"
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, smallScreen ? 1.25 : 1.65));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    scene.add(new THREE.HemisphereLight(0xa5d6ff, 0x080913, 1.65));
    const bloomLight = new THREE.PointLight(0xff7eaf, 24, 24);
    bloomLight.position.set(-3, 2, 2);
    scene.add(bloomLight);
    const deepLight = new THREE.PointLight(0x2d9fbd, 20, 28);
    deepLight.position.set(4, -3, 0);
    scene.add(deepLight);

    // Underwater specks / drifting petal silhouettes.
    const particleCount = smallScreen ? 70 : 140;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const particleData = [];
    const palette = [[1, .48, .69], [.34, .72, .84], [.95, .72, .83]];
    for (let i = 0; i < particleCount; i++) {
      positions[i*3] = (Math.random() - .5) * 18;
      positions[i*3+1] = (Math.random() - .5) * 12;
      positions[i*3+2] = -Math.random() * 14;
      const color = palette[i % palette.length];
      colors[i*3] = color[0]; colors[i*3+1] = color[1]; colors[i*3+2] = color[2];
      particleData.push({ x: positions[i*3], y: positions[i*3+1], z: positions[i*3+2], phase: Math.random()*6.28, speed: .12+Math.random()*.2 });
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particleMat = new THREE.PointsMaterial({ size: smallScreen ? .035 : .045, vertexColors: true, transparent: true, opacity: .68, sizeAttenuation: true, depthWrite: false });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // A procedural lotus silhouette is visible only in the final portion of the scroll.
    // It is a concept element, not a replacement for the existing hero flower artwork.
    const lotus = new THREE.Group();
    lotus.position.set(2.5, -1.1, -1.4);
    lotus.visible = false;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(-.42, .38, -.35, 1.05, 0, 1.35);
    shape.bezierCurveTo(.35, 1.05, .42, .38, 0, 0);
    const petalGeo = new THREE.ShapeGeometry(shape, 16);
    for (let ring = 0; ring < 3; ring++) {
      const count = ring === 0 ? 7 : 9;
      for (let i = 0; i < count; i++) {
        const angle = i / count * Math.PI * 2;
        const material = new THREE.MeshStandardMaterial({
          color: ring === 0 ? 0xffb5d0 : ring === 1 ? 0xe86f9f : 0xf7d0e0,
          side: THREE.DoubleSide, roughness: .36, transparent: true, opacity: .75,
          emissive: 0x54132f, emissiveIntensity: .18
        });
        const petal = new THREE.Mesh(petalGeo, material);
        petal.position.set(Math.cos(angle) * (.13 + ring*.08), -1.15 + ring*.13, Math.sin(angle) * (.13 + ring*.08));
        petal.rotation.set(-.75, 0, -angle);
        petal.scale.setScalar(.58 + ring*.12);
        lotus.add(petal);
      }
    }
    // A tapered stem and root-like branches suggest the submerged underside.
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x397b7b, roughness: .7 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(.025, .06, 3.4, 8), stemMaterial);
    stem.position.set(0, -2.8, 0); stem.rotation.z = -.12; lotus.add(stem);
    for (let i = 0; i < 5; i++) {
      const root = new THREE.Mesh(new THREE.CylinderGeometry(.008, .025, 1.5 + i*.13, 6), stemMaterial);
      root.position.set((i-2)*.16, -4.15, (i%2)*.08);
      root.rotation.z = (i-2)*.19; lotus.add(root);
    }
    scene.add(lotus);

    const state = { depth: 0, px: 0, py: 0, tx: 0, ty: 0 };
    const updateDepth = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      state.depth = Math.max(0, Math.min(1, scrollY / maxScroll));
      camera.position.y = .4 - state.depth * 2.7;
      camera.position.z = 11 - state.depth * 2.1;
      camera.lookAt(state.tx * .22, -state.depth * 1.35, 0);
      lotus.visible = state.depth > .76;
      const light = currentTheme() === "light";
      scene.fog.color.set(light ? 0xc4dfe8 : 0x071421);
      bloomLight.intensity = light ? 13 : 24;
      deepLight.intensity = light ? 11 : 20;
      if (fallback) fallback.layer.style.opacity = String(Math.max(.12, .96 - state.depth * .75));
    };
    const onPointer = event => {
      state.tx = (event.clientX / innerWidth - .5) * 2;
      state.ty = (event.clientY / innerHeight - .5) * 2;
    };
    const onResize = () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, matchMedia("(max-width: 800px)").matches ? 1.25 : 1.65));
      renderer.setSize(innerWidth, innerHeight);
    };
    const animate = () => {
      if (disposed) return;
      raf = requestAnimationFrame(animate);
      if (!reducedMotion) {
        const t = performance.now() * .001;
        const p = particleGeo.attributes.position;
        for (let i = 0; i < particleCount; i++) {
          const d = particleData[i];
          p.array[i*3] = d.x + Math.sin(t*.22+d.phase)*.12;
          p.array[i*3+1] = d.y + Math.sin(t*d.speed+d.phase)*.15;
        }
        p.needsUpdate = true;
        state.px += (state.tx - state.px) * .025;
        state.py += (state.ty - state.py) * .025;
        camera.position.x = state.px * .18;
        lotus.rotation.y = Math.sin(t*.16)*.035;
      }
      renderer.render(scene, camera);
    };
    scrollHandler = updateDepth;
    resizeHandler = onResize;
    pointerHandler = onPointer;
    window.addEventListener("scroll", scrollHandler, { passive: true });
    window.addEventListener("resize", resizeHandler, { passive: true });
    if (!smallScreen && !reducedMotion) window.addEventListener("pointermove", pointerHandler, { passive: true });
    updateDepth();
    animate();

    themeObserver = new MutationObserver(() => {
      if (fallback) fallback.apply();
      updateDepth();
    });
    themeObserver.observe(root, { attributes: true, attributeFilter: ["data-resume-theme"] });

    cleanup = () => {
      disposed = true;
      cancelAnimationFrame(raf);
      revealObserver?.disconnect();
      themeObserver?.disconnect();
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("pointermove", pointerHandler);
      renderer?.dispose();
      scene?.traverse(object => {
        object.geometry?.dispose?.();
        if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
        else object.material?.dispose?.();
      });
      canvas.remove();
      fallback?.layer.remove();
      document.getElementById(STYLE_ID)?.remove();
      delete window[FEATURE_KEY];
    };
    window[FEATURE_KEY] = { destroy: () => cleanup(), refresh: updateDepth };
    console.info("[EasternNova Living Resume] 3D layer ready.");
  } catch (error) {
    canvas.remove();
    console.warn("[EasternNova Living Resume] Three.js could not load; original floral hero remains active.", error);
    cleanup = () => {
      revealObserver?.disconnect();
      fallback?.layer.remove();
      document.getElementById(STYLE_ID)?.remove();
      delete window[FEATURE_KEY];
    };
    window[FEATURE_KEY] = { destroy: () => cleanup() };
  }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
else init();
