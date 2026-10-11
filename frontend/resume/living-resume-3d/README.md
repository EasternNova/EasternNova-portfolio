# EasternNova Living Resume — Textured 3D Preview

This package is an integration preview built from the current uploaded Living Resume code and the generated asset pack.

## Files
- `living-resume-3d.html` — standalone preview page
- `living-resume-3d.js` — Three.js scene with image-textured hero bloom, textured Contact lotus, petal texture, lily-pad texture, water-surface and light-ray overlays
- `living-resume-3d.css` — canvas layering and depth tint
- `assets/` — image textures used by the scene
- `manifest.json` — asset sizes and extraction notes
- `three-texture-loader.example.js` — separate example loader

## Test locally
1. Extract this folder into your project at `frontend/resume/living-resume-3d/`, or copy the files and `assets/` into that folder.
2. Ensure the `living-resume-3d.html`, `living-resume-3d.js`, `living-resume-3d.css`, and `assets/` are siblings.
3. Run your existing Vite server.
4. Open `http://localhost:3000/resume/living-resume-3d/living-resume-3d.html`.
5. Open DevTools Console if a texture or Three.js module fails to load.

The standalone HTML imports `./living-resume-3d.js`. The JS automatically loads `./living-resume-3d.css` and the texture files under `./assets/`.

## Main resume integration
Keep your existing resume HTML and script tag:
```html
<script type="module" src="./living-resume-3d/living-resume-3d.js"></script>
```
For the main resume, place the feature files in `frontend/resume/living-resume-3d/` and the test page in that same folder.

## Important quality note
The asset pack was extracted from a generated contact sheet, so the cutouts have approximate transparency and are not original high-resolution isolated source assets. Some image edges/background tint may be visible. This package is meant to verify the texture-loading and rendering pipeline; refine or replace those assets before production.
