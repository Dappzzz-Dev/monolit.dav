# UI Modules

Each module owns one markup seam and exposes only the behavior its controller
needs.

## Project modal

- `project-modal.js` mounts the shared modal markup.
- `project-modal.min.js` is the production bundle loaded by `index.html`.
- Desktop uses the base `.modal-*` rules in `css/style.css`.
- Mobile uses the `@media (max-width: 900px)` bottom-sheet rules in the same
  stylesheet, so both layouts stay on one semantic modal and cannot drift.
- `projects.js` owns project data, open/close behavior, focus restoration, and
  carousel coordination.
