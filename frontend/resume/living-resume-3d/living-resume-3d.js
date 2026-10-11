
/*
 * EasternNova — Living Resume 3D
 * Procedural flower + underwater atmosphere + Contact lotus.
 * No PNG assets required.
 */

const FEATURE_KEY = "__easternNovaLivingResume3D";
const CSS_ID = "enova-living-resume-3d-stylesheet";
const THREE_URL =
  "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

if (!window[FEATURE_KEY]) {
  window[FEATURE_KEY] = { loading: true };
  initLivingResume3D();
}

async function initLivingResume3D() {
  const root = document.documentElement;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileQuery = matchMedia("(max-width: 800px)");

  let disposed = false;
  let frameId = 0;
  let renderer;
  let scene;
  let camera;
  let themeObserver;
  let resizeObserver;
  let lastFrame = 0;
  let depth = 0;
  let targetDepth = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothX = 0;
  let smoothY = 0;
  let mobile = mobileQuery.matches;
  let visible = !document.hidden;

  const disposers = [];
  const addListener = (target, event, callback, options) => {
    target.addEventListener(event, callback, options);
    disposers.push(() => target.removeEventListener(event, callback, options));
  };

  const theme = () =>
    root.dataset.resumeTheme === "light" ||
    document.body?.dataset.resumeTheme === "light"
      ? "light"
      : "dark";

  // Load this feature's stylesheet without changing the resume's layout.
  if (!document.getElementById(CSS_ID)) {
    const link = document.createElement("link");
    link.id = CSS_ID;
    link.rel = "stylesheet";
    link.href = new URL("./living-resume-3d.css", import.meta.url).href;
    document.head.appendChild(link);
  }

  const canvas = document.createElement("canvas");
  canvas.className = "enova-underwater-canvas";
  canvas.setAttribute("aria-hidden", "true");
  canvas.setAttribute("role", "presentation");
  document.body.prepend(canvas);

  try {
    const THREE = await import(THREE_URL);

    if (disposed) {
      canvas.remove();
      return;
    }

    // Load the image textures from ./assets. The scene still has procedural
    // geometry if a texture fails to load.
    const textureLoader = new THREE.TextureLoader();
    const loadTexture = async (filename) => {
      try {
        const texture = await textureLoader.loadAsync(
          new URL(`./assets/${filename}`, import.meta.url).href
        );
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
      } catch (error) {
        console.warn(`[EasternNova] Texture unavailable: ${filename}`, error);
        return null;
      }
    };

    const [bloomDarkTexture, bloomLightTexture, lotusDarkTexture, lotusLightTexture,
      petalTexture, lilyPadTexture, waterDarkTexture, waterLightTexture,
      raysDarkTexture, raysLightTexture] = await Promise.all([
      loadTexture("bloom-dark.png"),
      loadTexture("bloom-light.png"),
      loadTexture("lotus-dark.png"),
      loadTexture("lotus-light.png"),
      loadTexture("petal-03.png"),
      loadTexture("lily-pad-large.png"),
      loadTexture("water-surface-dark.png"),
      loadTexture("water-surface-light.png"),
      loadTexture("light-rays-dark.png"),
      loadTexture("light-rays-light.png")
    ]);

    if (disposed) {
      [bloomDarkTexture, bloomLightTexture, lotusDarkTexture, lotusLightTexture,
       petalTexture, lilyPadTexture, waterDarkTexture, waterLightTexture,
       raysDarkTexture, raysLightTexture].forEach(texture => texture?.dispose());
      canvas.remove();
      return;
    }

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071421, 0.012);

    camera = new THREE.PerspectiveCamera(
      45,
      innerWidth / Math.max(1, innerHeight),
      0.1,
      100
    );
    camera.position.set(0, 0, 10);

    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !mobile,
      powerPreference: "low-power"
    });

    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const palettes = {
      dark: {
        surface: new THREE.Color(0x100b16),
        deep: new THREE.Color(0x031923),
        flower: 0xff91bd,
        innerPetal: 0xffc5dc,
        center: 0xf4c56e,
        ambient: 0xa5d6ff,
        ground: 0x080913,
        water: 0x2d9fbd,
        opacity: 0.48
      },
      light: {
        surface: new THREE.Color(0xf8eaf0),
        deep: new THREE.Color(0xb9dce5),
        flower: 0xf184ae,
        innerPetal: 0xffd7e6,
        center: 0xe9b854,
        ambient: 0xfff2f6,
        ground: 0x486a70,
        water: 0x4c9eae,
        opacity: 0.28
      }
    };

    const ambient = new THREE.HemisphereLight(0xa5d6ff, 0x080913, 1.7);
    scene.add(ambient);

    const flowerLight = new THREE.PointLight(0xff8db8, 18, 22);
    flowerLight.position.set(-2, 2, 4);
    scene.add(flowerLight);

    const underwaterLight = new THREE.PointLight(0x2d9fbd, 12, 25);
    underwaterLight.position.set(3, -3, -2);
    scene.add(underwaterLight);

    // Shared geometry is reused across petals to reduce GPU memory.
    function makePetalGeometry(length = 1, width = 0.42) {
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.bezierCurveTo(-width * 0.7, length * 0.22, -width, length * 0.72, 0, length);
      shape.bezierCurveTo(width, length * 0.72, width * 0.7, length * 0.22, 0, 0);
      return new THREE.ShapeGeometry(shape, 16);
    }

    const petalGeometry = makePetalGeometry();
    const flowerPetals = [];
    const flower = new THREE.Group();
    flower.position.set(0, 0.25, 0);
    scene.add(flower);

    // High-detail bloom texture sits behind the 3D petals for a cinematic hero.
    const heroBloomMaterials = {};
    function makeImagePlane(texture, width, height, z, opacity = 0.96) {
      if (!texture) return null;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity,
        alphaTest: 0.035,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false
      });
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        material
      );
      mesh.position.z = z;
      mesh.renderOrder = 1;
      return mesh;
    }

    const heroDarkPlane = makeImagePlane(bloomDarkTexture, 4.5, 3.05, -0.48);
    const heroLightPlane = makeImagePlane(bloomLightTexture, 4.5, 3.05, -0.48);
    if (heroDarkPlane) {
      flower.add(heroDarkPlane);
      heroBloomMaterials.dark = heroDarkPlane;
    }
    if (heroLightPlane) {
      flower.add(heroLightPlane);
      heroBloomMaterials.light = heroLightPlane;
    }

    function petalMaterial(color, emissive = 0x46172d) {
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.02,
        side: THREE.DoubleSide,
        emissive,
        emissiveIntensity: 0.16
      });
    }

    const outerPetalMaterial = petalMaterial(0xff91bd);
    const middlePetalMaterial = petalMaterial(0xf47eaa);
    const innerPetalMaterial = petalMaterial(0xffc5dc);

    // Textured curved petals: use the generated petal image as a color map.
    if (petalTexture) {
      [outerPetalMaterial, middlePetalMaterial, innerPetalMaterial].forEach(material => {
        material.map = petalTexture;
        material.transparent = true;
        material.alphaTest = 0.06;
        material.depthWrite = false;
        material.needsUpdate = true;
      });
    }

    // Three-dimensional flower made from overlapping petal rings.
    [
      { count: 15, radius: 0.22, scale: 1.08, z: -0.12, material: outerPetalMaterial },
      { count: 12, radius: 0.15, scale: 0.83, z: 0.0, material: middlePetalMaterial },
      { count: 9, radius: 0.08, scale: 0.57, z: 0.12, material: innerPetalMaterial }
    ].forEach((ring, ringIndex) => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeometry, ring.material);

        petal.position.set(
          Math.cos(angle) * ring.radius,
          Math.sin(angle) * ring.radius,
          ring.z
        );

        petal.rotation.z = -angle + Math.PI / 2;
        petal.rotation.x = -0.28 - ringIndex * 0.11;
        petal.scale.set(ring.scale, ring.scale, 1);

        petal.userData.baseRotationZ = petal.rotation.z;
        petal.userData.phase = angle + ringIndex;
        flower.add(petal);
        flowerPetals.push(petal);
      }
    });

    const flowerCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.19, 20, 14),
      new THREE.MeshStandardMaterial({
        color: 0xf4c56e,
        roughness: 0.4,
        emissive: 0xa35a21,
        emissiveIntensity: 0.4
      })
    );
    flowerCenter.position.z = 0.22;
    flowerCenter.scale.set(1, 0.85, 0.55);
    flower.add(flowerCenter);

    const pollenMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe6a9,
      emissive: 0x8b521e,
      emissiveIntensity: 0.35
    });

    const pollenGeometry = new THREE.SphereGeometry(0.018, 6, 5);
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 0.13 + Math.random() * 0.055;
      const pollen = new THREE.Mesh(pollenGeometry, pollenMaterial);
      pollen.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0.29
      );
      flower.add(pollen);
    }

    // Contact lotus: a separate procedural 3D plant.
    const lotus = new THREE.Group();
    lotus.position.set(2.1, -1.2, -2.2);
    lotus.visible = false;
    scene.add(lotus);

    const lotusDarkPlane = makeImagePlane(lotusDarkTexture, 3.7, 2.7, -0.72, 0.94);
    const lotusLightPlane = makeImagePlane(lotusLightTexture, 3.7, 2.7, -0.72, 0.94);
    if (lotusDarkPlane) lotus.add(lotusDarkPlane);
    if (lotusLightPlane) lotus.add(lotusLightPlane);
    if (lotusDarkPlane) lotusDarkPlane.visible = theme() === "dark";
    if (lotusLightPlane) lotusLightPlane.visible = theme() === "light";
    if (heroDarkPlane) heroDarkPlane.visible = theme() === "dark";
    if (heroLightPlane) heroLightPlane.visible = theme() === "light";

    const lotusPetals = [];
    const lotusPetalGeometry = makePetalGeometry(1.25, 0.39);

    const lotusPetalMaterials = [
      petalMaterial(0xe66f9e, 0x52152e),
      petalMaterial(0xf3a4c2, 0x5e203b),
      petalMaterial(0xffc9dc, 0x6a2942)
    ];

    const bloom = new THREE.Group();
    bloom.position.y = 0.55;
    lotus.add(bloom);

    for (let ring = 0; ring < 3; ring++) {
      const count = ring === 0 ? 8 : ring === 1 ? 10 : 12;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const petal = new THREE.Mesh(
          lotusPetalGeometry,
          lotusPetalMaterials[ring]
        );

        petal.position.set(
          Math.cos(angle) * (0.08 + ring * 0.09),
          -0.16 + ring * 0.12,
          Math.sin(angle) * (0.08 + ring * 0.09)
        );

        petal.rotation.set(-0.6 - ring * 0.08, 0, -angle + Math.PI / 2);
        petal.scale.setScalar(0.65 + ring * 0.1);
        petal.userData.baseRotationZ = petal.rotation.z;
        petal.userData.phase = angle + ring;
        bloom.add(petal);
        lotusPetals.push(petal);
      }
    }

    const lotusCenter = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 16, 12),
      new THREE.MeshStandardMaterial({
        color: 0xf0c05d,
        emissive: 0x8b4b1a,
        emissiveIntensity: 0.45,
        roughness: 0.45
      })
    );
    lotusCenter.position.z = 0.16;
    bloom.add(lotusCenter);

    const greenMaterial = new THREE.MeshStandardMaterial({
      color: 0x387c70,
      roughness: 0.7,
      side: THREE.DoubleSide
    });

    function addTube(points, radius, material, segments = 18) {
      const curve = new THREE.CatmullRomCurve3(
        points.map(point => new THREE.Vector3(...point))
      );
      const geometry = new THREE.TubeGeometry(curve, segments, radius, 6, false);
      const mesh = new THREE.Mesh(geometry, material);
      lotus.add(mesh);
      return mesh;
    }

    addTube(
      [[0, 0.4, 0], [0.08, -0.5, 0.02], [-0.05, -1.6, 0.08], [0.18, -2.8, 0.12]],
      0.045,
      greenMaterial,
      28
    );

    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.9, 0.8, 1.7, 0.1);
    leafShape.quadraticCurveTo(1.05, -0.45, 0, 0);
    leafShape.quadraticCurveTo(-0.65, 0.2, 0, 0);

    const leafGeometry = new THREE.ShapeGeometry(leafShape, 18);
    if (lilyPadTexture) {
      greenMaterial.map = lilyPadTexture;
      greenMaterial.transparent = true;
      greenMaterial.alphaTest = 0.06;
      greenMaterial.needsUpdate = true;
    }
    const lotusPads = [];

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const pad = new THREE.Mesh(leafGeometry, greenMaterial);

      pad.position.set(
        Math.cos(angle) * (0.9 + (i % 2) * 0.3),
        -1.45 - (i % 2) * 0.2,
        Math.sin(angle) * 0.7
      );

      pad.rotation.set(-0.12, angle, (i % 2 ? 0.08 : -0.08));
      pad.scale.setScalar(0.48 + (i % 2) * 0.12);
      pad.userData.baseY = pad.position.y;
      pad.userData.baseRotationZ = pad.rotation.z;
      pad.userData.phase = angle;
      lotus.add(pad);
      lotusPads.push(pad);

      addTube(
        [
          [0, -1.1, 0],
          [Math.cos(angle) * 0.5, -1.3, Math.sin(angle) * 0.35],
          [pad.position.x, pad.position.y, pad.position.z]
        ],
        0.022,
        greenMaterial,
        12
      );
    }

    const rootMaterial = new THREE.MeshStandardMaterial({
      color: 0x796c65,
      roughness: 0.85
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const length = 0.65 + Math.random() * 0.85;

      addTube(
        [
          [0.18, -2.5, 0.12],
          [Math.cos(angle) * 0.22, -2.9, Math.sin(angle) * 0.22],
          [
            Math.cos(angle) * length,
            -3.2 - Math.random() * 0.45,
            Math.sin(angle) * length
          ]
        ],
        0.012,
        rootMaterial,
        10
      );
    }

    // Atmospheric texture planes. These stay subtle and never cover resume UI.
    const waterDarkPlane = makeImagePlane(waterDarkTexture, 14, 3.7, -4.8, 0.25);
    const waterLightPlane = makeImagePlane(waterLightTexture, 14, 3.7, -4.8, 0.25);
    const raysDarkPlane = makeImagePlane(raysDarkTexture, 10, 12, -5.5, 0.17);
    const raysLightPlane = makeImagePlane(raysLightTexture, 10, 12, -5.5, 0.13);
    [waterDarkPlane, waterLightPlane, raysDarkPlane, raysLightPlane].forEach(plane => {
      if (plane) scene.add(plane);
    });

    // Underwater particles.
    const particleCount = mobile ? 36 : 120;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleData = [];

    for (let i = 0; i < particleCount; i++) {
      const j = i * 3;
      particlePositions[j] = (Math.random() - 0.5) * 18;
      particlePositions[j + 1] = (Math.random() - 0.5) * 12;
      particlePositions[j + 2] = -Math.random() * 15;

      const color = i % 2
        ? [1, 0.52, 0.72]
        : [0.35, 0.75, 0.86];

      particleColors[j] = color[0];
      particleColors[j + 1] = color[1];
      particleColors[j + 2] = color[2];

      particleData.push({
        x: particlePositions[j],
        y: particlePositions[j + 1],
        z: particlePositions[j + 2],
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.25
      });
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(particleColors, 3)
    );

    const particleMaterial = new THREE.PointsMaterial({
      size: mobile ? 0.035 : 0.05,
      vertexColors: true,
      transparent: true,
      opacity: mobile ? 0.42 : 0.65,
      depthWrite: false
    });

    scene.add(new THREE.Points(particleGeometry, particleMaterial));

    function calculateScrollDepth() {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight
      );
      targetDepth = Math.max(0, Math.min(1, scrollY / maxScroll));
    }

    function updatePalette() {
      const palette = palettes[theme()];
      ambient.color.copy(palette.ambient);
      ambient.groundColor.copy(palette.ground);
      flowerLight.color.set(palette.flower);
      underwaterLight.color.set(palette.water);
      flowerMaterialsUpdate(palette);

      if (heroBloomMaterials.dark) heroBloomMaterials.dark.visible = theme() === "dark";
      if (heroBloomMaterials.light) heroBloomMaterials.light.visible = theme() === "light";
      if (lotusDarkPlane) lotusDarkPlane.visible = theme() === "dark";
      if (lotusLightPlane) lotusLightPlane.visible = theme() === "light";
      if (waterDarkPlane) waterDarkPlane.visible = theme() === "dark";
      if (waterLightPlane) waterLightPlane.visible = theme() === "light";
      if (raysDarkPlane) raysDarkPlane.visible = theme() === "dark";
      if (raysLightPlane) raysLightPlane.visible = theme() === "light";
    }

    function flowerMaterialsUpdate(palette) {
      outerPetalMaterial.color.set(palette.flower);
      middlePetalMaterial.color.set(palette.flower).multiplyScalar(0.91);
      innerPetalMaterial.color.set(palette.innerPetal);
    }

    function resize() {
      mobile = mobileQuery.matches;

      camera.aspect = innerWidth / Math.max(1, innerHeight);
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1 : 1.5));
      renderer.setSize(innerWidth, innerHeight);

      particleMaterial.size = mobile ? 0.035 : 0.05;
      particleMaterial.opacity = mobile ? 0.42 : 0.65;
    }

    function pointerMove(event) {
      if (mobile || reducedMotion) return;
      pointerX = (event.clientX / innerWidth - 0.5) * 2;
      pointerY = (event.clientY / innerHeight - 0.5) * 2;
    }

    function animate(timestamp = performance.now()) {
      if (disposed || !visible) return;

      frameId = requestAnimationFrame(animate);

      if (mobile && timestamp - lastFrame < 1000 / 30) return;
      lastFrame = timestamp;

      const time = timestamp * 0.001;
      const easing = reducedMotion ? 0.12 : 0.035;

      depth += (targetDepth - depth) * easing;

      const palette = palettes[theme()];
      scene.fog.color.copy(palette.surface).lerp(palette.deep, depth);
      scene.fog.density = 0.009 + depth * 0.025;

      flowerLight.intensity = (theme() === "light" ? 13 : 24) *
        (1 - depth * 0.65);
      underwaterLight.intensity = (theme() === "light" ? 8 : 12) +
        depth * 14;

      canvas.style.opacity = String(
        palette.opacity + depth * (mobile ? 0.18 : 0.3)
      );

      // Flower remains prominent at the hero and gently recedes with scrolling.
      flower.visible = depth < 0.86;
      flower.scale.setScalar(1 - depth * 0.22);
      flower.rotation.z = reducedMotion ? 0 : Math.sin(time * 0.16) * 0.022;

      if (!reducedMotion) {
        smoothX += (pointerX - smoothX) * 0.025;
        smoothY += (pointerY - smoothY) * 0.025;

        camera.position.x = mobile ? 0 : smoothX * 0.16;
        camera.position.y = 0.25 - depth * 2.4 + (mobile ? 0 : smoothY * 0.08);

        flowerPetals.forEach(petal => {
          petal.rotation.z =
            petal.userData.baseRotationZ +
            Math.sin(time * 0.3 + petal.userData.phase) * 0.006;
        });

        bloom.position.y = 0.55 + Math.sin(time * 0.55) * 0.025;

        lotusPads.forEach(pad => {
          pad.position.y =
            pad.userData.baseY +
            Math.sin(time * 0.4 + pad.userData.phase) * 0.025;

          pad.rotation.z =
            pad.userData.baseRotationZ +
            Math.sin(time * 0.24 + pad.userData.phase) * 0.018;
        });

        lotusPetals.forEach(petal => {
          petal.rotation.z =
            petal.userData.baseRotationZ +
            Math.sin(time * 0.3 + petal.userData.phase) * 0.006;
        });
      }

      lotus.visible = depth > 0.76;
      lotus.rotation.y = reducedMotion ? 0 : Math.sin(time * 0.16) * 0.025;

      camera.position.z = 10 - depth * 1.6;
      camera.lookAt(0, -depth * 1.1, 0);

      renderer.render(scene, camera);
    }

    addListener(window, "scroll", calculateScrollDepth, { passive: true });
    addListener(window, "resize", resize, { passive: true });
    addListener(window, "pointermove", pointerMove, { passive: true });
    addListener(document, "visibilitychange", () => {
      visible = !document.hidden;

      if (visible && !frameId) {
        lastFrame = 0;
        animate();
      } else if (!visible) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }
    });

    themeObserver = new MutationObserver(updatePalette);
    themeObserver.observe(root, {
      attributes: true,
      attributeFilter: ["data-resume-theme"]
    });

    if (document.body) {
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-resume-theme"]
      });
    }

    disposers.push(() => themeObserver.disconnect());

    resizeObserver = "ResizeObserver" in window
      ? new ResizeObserver(calculateScrollDepth)
      : null;

    resizeObserver?.observe(document.documentElement);
    if (resizeObserver) disposers.push(() => resizeObserver.disconnect());

    addListener(mobileQuery, "change", resize);

    updatePalette();
    resize();
    calculateScrollDepth();
    animate();

    window[FEATURE_KEY] = {
      loading: false,
      destroy() {
        if (disposed) return;
        disposed = true;

        cancelAnimationFrame(frameId);
        disposers.forEach(dispose => dispose());

        scene.traverse(object => {
          object.geometry?.dispose?.();

          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material?.dispose?.();
          }
        });

        renderer.dispose();
        canvas.remove();
        document.getElementById(CSS_ID)?.remove();
        delete window[FEATURE_KEY];
      },
      refresh: calculateScrollDepth
    };

    window.dispatchEvent(new CustomEvent("enova-3d-ready", {
      detail: { message: "3D scene initialized. Textures loaded where available." }
    }));
    console.info("[EasternNova] Textured 3D resume initialized.");
  } catch (error) {
    canvas.remove();
    document.getElementById(CSS_ID)?.remove();
    delete window[FEATURE_KEY];

    window.dispatchEvent(new CustomEvent("enova-3d-ready", {
      detail: { message: "3D initialization failed: " + (error?.message || String(error)) }
    }));
    console.error(
      "[EasternNova] Three.js could not initialize. Check the network and WebGL support.",
      error
    );
  }
}
