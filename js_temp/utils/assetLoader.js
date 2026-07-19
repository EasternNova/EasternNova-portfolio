export const FRAME_SEQUENCES = {
  idle: {
    path: '/assets/AVATAR_360_FRAME',
    prefix: 'frame_',
    count: 109, // frame_000 -> frame_108
    ext: 'png',
  },

  run: {
    path: '/assets/EXTRA_Assets_Future/FRAMES/1-RUN',
    prefix: 'frame_',
    count: 49,
    ext: 'png',
  },

  catch: {
    path: '/assets/EXTRA_Assets_Future/FRAMES/2-CATCH',
    prefix: 'frame_',
    count: 49,
    ext: 'png',
  },

  dribble: {
    path: '/assets/EXTRA_Assets_Future/FRAMES/3-DRIBBLE',
    prefix: 'frame_',
    count: 49,
    ext: 'png',
  },

  hookshot1: {
    path: '/assets/EXTRA_Assets_Future/FRAMES/4-HOOK SHOT 1',
    prefix: 'frame_',
    count: 36,
    ext: 'png',
  },

  hookshot2: {
    path: '/assets/EXTRA_Assets_Future/FRAMES/5-HOOK SHOT 2',
    prefix: 'frame_',
    count: 49,
    ext: 'png',
  },

  leaving: {
    path: '/assets/EXTRA_Assets_Future/FRAMES/7-LEAVING',
    prefix: 'frame_',
    count: 49,
    ext: 'png',
  },
};

const cache = {};

function frameFilename(prefix, index, ext) {
  return `${prefix}${String(index).padStart(3, "0")}.${ext}`;
}

export async function loadSequence(key) {

  if (cache[key]) return cache[key];

  const seq = FRAME_SEQUENCES[key];

  if (!seq) {
    throw new Error(`Unknown sequence ${key}`);
  }

  const frames = [];

  await Promise.all(

    Array.from({ length: seq.count }, (_, i) => {

      return new Promise((resolve) => {

        const img = new Image();

        img.onload = () => {
          frames[i] = img;
          resolve();
        };

        img.onerror = () => {
          console.warn("Missing:", frameFilename(seq.prefix, i, seq.ext));
          resolve();
        };

        img.src =
          `${seq.path}/${frameFilename(seq.prefix, i, seq.ext)}`;

      });

    })

  );

  cache[key] = frames;

  return frames;
}

export function getSequence(key) {
  return cache[key] || [];
}

export async function loadAll(onProgress) {

  const keys = Object.keys(FRAME_SEQUENCES);

  let loaded = 0;

  for (const key of keys) {

    await loadSequence(key);

    loaded++;

    onProgress?.(loaded, keys.length);

  }

}