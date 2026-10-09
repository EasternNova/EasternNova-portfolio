# EasternNova — Living Resume floral feature (fixed)

## Why this version is corrected

- Uses the actual theme attribute in the supplied resume: `data-resume-theme`.
- Finds the existing hero using `#resume-home.resume-home` or `.resume-home`.
- Loads and pre-checks the CSS and image URLs, then logs success or a useful error in DevTools Console.
- Keeps the flowers decorative and behind the existing hero text.
- Keeps the feature isolated in this folder; no existing resume files are replaced.

## Install

1. Keep this folder named `living-resume-3d` beside the existing `resume.html`.
2. The expected structure is:

   resume-folder/
   - resume.html
   - resume.css
   - resume.js
   - living-resume-3d/
     - living-resume-3d.js
     - living-resume-3d.css
     - assets/
       - floral-dark.png
       - floral-light.png

3. In `resume.html`, keep one feature script immediately before `</body>`:

   ```html
   <script type="module" src="./living-resume-3d/living-resume-3d.js"></script>
   ```

4. Save and hard-refresh the resume (`Ctrl + Shift + R`).

## Verify

Open DevTools → Console. A successful load prints:

`[Living Resume] Floral feature loaded.`

If the feature still fails, the Console will identify the missing hero, CSS, or image URL. Check DevTools → Network for 404 errors on files under `living-resume-3d`.

## Rollback

Remove only the single `living-resume-3d.js` script line from `resume.html`. The original resume files are untouched.
