/*
 * Example only: adapt these loaders into living-resume-3d.js after your scene exists.
 * Place the generated assets folder beside this file.
 */
import * as THREE from "three";

const textureLoader = new THREE.TextureLoader();
const assetUrl = (name) => new URL(`./assets/${name}`, import.meta.url).href;

export function loadResumeTextures() {
  const names = [
    "bloom-dark.png", "bloom-light.png",
    "lotus-dark.png", "lotus-light.png",
    "petal-01.png", "petal-02.png", "petal-03.png",
    "petal-04.png", "petal-05.png",
    "lily-pad-large.png", "lily-pad-small.png",
    "stem.png", "root-cluster.png",
    "water-surface-dark.png", "water-surface-light.png",
    "light-rays-dark.png", "light-rays-light.png",
    "bubbles.png", "particles-mixed.png",
    "particles-pink.png", "particles-blue.png",
    "underwater-bg-dark.png", "underwater-bg-light.png",
    "bloom-glow.png", "soft-light.png", "sparkles.png"
  ];

  return Promise.all(names.map(name => new Promise((resolve, reject) => {
    textureLoader.load(
      assetUrl(name),
      texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        resolve([name, texture]);
      },
      undefined,
      reject
    );
  }))).then(entries => Object.fromEntries(entries));
}

// Example usage:
// const textures = await loadResumeTextures();
// const material = new THREE.MeshBasicMaterial({
//   map: textures["petal-01.png"],
//   transparent: true,
//   alphaTest: 0.04,
//   depthWrite: false,
//   side: THREE.DoubleSide
// });
// Use this material on a curved THREE.Mesh petal geometry.
