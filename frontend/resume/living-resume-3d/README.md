# EasternNova Living Resume — Integration Folder

This ZIP contains the folder `living-resume-3d/`, designed to sit beside your current `resume.html`.

## Exact destination for your project

Your resume is at:

`G:\EasternNova\EasternNova-portfolio\frontend\resume\resume.html`

Extract this ZIP so the files land here:

```text
G:\EasternNova\EasternNova-portfolio\frontend\resume\
├── resume.html
└── living-resume-3d\
    ├── living-resume-3d.js
    ├── living-resume-3d.css
    ├── README.md
    └── assets\
        ├── floral-dark.png
        └── floral-light.png
```

If you already deleted the old `living-resume-3d` folder, that is fine. Extract this ZIP into `frontend\resume\`. If Windows asks to merge/replace, only replace the old feature folder.

## One line to add to `resume.html`

Add this immediately before the closing `</body>` tag:

```html
<script type="module" src="./living-resume-3d/living-resume-3d.js"></script>
```

Do not add another copy if this exact script line already exists.

## Important notes

- The script expects the resume's existing theme switch to set `data-resume-theme="dark"` or `"light"` on the `<html>` element, matching the code you shared.
- It tries to attach the original flower artwork to `.resume-home` / `#resume-home`, and detects common resume section IDs for gentle section reveals.
- Three.js loads from jsDelivr, so internet access is required for the 3D scene. If it cannot load, the original floral layer still works.
- This is an additive feature. It does not rewrite your resume HTML content, navigation, or layout. Its 3D scene is an atmospheric overlay; the lotus silhouette appears late in the scroll as a concept.
- Please test with a local server and verify your existing theme button and mobile layout before committing.

## Preview

From `G:\EasternNova\EasternNova-portfolio\frontend\resume`, run:

```powershell
python -m http.server 8080
```

Then open `http://localhost:8080/resume.html`.

If port 8080 is already serving another folder, stop that server with `Ctrl+C` first.
