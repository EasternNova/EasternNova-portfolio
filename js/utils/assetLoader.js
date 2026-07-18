// JS/utils/assetLoader.js

export const FRAME_SEQUENCES = {
  idle: {},
};

const cache = {};

// Import every PNG inside AVATAR_360_FRAME
const frameModules = import.meta.glob(
  "../../assets/AVATAR_360_FRAME/*.png",
  {
    eager: true,
    import: "default",
  }
);

// Sort by filename (frame_000 -> frame_001 -> ...)
const frameUrls = Object.entries(frameModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url);

export async function loadSequence(key) {
  if (key !== "idle") {
    console.warn(`[assetLoader] Unknown sequence: ${key}`);
    return [];
  }

  if (cache.idle) return cache.idle;

  const frames = await Promise.all(
    frameUrls.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = () => {
          console.warn("[assetLoader] Failed:", src);
          resolve(img);
        };

        img.src = src;
      });
    })
  );

  cache.idle = frames;

  console.log(
    `[assetLoader] Loaded ${frames.length} idle frames`
  );

  return frames;
}

export function getSequence(key) {
  return cache[key] || [];
}

export async function loadAll(onProgress) {
  await loadSequence("idle");

  if (onProgress) {
    onProgress(1, 1);
  }
}